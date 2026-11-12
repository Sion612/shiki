import type { HighlightRequest, HighlightResponse } from './messages'

const worker = new Worker(new URL('./shiki-worker.mts', import.meta.url), { type: 'module' })
const pending = new Map<number, { resolve: (html: string) => void, reject: (error: Error) => void }>()
let nextId = 0
let workerError: Error | undefined

worker.addEventListener('message', ({ data }: MessageEvent<HighlightResponse>) => {
  const request = pending.get(data.id)
  if (!request)
    return

  pending.delete(data.id)
  if ('error' in data)
    request.reject(new Error(data.error))
  else
    request.resolve(data.html)
})

worker.addEventListener('error', (event) => {
  workerError = new Error(event.message || 'Unable to run the highlighting worker')
  for (const request of pending.values())
    request.reject(workerError)
  pending.clear()
  worker.terminate()
})

export function highlight(code: string): Promise<string> {
  if (workerError)
    return Promise.reject(workerError)

  const request: HighlightRequest = { id: nextId++, code }
  return new Promise((resolve, reject) => {
    pending.set(request.id, { resolve, reject })
    worker.postMessage(request)
  })
}

const form = document.querySelector<HTMLFormElement>('#highlight')!
const code = document.querySelector<HTMLTextAreaElement>('#code')!
const output = document.querySelector<HTMLDivElement>('#output')!
const button = form.querySelector('button')!

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  button.disabled = true
  output.textContent = 'Highlighting…'
  try {
    output.innerHTML = await highlight(code.value)
  }
  catch (error) {
    output.textContent = String(error)
  }
  finally {
    button.disabled = false
  }
})
