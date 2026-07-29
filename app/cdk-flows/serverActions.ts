'use server'

import { CDKFlow, FlowResult } from './types'
import { flowHandlers } from './flowHandlers'
import { API_CONFIG } from '../utils/constants'
import { fetchWithTimeout } from '../utils/fetchWithTimeout'

/**
 * Server action to perform a CDK flow.
 *
 * This function orchestrates the CDK flow execution by:
 * 1. Retrieving API configuration from environment variables
 * 2. Building the request data using the appropriate flow handler
 * 3. Making the API call to k-ID
 * 4. Returning the result with a URL for iframe embedding
 *
 * The returned URL should be embedded in an iframe to display the verification flow.
 *
 * @param flow - The CDK flow type to execute (e.g., AGE_GATE, ACCESS_AGE_VERIFICATION)
 * @param formData - Form data containing user input and flow parameters
 * @returns Promise with flow result including URL for iframe embedding
 *
 * @see https://docs.k-id.com/cdk/overview - CDK Overview
 */
export async function performCDKFlow(flow: CDKFlow, formData: FormData): Promise<FlowResult> {
  try {
    // Get API configuration from environment variables
    // Set K_ID_API_URL and K_ID_API_KEY in your .env.local file
    const apiUrl = process.env.K_ID_API_URL || 'https://game-api.test.k-id.com'
    const apiKey = process.env.K_ID_API_KEY

    if (!apiKey || apiKey === 'your_api_key_here') {
      throw new Error('API key not configured. Please set K_ID_API_KEY in your .env.local file.')
    }

    // Build request data using the flow-specific handler
    // Each flow type has its own handler that constructs the appropriate API request
    // See flowHandlers.ts for flow-specific implementations
    const requestData = flowHandlers[flow].buildRequestData(formData, apiUrl, apiKey)

    // Perform the API call
    // This calls performVerification() which makes the HTTP request to k-ID
    const result = await flowHandlers[flow].performAction(requestData)

    if (result.steps) {
      return result
    }

    return {
      ...result,
      requestData: {
        method: requestData.method,
        url: requestData.url,
        body: requestData.body,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    }
  }
}

interface ChallengeStatusResult {
  success: boolean
  data?: unknown
  error?: string
  requestData?: {
    method: string
    url: string
    headers?: Record<string, string>
  }
}

/**
 * Retrieves the status of a challenge/verification session.
 *
 * After a CDK flow is initiated, you can query the status of the verification
 * using the challenge ID returned in the API response or received via postMessage
 * from the iframe.
 *
 * @param challengeId - The challenge ID from the CDK flow response
 * @returns Promise with challenge status data
 */
export async function getChallengeStatus(challengeId: string): Promise<ChallengeStatusResult> {
  try {
    const apiUrl = process.env.K_ID_API_URL || 'https://game-api.test.k-id.com'
    const apiKey = process.env.K_ID_API_KEY

    if (!apiKey || apiKey === 'your_api_key_here') {
      throw new Error('API key not configured. Please set K_ID_API_KEY in your .env.local file.')
    }

    // Query the challenge status endpoint
    const url = `${apiUrl}/api/v1/challenge/get-status?challengeId=${encodeURIComponent(challengeId)}`
    const headers = {
      Authorization: `Bearer ${apiKey}`,
    }

    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()

    return {
      success: true,
      data,
      requestData: {
        method: 'GET',
        url,
        headers,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
      requestData: {
        method: 'GET',
        url: `${process.env.K_ID_API_URL || 'https://game-api.test.k-id.com'}/api/v1/challenge/get-status?challengeId=${encodeURIComponent(challengeId)}`,
      },
    }
  }
}

/**
 * Retrieves the status of a session.
 *
 * Sessions are created during CDK flows and can be queried to check the current
 * state of the verification process. The session ID is typically received via
 * postMessage from the embedded iframe.
 *
 * @param sessionId - The session ID from the CDK flow
 * @returns Promise with session status data
 */
export async function getSessionStatus(sessionId: string): Promise<ChallengeStatusResult> {
  try {
    const apiUrl = process.env.K_ID_API_URL || 'https://game-api.test.k-id.com'
    const apiKey = process.env.K_ID_API_KEY

    if (!apiKey || apiKey === 'your_api_key_here') {
      throw new Error('API key not configured. Please set K_ID_API_KEY in your .env.local file.')
    }

    // Query the session status endpoint
    const url = `${apiUrl}/api/v1/session/get?sessionId=${encodeURIComponent(sessionId)}`
    const headers = {
      Authorization: `Bearer ${apiKey}`,
    }

    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()

    return {
      success: true,
      data,
      requestData: {
        method: 'GET',
        url,
        headers,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
      requestData: {
        method: 'GET',
        url: `${process.env.K_ID_API_URL || 'https://game-api.test.k-id.com'}/api/v1/session/get?sessionId=${encodeURIComponent(sessionId)}`,
      },
    }
  }
}

interface SendChallengeEmailResult {
  success: boolean
  data?: unknown
  error?: unknown
  requestData?: {
    method: string
    url: string
    body: Record<string, unknown>
  }
}

/**
 * Sends the consent email for a challenge that resolves via a parent / trusted
 * adult (verifiable parental consent, trusted-adult verification). The email is
 * addressed to the trusted adult; the k-ID API looks up the challenge by id and
 * dispatches the appropriate consent email. Age-assurance challenges (facial /
 * ID / AgeKey / etc.) don't use this — the same user completes them in-widget.
 *
 * @param challengeId - The challenge id from a CDK API response (age-gate/check
 *                      or session/upgrade)
 * @param email - The recipient (parent / trusted adult) email address
 * @see https://docs.k-id.com/api/endpoints/send-challenge-email
 */
export async function sendChallengeEmail(
  challengeId: string,
  email: string,
): Promise<SendChallengeEmailResult> {
  const apiUrl = process.env.K_ID_API_URL || 'https://game-api.test.k-id.com'
  const url = `${apiUrl}${API_CONFIG.endpoints.challengeSendEmail}`
  const body: Record<string, unknown> = { challengeId, email }

  try {
    const apiKey = process.env.K_ID_API_KEY
    if (!apiKey || apiKey === 'your_api_key_here') {
      throw new Error('API key not configured. Please set K_ID_API_KEY in your .env.local file.')
    }

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    const text = await response.text()
    let data: unknown
    try { data = text ? JSON.parse(text) : {} } catch { data = text }

    if (!response.ok) {
      return { success: false, error: data, requestData: { method: 'POST', url, body } }
    }

    return { success: true, data, requestData: { method: 'POST', url, body } }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
      requestData: { method: 'POST', url, body },
    }
  }
}
