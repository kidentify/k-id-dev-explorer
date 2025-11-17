import { formatErrorForDisplay } from '../utils/errorUtils'
import { AddEventMethod, AgeType, CDKFlow, EventLog, RequestType } from './types'
import { performCDKFlow } from './serverActions'
import { useState, useEffect, useCallback, useRef } from 'react'
import QRCode from 'qrcode'
import { NgrokInfo } from '../types/webhook'
import VerificationForm from '../components/forms/verificationForm'
import E2EOptionsForm from '../components/forms/e2eOptionsForm'
import ManagePermissionsForm from '../components/forms/managePermissionsForm'
import { useTranslation } from '../utils/translations'

interface ApiKeyStatus {
  isConfigured: boolean
  apiUrl: string
}

interface CDKFlowDevToolProps {
  onIframeUrlUpdate?: (url: string) => void
  apiKeyStatus: ApiKeyStatus
  onAddEvent?: (addEventFn: AddEventMethod) => void
  onEventLogsChange?: (eventLogs: EventLog[]) => void
  onDownloadEventLogRef?: (fn: () => void) => void
  onClearLogsRef?: (fn: () => void) => void
  onCopyEventRef?: (fn: (event: EventLog) => void) => void
}

export default function CDKFlowDevTool({ onIframeUrlUpdate, apiKeyStatus, onAddEvent, onEventLogsChange, onDownloadEventLogRef, onClearLogsRef, onCopyEventRef }: CDKFlowDevToolProps) {
  const { t } = useTranslation();
  const [selectedFlow, setSelectedFlow] = useState(CDKFlow.ACCESS_AGE_VERIFICATION)
  const [ageType, setAgeType] = useState<AgeType>(AgeType.CATEGORY)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [eventLogs, setEventLogs] = useState<EventLog[]>([])
  const [ngrokInfo, setNgrokInfo] = useState<NgrokInfo | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')

  // Add event to log - use useCallback to ensure the function reference is stable
  const addEvent = useCallback((event: string, type: RequestType = RequestType.INFO, details?: unknown) => {
    const newEvent: EventLog = {
      timestamp: new Date().toLocaleTimeString(),
      event,
      type,
      details,
    }
    setEventLogs((prev) => {
      const updated = [newEvent, ...prev.slice(0, 49)]; // Keep last 50 events
      onEventLogsChange?.(updated);
      return updated;
    });
  }, [onEventLogsChange])

  // Share addEvent function with parent component - use a ref to track if we've already shared it
  const hasSharedEvent = useRef(false)

  useEffect(() => {
    if (onAddEvent && !hasSharedEvent.current) {
      onAddEvent(addEvent)
      hasSharedEvent.current = true
    }
  }, [onAddEvent, addEvent])

  // Generate QR code for ngrok URL
  const generateQRCode = async (url: string) => {
    try {
      const qrCodeUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        errorCorrectionLevel: 'H', // Higher error correction for logo overlay
      })
      setQrCodeDataUrl(qrCodeUrl)
    } catch (error) {
      console.error('Failed to generate QR code:', error)
      setQrCodeDataUrl('')
    }
  }

  // Fetch ngrok tunnel information
  const fetchNgrokInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/ngrok')
      const data = await response.json()
      setNgrokInfo(data)

      // Generate QR code if ngrok URL is available
      if (data.success && data.ngrokUrl) {
        await generateQRCode(data.ngrokUrl)
      } else {
        setQrCodeDataUrl('')
      }

      // Don't log ngrok status changes to event window - just update UI state
    } catch (error) {
      console.error('Error fetching ngrok info:', error)
      setQrCodeDataUrl('')
      // Don't log ngrok fetch errors to event window either
    }
  }, [])

  // Listen for iframe messages from k-id.com domain, console errors, and webhook events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Check if the message is from a k-id.com domain
      const hostname = new URL(event.origin).hostname;
      if (hostname === 'k-id.com' || hostname.endsWith('.k-id.com')) {
        addEvent('js-message', RequestType.INFO, event.data)
      }
    }

    const handleError = (event: ErrorEvent) => {
      addEvent('console-error', RequestType.ERROR, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.toString(),
      })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addEvent('unhandled-rejection', RequestType.ERROR, {
        reason: event.reason?.toString(),
        promise: event.promise,
      })
    }

    // Set up Server-Sent Events connection for webhook events
    let eventSource: EventSource | null = null

    try {
      eventSource = new EventSource('/api/webhook/events')

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'webhook') {
            addEvent('webhook-received', RequestType.INFO, {
              method: data.data.method,
              url: data.data.url,
              headers: data.data.headers,
              body: data.data.body,
              timestamp: data.data.timestamp,
              id: data.data.id,
            })
          }
          // Silently handle 'connected', 'heartbeat', and 'test' events - don't add to event log
        } catch (error) {
          console.error('Error parsing SSE data:', error)
        }
      }

      eventSource.onerror = (error) => {
        addEvent('webhook-stream-error', RequestType.ERROR, {
          error: 'Failed to connect to webhook event stream',
          details: error,
        })
      }
    } catch (error) {
      addEvent('webhook-stream-error', RequestType.ERROR, {
        error: 'Failed to initialize webhook event stream',
        details: error,
      })
    }

    window.addEventListener('message', handleMessage)
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('message', handleMessage)
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)

      if (eventSource) {
        eventSource.close()
      }
    }
  }, [])

  // Fetch ngrok info on mount and periodically
  useEffect(() => {
    fetchNgrokInfo()

    // Refresh ngrok info every 10 seconds
    const interval = setInterval(fetchNgrokInfo, 10000)

    return () => clearInterval(interval)
  }, [fetchNgrokInfo])

  /**
   * Handles form submission for CDK flow execution.
   * 
   * This function:
   * 1. Extracts the selected flow type from the form
   * 2. Calls performCDKFlow() to make the API request to k-ID
   * 3. Receives the URL from the API response
   * 4. Updates the iframe URL via onIframeUrlUpdate callback
   * 
   * The URL returned from the API is embedded in an iframe to display
   * the verification interface to the user.
   * 
   * @param formData - Form data containing flow type and parameters
   * 
   * @see https://docs.k-id.com/cdk/overview - CDK Overview
   * @see https://docs.k-id.com/cdk/age-verification#embedding-the-verification-interface - Embedding the CDK Flow
   */
  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError('')

    try {
      const flow = formData.get('flow') as CDKFlow

      if (!apiKeyStatus.isConfigured) {
        throw new Error(t('errors.apiKeyNotConfigured'))
      }

      // Call the server action to perform the CDK flow
      // This makes the API request to k-ID and returns a URL for iframe embedding
      // Documentation: https://docs.k-id.com/reference/api/overview
      const result = await performCDKFlow(flow, formData)

      // Log the actual API request from the server action
      if (result.requestData) {
        addEvent('api-request', RequestType.REQUEST, result.requestData)
      }

      if (result.success && result.url) {
        addEvent('api-response', RequestType.RESPONSE, { 
          id: result.id,
          url: result.url,
          responseData: result.responseData
        })
        // The API response includes a URL that should be embedded in an iframe
        // This URL points to the k-ID CDK flow interface
        // Documentation: https://docs.k-id.com/cdk/age-verification#embedding-the-verification-interface
        onIframeUrlUpdate?.(result.url)
      } else {
        const errorData = { error: result.error }
        addEvent('api-error', RequestType.ERROR, errorData)
        setError(formatErrorForDisplay(result.error || t('errors.anErrorOccurred')))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errors.anErrorOccurred')
      addEvent('api-error', RequestType.ERROR, { error: errorMessage })
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadEventLog = useCallback(() => {
    if (eventLogs.length === 0) {
      return
    }

    const logContent = eventLogs
      .map((event) => {
        const timestamp = event.timestamp
        const type = event.type?.toUpperCase() || 'INFO'
        const eventName = event.event

        let details = ''
        if (event.details) {
          if (event.event === 'webhook-received') {
            details = JSON.stringify(event.details.body, null, 2)
          } else if (event.event === 'api-request') {
            if (event.details.body) {
              details = JSON.stringify(event.details.body, null, 2)
            } else if (event.details.url) {
              details = `URL: ${event.details.url}`
            }
          } else if (event.event === 'api-response' && event.details.url) {
            details = `URL: ${event.details.url}${event.details.id ? `\nID: ${event.details.id}` : ''}${event.details.responseData ? `\nResponse: ${JSON.stringify(event.details.responseData, null, 2)}` : ''}`
          } else if (event.event === 'api-error' && event.details.error) {
            details = `Error: ${event.details.error}`
          } else if (event.event === 'js-message' && event.details) {
            details = JSON.stringify(event.details, null, 2)
          } else {
            details = JSON.stringify(event.details, null, 2)
          }
        }

        return `${timestamp} [${type}] ${eventName}${details ? '\n' + details : ''}`
      })
      .join('\n\n')

    const blob = new Blob([logContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cdk-sandbox-events-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [eventLogs])

  const clearLogs = useCallback(() => {
    setEventLogs([])
    onEventLogsChange?.([]);
    addEvent('logs-cleared', RequestType.INFO)
  }, [onEventLogsChange, addEvent])

  const copyEventToClipboard = useCallback((event: EventLog) => {
    let textToCopy = ''

    // Build the text that matches what's displayed in the event box
    if (event.event === 'api-request') {
      // For API requests, copy body if present, otherwise copy URL
      if (event.details?.body) {
        textToCopy = JSON.stringify(event.details.body, null, 2)
      } else if (event.details?.url) {
        textToCopy = event.details.url
      }
    } else if (event.event === 'api-response') {
      // For API responses, copy the response data
      textToCopy = JSON.stringify(event.details.responseData, null, 2)
    } else if (event.event === 'webhook-received') {
      // For webhook events, copy just the body payload
      textToCopy = JSON.stringify(event.details.body, null, 2)
    } else if (event.event === 'js-message') {
      // For JS messages, copy just the message data
      textToCopy = JSON.stringify(event.details, null, 2)
    } else if (event.details) {
      // For other events, copy the details
      textToCopy = JSON.stringify(event.details, null, 2)
    } else {
      // For events without details, copy the event info
      textToCopy = JSON.stringify(
        {
          timestamp: event.timestamp,
          event: event.event,
          type: event.type,
        },
        null,
        2,
      )
    }

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        console.log('Event copied to clipboard')
      })
      .catch((err) => {
        console.error('Failed to copy to clipboard:', err)
      })
  }, [])

  // Expose functions via refs
  useEffect(() => {
    onDownloadEventLogRef?.(downloadEventLog)
    onClearLogsRef?.(clearLogs)
    onCopyEventRef?.(copyEventToClipboard)
  }, [downloadEventLog, clearLogs, copyEventToClipboard, onDownloadEventLogRef, onClearLogsRef, onCopyEventRef])

  return (
    <div className="space-y-6">
      {/* Combined Flow Selection and Configuration Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('widget.inputFields')}</h2>
        <form action={handleSubmit} className="space-y-4">
          {/* Flow Selection */}
          <div>
            <label htmlFor="flow" className="block text-sm font-medium text-gray-700 mb-2">
              {t('widget.selectFlow')}
            </label>
            <select
              id="flow"
              name="flow"
              value={selectedFlow}
              onChange={(e) => setSelectedFlow(e.target.value as CDKFlow)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {Object.values(CDKFlow).sort().map((value, index) => {
                const flowKey = Object.keys(CDKFlow).find(key => CDKFlow[key as keyof typeof CDKFlow] === value);
                // Convert ACCESS_AGE_VERIFICATION to accessAgeVerification (camelCase)
                const translationKey = flowKey 
                  ? flowKey.toLowerCase().split('_').map((word, i) => i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)).join('')
                  : '';
                return (
                  <option key={index} value={value}>
                    {t(`flows.${translationKey}`) || value}
                  </option>
                );
              })}
            </select>
          </div>
          {selectedFlow === CDKFlow.ACCESS_AGE_VERIFICATION && <VerificationForm ageCriteria={{}} />}
          {selectedFlow === CDKFlow.AGE_GATE && <VerificationForm kuid={{ required: false }} />}
          {selectedFlow === CDKFlow.FACIAL_AGE_ESTIMATION && (
            <VerificationForm
              ageCriteria={{}}
              dob={{ required: false }}
              age={{ required: false }}
              id={{ required: false }}
              email={{ required: false }}
              locale={{ required: false }}
            />
          )}
          {selectedFlow === CDKFlow.TRUSTED_ADULT_VERIFICATION && (
            <VerificationForm email={{ title: t('fields.trustedAdultEmail'), required: true }} id={{ required: false }} />
          )}
          {selectedFlow === CDKFlow.ID_VERIFICATION && (
            <VerificationForm
              ageCriteria={{}}
              dob={{ required: false }}
              age={{ required: false }}
              id={{ required: false }}
              email={{ required: false }}
              locale={{ required: false }}
            />
          )}
          {selectedFlow === CDKFlow.END_TO_END && (
            <div className="space-y-4">
              <VerificationForm
                kuid={{ required: false }}
                dob={{ required: false }}
                age={{ required: false }}
              />
              <E2EOptionsForm />
            </div>
          )}
          {selectedFlow === CDKFlow.DIRECT_NOTICES && (
            <VerificationForm />
          )}
          {selectedFlow === CDKFlow.MANAGE_SESSION_PERMISSIONS && (
            <ManagePermissionsForm />
          )}
          {selectedFlow === CDKFlow.AGE_APPEAL && (
            <VerificationForm
              ageCriteria={{}}
              kuid={{ required: false }}
              dob={{ required: false }}
              age={{ required: false }}
              email={{ required: false }}
              id={{ required: false }}
              locale={{ required: false }}
            />
          )}
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#745eee] hover:bg-[#6a4fd8] disabled:bg-[#a08ff0] disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                {t('common.loading')}
              </>
            ) : (
              t('widget.embed')
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Webhook URL Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('tunnel.title')}</h2>
        <div className="space-y-4">
          {/* Ngrok Status */}
          {ngrokInfo && (
            <div
              className={`p-3 rounded-md ${ngrokInfo.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}
            >
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${ngrokInfo.success ? 'bg-green-500' : 'bg-yellow-500'}`}
                ></div>
                <span className={`text-sm font-medium ${ngrokInfo.success ? 'text-green-800' : 'text-yellow-800'}`}>
                  {ngrokInfo.success ? t('tunnel.ngrokActive') : t('tunnel.ngrokNotRunning')}
                </span>
              </div>
              {ngrokInfo.success && (
              <p className="text-xs text-green-700 mt-1 flex items-center gap-2">
                {t('tunnel.externalUrl')} <a href={ngrokInfo.ngrokUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-green-700 hover:text-green-900 underline">{ngrokInfo.ngrokUrl}</a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(ngrokInfo.ngrokUrl!).then(() => {
                        console.log('Ngrok URL copied to clipboard')
                      }).catch((err) => {
                        console.error('Failed to copy ngrok URL:', err)
                      })
                    }}
                    className="text-green-600 hover:text-green-800 transition-colors"
                    title={t('tunnel.copyNgrokUrl')}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </p>
              )}
              {!ngrokInfo.success && (
                <p className="text-xs text-yellow-700 mt-1">
                  {ngrokInfo.error || t('tunnel.startNgrok')}
                </p>
              )}
            </div>
          )}

          {/* QR Code for ngrok URL */}
          {ngrokInfo?.success && qrCodeDataUrl && (
            <div className="p-3 rounded-md bg-white border border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-2">{t('tunnel.scanToAccess')}</p>
                <div className="flex justify-center relative">
                  <img src={qrCodeDataUrl} alt="QR Code for ngrok URL" className="border border-gray-300 rounded" />
                  {/* k-ID Logo overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-2 shadow-sm">
                      <img src="/logo.svg" alt="k-ID Logo" className="w-8 h-8" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Webhook URL */}
          {ngrokInfo?.success && ngrokInfo.webhookUrl && (
            <div
              className="p-3 rounded-md bg-green-50 border border-green-200"
            >
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-2 bg-green-500"></div>
                <span className="text-sm font-medium text-green-800">
                  {t('tunnel.webhookReceiverUrl')}
                </span>
              </div>
              <p className="text-xs text-green-700 mt-1 flex items-center gap-2">
                <span className="font-mono">{ngrokInfo.webhookUrl}</span>
                <button
                  onClick={() => {
                    navigator.clipboard
                      .writeText(ngrokInfo.webhookUrl!)
                      .then(() => {
                        console.log('Webhook URL copied to clipboard')
                      })
                      .catch((err) => {
                        console.error('Failed to copy webhook URL:', err)
                      })
                  }}
                  className="text-green-600 hover:text-green-800 transition-colors"
                  title={t('tunnel.copyWebhookUrl')}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </p>
              <div className="mt-2 text-xs text-green-600">
                <p>
                  {t('tunnel.configureWebhook')}{' '}
                  <a
                    href="https://portal.k-id.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 hover:text-green-900 underline"
                  >
                    {t('tunnel.complianceStudio')}
                  </a>
                  .
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
