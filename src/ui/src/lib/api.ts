// The only module that knows the backend's URLs. Screens call these functions and catch errors.
import type { JobInput, SessionResponse } from '../types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

/** Turns a FastAPI error body into one readable message. */
async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json()
    // HTTPException: { detail: "Session not found" }
    if (typeof body.detail === 'string') return body.detail
    // Validation error (422): { detail: [{ loc, msg, type }, ...] }
    if (Array.isArray(body.detail) && body.detail.length > 0) return String(body.detail[0].msg).replace(/^Value error, /, '')
  } catch {
    // Body was not JSON, e.g. a proxy error page.
  }
  return `Request failed (${res.status})`
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, init)
  } catch {
    // fetch only rejects when no response arrived: server down, wrong URL, or blocked by CORS.
    throw new Error("Can't reach the server. Check that the API is running.")
  }
  if (!res.ok) throw new Error(await errorMessage(res))
  return res.json() as Promise<T>
}

export function createSession(job: JobInput): Promise<SessionResponse> {
  return request<SessionResponse>('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(job),
  })
}
