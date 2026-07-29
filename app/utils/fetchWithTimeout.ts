/**
 * fetch() with an AbortController-based timeout.
 *
 * Node's fetch has no default request timeout, so a stalled upstream (a server
 * that accepts the connection but never responds) would hang the caller — and,
 * for a server action, the client `await` — indefinitely. Wrapping fetch with a
 * timeout turns a stall into a clear, catchable error so the UI can recover
 * (spinner clears, error is logged) instead of getting stuck.
 *
 * @param url - request URL
 * @param options - standard fetch options (a `signal` here is overridden)
 * @param timeoutMs - abort after this many ms (default 15s)
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 15000,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`)
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}
