'use server'

import { FlowRequestData } from './types'
import { fetchWithTimeout } from '../utils/fetchWithTimeout'

/**
 * Performs a CDK flow API call to the k-ID API.
 *
 * This function makes the actual HTTP request to the k-ID API endpoints for various CDK flows
 * (age verification, age gate, ID verification, etc.). The response contains a URL that should
 * be embedded in an iframe to display the verification flow to the user.
 *
 * @param requestData - The request data containing URL, method, headers, and body
 * @returns Promise with success status, URL (for iframe embedding), ID, and response data
 *
 * @see https://docs.k-id.com/cdk/overview - CDK Overview
 * @see https://docs.k-id.com/reference/api/overview - API Reference
 *
 * The returned URL should be embedded in an iframe to display the verification flow.
 * See IframeDisplay.tsx for an example of iframe embedding.
 */
export async function performVerification(
  requestData: FlowRequestData,
): Promise<{
  success: boolean
  url?: string
  shortUrl?: string
  id?: string
  challengeId?: string
  challengeType?: string
  sessionId?: string
  responseData?: unknown
  error?: unknown
}> {
  try {
    // Serialize the request body to JSON
    const requestBody = JSON.stringify(requestData.body)
    console.log('=== API REQUEST ===')
    console.log('URL:', requestData.url)
    console.log('Method:', requestData.method)
    console.log('Headers:', requestData.headers)
    console.log('Body:', requestBody)

    // Make the API call to k-ID
    const response = await fetchWithTimeout(requestData.url, {
      method: requestData.method,
      headers: requestData.headers,
      body: requestBody,
    })

    console.log('=== API RESPONSE ===')
    console.log('Status:', response.status, response.statusText)
    console.log('Headers:', Object.fromEntries(response.headers.entries()))

    // Handle error responses
    if (!response.ok) {
      const errorText = await response.text()
      console.log('Error Response Body:', errorText)
      try {
        const errorJson = JSON.parse(errorText)
        return { success: false, error: errorJson }
      } catch {
        return { success: false, error: errorText }
      }
    }

    // Parse successful response
    const data = await response.json()
    console.log('Success Response Body:', JSON.stringify(data, null, 2))

    // The API response may include a top-level `url` (perform-* endpoints) or
    // a nested `challenge.url` (age-gate/check when age assurance is needed).
    // Either way we surface the URL so it can be embedded in an iframe. When
    // the response carries a challenge or session id (server-side CDK Custom
    // flows), we thread those out so the Console section can poll status.
    const topUrl: string | undefined = data.url
    const challengeUrl: string | undefined = data.challenge?.url
    const url = topUrl ?? challengeUrl
    const challengeId: string | undefined = data.challenge?.challengeId
    const challengeType: string | undefined = data.challenge?.type
    const sessionId: string | undefined = data.session?.sessionId
    if (url || challengeId || sessionId) {
      return {
        success: true,
        id: data.id,
        url,
        shortUrl: data.shortUrl,
        challengeId,
        challengeType,
        sessionId,
        responseData: data,
      }
    } else {
      throw new Error('No URL, challenge, or session received from the API')
    }
  } catch (error) {
    console.error('Error calling API:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Server action for the Session Upgrade flow.
 *
 * POST /session/upgrade with { sessionId, requestedPermissions } to upgrade an
 * EXISTING session with the requested permission(s). The session is not minted
 * here — the caller supplies a sessionId (auto-filled from a prior flow /
 * webhook, or pasted in).
 *
 * A session upgrade is not necessarily age assurance — depending on the
 * session's age/jurisdiction and the requested permissions, the response may
 * carry an age-assurance challenge, a VPC / parental-consent challenge, or no
 * challenge at all. Any challenge URL is surfaced for iframe embedding; "no
 * challenge" is treated as a successful plain upgrade (permissions granted).
 */
export async function performSessionUpgrade(
  requestData: FlowRequestData,
): Promise<{ success: boolean; url?: string; id?: string; challengeId?: string; challengeType?: string; responseData?: unknown; error?: unknown }> {
  try {
    const response = await fetchWithTimeout(requestData.url, {
      method: requestData.method,
      headers: requestData.headers,
      body: JSON.stringify(requestData.body),
    })

    const text = await response.text()
    let data: unknown
    try { data = text ? JSON.parse(text) : {} } catch { data = text }

    if (!response.ok) {
      return { success: false, error: data }
    }

    const challenge = (data as Record<string, unknown>).challenge as
      | { url?: string; challengeId?: string; type?: string }
      | undefined

    // Any challenge type (age assurance, VPC / parental consent, …) with a URL
    // is embedded in the iframe. No challenge = the permission(s) were granted
    // directly — a successful "plain" session upgrade.
    if (challenge?.url) {
      return {
        success: true,
        url: challenge.url,
        id: challenge.challengeId,
        challengeId: challenge.challengeId,
        challengeType: challenge.type,
        responseData: data,
      }
    }

    return { success: true, responseData: data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
