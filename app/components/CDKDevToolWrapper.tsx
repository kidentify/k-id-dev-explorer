'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import CDKFlowDevTool from '../cdk-flows/CDKFlowDevTool'
import IframeDisplay from './IframeDisplay'
import ChallengeControls from './ChallengeControls'
import SessionControls from './SessionControls'
import EventLogDisplay from './EventLogDisplay'
import { AddEventMethod, EventLog, RequestType } from '../cdk-flows/types'

interface ApiKeyStatus {
  isConfigured: boolean
  apiUrl: string
}

interface CDKDevToolWrapperProps {
  apiKeyStatus: ApiKeyStatus
}

export default function CDKDevToolWrapper({ apiKeyStatus }: CDKDevToolWrapperProps) {
  const [iframeUrl, setIframeUrl] = useState('')
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  // Store the addEvent function using useRef to avoid re-renders
  const addEventFnRef = useRef<AddEventMethod | undefined>(undefined)

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

  useEffect(() => {
    // Listen for messages from the iframe
    const handleMessage = (event: MessageEvent) => {
      if (new URL(event.origin).hostname === 'k-id.com' || new URL(event.origin).hostname.endsWith('.k-id.com')) {
        try {
          // Check for challengeId in the message
          if (event.data?.data?.challengeId !== undefined) {
            const challengeId = event.data.data.challengeId
            setChallengeId(challengeId)
          }

          // Check for sessionId in the message
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

  const handleIframeUrlUpdate = (url: string) => {
    setIframeUrl(url)
    // Reset information when iframe URL changes
    setChallengeId(null)
    setSessionId(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - All Configuration and Form Elements */}
      <div>
        <CDKFlowDevTool
          onIframeUrlUpdate={handleIframeUrlUpdate}
          apiKeyStatus={apiKeyStatus}
          onAddEvent={handleAddEvent}
        />
      </div>

      {/* Right Column - Iframe Only */}
      <div className="flex flex-col gap-4">
        <IframeDisplay iframeUrl={iframeUrl} />
        <ChallengeControls challengeId={challengeId} apiKeyStatus={apiKeyStatus} addEvent={addEvent} />
        <SessionControls sessionId={sessionId} apiKeyStatus={apiKeyStatus} addEvent={addEvent} />
      </div>
    </div>
  )
}
