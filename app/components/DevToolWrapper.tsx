'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import CDKFlowDevTool from '../cdk-flows/CDKFlowDevTool'
import IframeDisplay from './IframeDisplay'
import ChallengeControls from './ChallengeControls'
import SessionControls from './SessionControls'
import EventsTraffic from './EventsTraffic'
import { AddEventMethod, EventLog, RequestType } from '../cdk-flows/types'

interface ApiKeyStatus {
  isConfigured: boolean
  apiUrl: string
}

interface DevToolWrapperProps {
  apiKeyStatus: ApiKeyStatus
}

export default function DevToolWrapper({ apiKeyStatus }: DevToolWrapperProps) {
  const [iframeUrl, setIframeUrl] = useState('')
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [eventLogs, setEventLogs] = useState<EventLog[]>([])
  // Store the addEvent function using useRef to avoid re-renders
  const addEventFnRef = useRef<AddEventMethod | undefined>(undefined)
  // Store refs to event handler functions from CDKFlowDevTool
  const downloadEventLogRef = useRef<(() => void) | undefined>(undefined)
  const clearLogsRef = useRef<(() => void) | undefined>(undefined)
  const copyEventRef = useRef<((event: EventLog) => void) | undefined>(undefined)

  // Create a stable event handler function with useCallback
  const addEvent = useCallback((event: string, type?: any, details?: unknown) => {
    if (addEventFnRef.current) {
      addEventFnRef.current(event, type || 'info', details)
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
      // Verify the message is from a k-id.com domain for security
      if (new URL(event.origin).hostname === 'k-id.com' || new URL(event.origin).hostname.endsWith('.k-id.com')) {
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
   * Callback to handle when a new CDK flow URL is received from the API.
   * 
   * This is called after performCDKFlow() successfully returns a URL from the
   * k-ID API. The URL is then embedded in the IframeDisplay component.
   * 
   * @param url - The CDK flow URL returned from the API response
   * 
   */
  const handleIframeUrlUpdate = (url: string) => {
    setIframeUrl(url)
    // Reset information when iframe URL changes
    setChallengeId(null)
    setSessionId(null)
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
          onAddEvent={handleAddEvent}
          onEventLogsChange={handleEventLogsChange}
          onDownloadEventLogRef={(fn) => { downloadEventLogRef.current = fn; }}
          onClearLogsRef={(fn) => { clearLogsRef.current = fn; }}
          onCopyEventRef={(fn) => { copyEventRef.current = fn; }}
        />
      </div>

      {/* Middle Column - Iframe */}
      <div className="flex flex-col gap-4">
        <IframeDisplay iframeUrl={iframeUrl} />
        <ChallengeControls challengeId={challengeId} apiKeyStatus={apiKeyStatus} addEvent={addEvent} />
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

