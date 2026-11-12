import type { HighlighterCore } from 'shiki/core'
import type { HighlightRequest, HighlightResponse } from './messages'
import typescript from '@shikijs/langs/typescript'
import githubDark from '@shikijs/themes/github-dark'
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

declare const self: DedicatedWorkerGlobalScope

let highlighter: Promise<HighlighterCore> | undefined

self.addEventListener('message', async ({ data }: MessageEvent<HighlightRequest>) => {
  const { id, code } = data
  let response: HighlightResponse

  try {
    highlighter ??= createHighlighterCore({
      themes: [githubDark],
      langs: [typescript],
      engine: createJavaScriptRegexEngine(),
    })
    const instance = await highlighter
    const html = instance.codeToHtml(code, { lang: 'typescript', theme: 'github-dark' })
    response = { id, html }
  }
  catch (error) {
    const message = error instanceof Error
      ? error.message
      : String(error)
    response = { id, error: message }
  }

  self.postMessage(response)
})
