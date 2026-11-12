export interface HighlightRequest {
  id: number
  code: string
}

export type HighlightResponse
  = | { id: number, html: string }
    | { id: number, error: string }
