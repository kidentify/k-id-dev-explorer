'use client'

import { useState } from 'react'
import { getSessionStatus } from '../cdk-flows/serverActions'
import { RequestType } from '../cdk-flows/types'

interface ApiKeyStatus {
  isConfigured: boolean
  apiUrl: string
}

interface SessionControlsProps {
  sessionId: string | null
  apiKeyStatus: ApiKeyStatus
  addEvent?: (event: string, type?: RequestType, details?: unknown) => void
}

export default function SessionControls({ sessionId, apiKeyStatus, addEvent }: SessionControlsProps) {
  const [sessionStatus, setSessionStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchSessionStatus = async () => {
    if (!sessionId || !apiKeyStatus.isConfigured) return

    setIsLoading(true)
    setSessionStatus(null)

    // Log the request attempt
    addEvent?.('api-request', RequestType.REQUEST, {
      method: 'GET',
      url: `${apiKeyStatus.apiUrl}/api/v1/session/get?sessionId=${encodeURIComponent(sessionId)}`,
    })

    try {
      const result = await getSessionStatus(sessionId)

      if (result.success) {
        setSessionStatus(JSON.stringify(result.data, null, 2))
        // Log successful response
        addEvent?.('api-response', RequestType.RESPONSE, {
          success: true,
          responseData: result.data,
          url: `${apiKeyStatus.apiUrl}/api/v1/session/get?sessionId=${encodeURIComponent(sessionId)}`,
        })
      } else {
        setSessionStatus('Error: ' + (result.error || 'Unknown error'))
        // Log error response
        addEvent?.('api-error', RequestType.ERROR, {
          error: result.error,
          requestData: result.requestData,
        })
      }
    } catch (error) {
      setSessionStatus('Error: Failed to fetch session status')
      console.error('Error fetching session status:', error)
      // Log exception
      addEvent?.('api-error', RequestType.ERROR, {
        error: error instanceof Error ? error.message : 'Unknown error',
        url: `${apiKeyStatus.apiUrl}/api/v1/session/get?sessionId=${encodeURIComponent(sessionId)}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!sessionId) return null

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Controls</h2>
      <div className="mb-4">
        <p className="text-sm text-gray-600 flex items-center gap-2">
          Session ID: <span className="font-mono">{sessionId}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(sessionId).then(() => {
                console.log('Session ID copied to clipboard')
              }).catch((err) => {
                console.error('Failed to copy session ID:', err)
              })
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Copy Session ID"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </p>
      </div>

      <div className="flex flex-row gap-3">
        <button
          onClick={fetchSessionStatus}
          disabled={isLoading || !apiKeyStatus.isConfigured}
          className={`px-4 py-2 rounded-md text-white font-medium flex items-center gap-2 ${
            !apiKeyStatus.isConfigured
              ? 'bg-gray-400 cursor-not-allowed'
              : isLoading
                ? 'bg-purple-400 cursor-wait'
                : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Checking...
            </>
          ) : (
            'Get Session'
          )}
        </button>
      </div>

      {sessionStatus && (
        <pre
          className={`mt-4 p-3 rounded-md ${
            sessionStatus.startsWith('Error')
              ? 'bg-red-50 text-xs text-red-700 border border-red-200'
              : 'bg-green-50 text-xs text-green-700 border border-green-200'
          }`}
        >
          {sessionStatus}
        </pre>
      )}
    </div>
  )
}
