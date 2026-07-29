'use client'

import { useState } from 'react'
import { getChallengeStatus, sendChallengeEmail } from '../cdk-flows/serverActions'
import { EventDetails, RequestType } from '../cdk-flows/types'

interface ApiKeyStatus {
  isConfigured: boolean
  apiUrl: string
}

interface ChallengeControlsProps {
  challengeId: string | null
  /** The challenge type (e.g. CHALLENGE_SESSION_UPGRADE_BY_AGE_ASSURANCE), when known. */
  challengeType?: string
  apiKeyStatus: ApiKeyStatus
  addEvent?: (event: string, type?: RequestType, details?: EventDetails) => void
}

/**
 * A challenge resolves via email only when a parent / trusted adult is
 * contacted — verifiable parental consent (VPC) or trusted-adult verification.
 * Age-assurance challenges (facial / ID / AgeKey / …) are completed in-widget
 * by the same user, so they never use email.
 */
function isEmailCapableChallenge(type?: string): boolean {
  if (!type) return false
  return /CONSENT|PARENTAL|GUARDIAN|VPC|TRUSTED[_ ]?ADULT/i.test(type)
}

export default function ChallengeControls({ challengeId, challengeType, apiKeyStatus, addEvent }: ChallengeControlsProps) {
  const [challengeStatus, setChallengeStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailResult, setEmailResult] = useState<string | null>(null)

  const handleSendEmail = async () => {
    if (!challengeId || !email.trim() || !apiKeyStatus.isConfigured) return

    setIsSendingEmail(true)
    setEmailResult(null)

    addEvent?.('api-request', RequestType.REQUEST, {
      method: 'POST',
      url: `${apiKeyStatus.apiUrl}/api/v1/challenge/send-email`,
      body: { challengeId, email: email.trim() },
    })

    try {
      const result = await sendChallengeEmail(challengeId, email.trim())
      if (result.success) {
        setEmailResult(`Sent to ${email.trim()}`)
        addEvent?.('api-response', RequestType.RESPONSE, { success: true, responseData: result.data })
      } else {
        const msg = typeof result.error === 'string' ? result.error : JSON.stringify(result.error)
        setEmailResult('Error: ' + msg)
        addEvent?.('api-error', RequestType.ERROR, { error: result.error })
      }
    } catch (error) {
      setEmailResult('Error: failed to send challenge email')
      addEvent?.('api-error', RequestType.ERROR, {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  const fetchChallengeStatus = async () => {
    if (!challengeId || !apiKeyStatus.isConfigured) return

    setIsLoading(true)
    setChallengeStatus(null)

    // Log the request attempt
    addEvent?.('api-request', RequestType.REQUEST, {
      method: 'GET',
      url: `${apiKeyStatus.apiUrl}/api/v1/challenge/get-status?challengeId=${encodeURIComponent(challengeId)}`,
    })

    try {
      const result = await getChallengeStatus(challengeId)

      if (result.success) {
        setChallengeStatus(JSON.stringify(result.data, null, 2))
        // Log successful response
        addEvent?.('api-response', RequestType.RESPONSE, {
          success: true,
          responseData: result.data,
          url: `${apiKeyStatus.apiUrl}/api/v1/challenge/get-status?challengeId=${encodeURIComponent(challengeId)}`,
        })
      } else {
        setChallengeStatus('Error: ' + (result.error || 'Unknown error'))
        // Log error response
        addEvent?.('api-error', RequestType.ERROR, {
          error: result.error,
          requestData: result.requestData,
        })
      }
    } catch (error) {
      setChallengeStatus('Error: Failed to fetch challenge status')
      console.error('Error fetching challenge status:', error)
      // Log exception
      addEvent?.('api-error', RequestType.ERROR, {
        error: error instanceof Error ? error.message : 'Unknown error',
        url: `${apiKeyStatus.apiUrl}/api/v1/challenge/get-status?challengeId=${encodeURIComponent(challengeId)}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!challengeId) return null

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Challenge Status</h2>
      <div className="mb-4">
        <p className="text-sm text-gray-600 flex items-center gap-2">
          Latest Challenge ID: <span className="font-mono">{challengeId}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(challengeId).then(() => {
                console.log('Challenge ID copied to clipboard')
              }).catch((err) => {
                console.error('Failed to copy challenge ID:', err)
              })
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Copy Challenge ID"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </p>
        {challengeType && (
          <p className="text-xs text-gray-500 mt-1">
            Type: <span className="font-mono">{challengeType}</span>
          </p>
        )}
      </div>

      <div className="flex flex-row gap-3">
        <button
          onClick={fetchChallengeStatus}
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
            'Get Challenge Status'
          )}
        </button>
      </div>

      {challengeStatus && (
        <pre
          className={`mt-4 p-3 rounded-md ${
            challengeStatus.startsWith('Error')
              ? 'bg-red-50 text-xs text-red-700 border border-red-200'
              : 'bg-green-50 text-xs text-green-700 border border-green-200'
          }`}
        >
          {challengeStatus}
        </pre>
      )}

      {isEmailCapableChallenge(challengeType) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700">Send consent email</p>
          <p className="text-xs text-gray-500 mt-1 mb-2">
            This challenge is resolved by a parent / trusted adult. Send them the consent email to complete it.
          </p>
          <div className="flex flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="parent@example.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleSendEmail}
              disabled={isSendingEmail || !email.trim() || !apiKeyStatus.isConfigured}
              className={`px-4 py-2 rounded-md text-white text-sm font-medium whitespace-nowrap ${
                !apiKeyStatus.isConfigured || !email.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isSendingEmail
                    ? 'bg-purple-400 cursor-wait'
                    : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isSendingEmail ? 'Sending…' : 'Send challenge email'}
            </button>
          </div>
          {emailResult && (
            <p
              className={`mt-2 text-xs ${
                emailResult.startsWith('Error') ? 'text-red-700' : 'text-green-700'
              }`}
            >
              {emailResult}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
