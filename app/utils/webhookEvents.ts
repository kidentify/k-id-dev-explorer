'use client'

/**
 * Shared client-side connection to the webhook SSE stream (/api/webhook/events).
 *
 * Multiple components need these events (the event log, the challenge/session
 * id capture, the iframe pass/fail overlay). Opening a separate EventSource in
 * each would hold several long-lived HTTP/1.1 connections to the same origin
 * and starve the browser's ~6-per-origin connection pool — making unrelated
 * requests (server actions, polls) intermittently stall. Instead, every
 * consumer subscribes to this single shared EventSource.
 *
 * The connection is opened lazily on the first subscriber and closed once the
 * last one unsubscribes.
 */

type MessageListener = (data: unknown) => void
type ErrorListener = () => void

let source: EventSource | null = null
const messageListeners = new Set<MessageListener>()
const errorListeners = new Set<ErrorListener>()

function open() {
  if (source || typeof window === 'undefined') return
  source = new EventSource('/api/webhook/events')
  source.onmessage = (evt) => {
    let parsed: unknown
    try {
      parsed = JSON.parse(evt.data)
    } catch {
      return // ignore non-JSON frames / heartbeats
    }
    messageListeners.forEach((listener) => listener(parsed))
  }
  source.onerror = () => {
    errorListeners.forEach((listener) => listener())
  }
}

function closeIfIdle() {
  if (source && messageListeners.size === 0 && errorListeners.size === 0) {
    source.close()
    source = null
  }
}

/**
 * Subscribe to the shared webhook event stream. `onMessage` receives each
 * parsed SSE payload (e.g. `{ type: 'webhook', data: {...} }`); consumers
 * filter by `type` themselves. Returns an unsubscribe function.
 */
export function subscribeWebhookEvents(
  onMessage: MessageListener,
  onError?: ErrorListener,
): () => void {
  open()
  messageListeners.add(onMessage)
  if (onError) errorListeners.add(onError)

  return () => {
    messageListeners.delete(onMessage)
    if (onError) errorListeners.delete(onError)
    closeIfIdle()
  }
}
