'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import CDKFlowDevTool from '../cdk-flows/CDKFlowDevTool'
import IframeDisplay from './IframeDisplay'
import ChallengeControls from './ChallengeControls'
import SessionControls from './SessionControls'
import EventsTraffic from './EventsTraffic'
import { AddEventMethod, EventDetails, EventLog, RequestType } from '../cdk-flows/types'
import { subscribeWebhookEvents } from '../utils/webhookEvents'

interface ApiKeyStatus {
  isConfigured: boolean
  apiUrl: string
}

interface DevToolWrapperProps {
  apiKeyStatus: ApiKeyStatus
}

export default function DevToolWrapper({ apiKeyStatus }: DevToolWrapperProps) {
  const [iframeUrl, setIframeUrl] = useState('')
  const [shortUrl, setShortUrl] = useState<string | undefined>(undefined)
  const [verificationId, setVerificationId] = useState<string | undefined>(undefined)
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [challengeType, setChallengeType] = useState<string | undefined>(undefined)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [eventLogs, setEventLogs] = useState<EventLog[]>([])
  // Store the addEvent function using useRef to avoid re-renders
  const addEventFnRef = useRef<AddEventMethod | undefined>(undefined)
  // Store refs to event handler functions from CDKFlowDevTool
  const downloadEventLogRef = useRef<(() => void) | undefined>(undefined)
  const clearLogsRef = useRef<(() => void) | undefined>(undefined)
  const copyEventRef = useRef<((event: EventLog) => void) | undefined>(undefined)

  // Create a stable event handler function with useCallback
  const addEvent = useCallback((event: string, type?: string, details?: EventDetails) => {
    if (addEventFnRef.current) {
      addEventFnRef.current(event, (type as RequestType) || RequestType.INFO, details)
    }
  }, [])

  // Callback to receive addEvent function from CDKFlowDevTool
  const handleAddEvent = useCallback((fn: AddEventMethod) => {
    addEventFnRef.current = fn
  }, [])

  /**
   * Listen for postMessage events from the embedded CDK flow iframe.
   *
   * The k-ID CDK flow iframe sends postMessage events to communicate with the
   * parent page. These messages can contain challengeId, sessionId, and other
   * verification state information.
   *
   * This is important for:
   * - Tracking verification progress
   * - Querying challenge/session status
   * - Handling verification completion
   *
   */
  useEffect(() => {
    // Listen for messages from the iframe
    // The iframe sends postMessage events during the verification process
    // Documentation: https://docs.k-id.com/docs/cdk/postmessage
    const handleMessage = (event: MessageEvent) => {
      // Verify the message is from a trusted CDK iframe origin (k-id.com, ageapi.org) for security
      const hostname = new URL(event.origin).hostname
      if (
        hostname === 'localhost' ||
        hostname.endsWith('.k-id.com') ||
        hostname === 'ageapi.org' ||
        hostname.endsWith('.ageapi.org')
      ) {
        try {
          // Extract challengeId from the message
          // The challengeId can be used to query verification status via the API
          if (event.data?.data?.challengeId !== undefined) {
            const challengeId = event.data.data.challengeId
            setChallengeId(challengeId)
          }

          // Extract sessionId from the message
          // The sessionId can be used to query session status via the API
          if (event.data?.data?.sessionId !== undefined) {
            const sessionId = event.data.data.sessionId
            setSessionId(sessionId)
          }
        } catch (error) {
          console.error('Error parsing message from iframe:', error)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  /**
   * Subscribe to the shared webhook SSE stream so completions that arrive via
   * webhook (rather than iframe postMessage) still populate challengeId /
   * sessionId. This is what surfaces the session after a CDK Custom Age Gate
   * Check challenge completes on the user's phone — the widget can't post to
   * us, but Compliance Studio's webhook can.
   */
  useEffect(() => {
    return subscribeWebhookEvents((payload) => {
      const parsed = payload as { type?: string; data?: { body?: Record<string, unknown> } }
      if (parsed?.type !== 'webhook') return
      const body = parsed.data?.body
      if (!body || typeof body !== 'object') return
      const eventType = (body.eventType ?? body.type) as string | undefined
      const data = (body.data ?? {}) as Record<string, unknown>
      // Look for challengeId in common locations.
      const candidateChallengeId =
        (body.challengeId as string | undefined) ??
        (data.challengeId as string | undefined) ??
        (eventType && /challenge/i.test(eventType) ? (data.id as string | undefined) : undefined)
      if (typeof candidateChallengeId === 'string' && candidateChallengeId) {
        setChallengeId(candidateChallengeId)
      }
      // sessionId can come nested under `data` on any completion event
      // (Verification.Result / Challenge.StateChange / Session.*).
      const candidateSessionId =
        (body.sessionId as string | undefined) ??
        (data.sessionId as string | undefined) ??
        (eventType && /session/i.test(eventType) ? (data.id as string | undefined) : undefined)
      if (typeof candidateSessionId === 'string' && candidateSessionId) {
        setSessionId(candidateSessionId)
      }
    })
  }, [])

  /**
   * Callback to handle when a new CDK flow URL is received from the API.
   *
   * This is called after performCDKFlow() successfully returns a URL from the
   * k-ID API. The URL is then embedded in the IframeDisplay component.
   *
   * @param url - The CDK flow URL returned from the API response
   *
   */
  const handleIframeUrlUpdate = (
    url: string,
    newShortUrl?: string,
    newVerificationId?: string,
    newChallengeId?: string,
    newSessionId?: string,
    newChallengeType?: string,
  ) => {
    setIframeUrl(url)
    setShortUrl(newShortUrl)
    setVerificationId(newVerificationId)
    // Seed challenge / session ids from the response body for server-side CDK
    // Custom flows (Age Gate Check); otherwise clear so ChallengeControls /
    // SessionControls unmount and reset.
    setChallengeId(newChallengeId ?? null)
    setChallengeType(newChallengeType)
    setSessionId(newSessionId ?? null)
  }

  // Event handlers for EventsTraffic component
  const handleEventLogsChange = useCallback((logs: EventLog[]) => {
    setEventLogs(logs)
  }, [])

  const handleDownloadEventLog = useCallback(() => {
    downloadEventLogRef.current?.()
  }, [])

  const handleClearLogs = useCallback(() => {
    clearLogsRef.current?.()
  }, [])

  const handleCopyEvent = useCallback((event: EventLog) => {
    copyEventRef.current?.(event)
  }, [])


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Form and Configuration */}
      <div>
        <CDKFlowDevTool
          onIframeUrlUpdate={handleIframeUrlUpdate}
          apiKeyStatus={apiKeyStatus}
          currentSessionId={sessionId}
          onAddEvent={handleAddEvent}
          onEventLogsChange={handleEventLogsChange}
          onDownloadEventLogRef={(fn) => { downloadEventLogRef.current = fn; }}
          onClearLogsRef={(fn) => { clearLogsRef.current = fn; }}
          onCopyEventRef={(fn) => { copyEventRef.current = fn; }}
        />
      </div>

      {/* Middle Column - Iframe */}
      <div className="flex flex-col gap-4">
        <IframeDisplay
          iframeUrl={iframeUrl}
          shortUrl={shortUrl}
          verificationId={verificationId}
          challengeId={challengeId}
          addEvent={addEvent}
        />
        <ChallengeControls challengeId={challengeId} challengeType={challengeType} apiKeyStatus={apiKeyStatus} addEvent={addEvent} />
        <SessionControls sessionId={sessionId} apiKeyStatus={apiKeyStatus} addEvent={addEvent} />
      </div>

      {/* Right Column - Events & API Traffic */}
      <div className="flex flex-col">
        <EventsTraffic
          eventLogs={eventLogs}
          onDownload={handleDownloadEventLog}
          onClear={handleClearLogs}
          onCopy={handleCopyEvent}
        />
      </div>
    </div>
  )
}

