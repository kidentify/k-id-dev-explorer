'use server'

import { FlowRequestData, FlowResultStep } from './types'
import { API_CONFIG } from '../utils/constants'

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
): Promise<{ success: boolean; url?: string; id?: string; responseData?: unknown; error?: unknown }> {
  try {
    // Serialize the request body to JSON
    const requestBody = JSON.stringify(requestData.body)
    console.log('=== API REQUEST ===')
    console.log('URL:', requestData.url)
    console.log('Method:', requestData.method)
    console.log('Headers:', requestData.headers)
    console.log('Body:', requestBody)

    // Make the API call to k-ID
    const response = await fetch(requestData.url, {
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

    // The API response includes a URL that should be embedded in an iframe
    // This URL points to the k-ID CDK flow interface where users complete verification
    if (data.url) {
      // Return both URL and ID if available, plus full response data
      // The URL should be set as the src attribute of an iframe element
      return {
        success: true,
        id: data.id,
        url: data.url,  // This URL is used to embed the CDK flow in an iframe
        responseData: data
      }
    } else {
      throw new Error('No URL received from the API')
    }
  } catch (error) {
    console.error('Error calling API:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Two-step server action for the Session Upgrade Age Assurance flow.
 *
 * Step 1: POST /age-gate/check with { jurisdiction, age } to obtain a session.
 * Step 2: POST /session/upgrade with { sessionId, requestedPermissions } to get
 *         a CHALLENGE_SESSION_UPGRADE_BY_AGE_ASSURANCE challenge whose URL is
 *         embedded in the iframe.
 *
 * The `permissionName` field is expected in requestData.body alongside the
 * age-gate/check payload; it is consumed only by step 2.
 */
export async function performSessionUpgradeAgeAssurance(
  requestData: FlowRequestData,
): Promise<{ success: boolean; url?: string; id?: string; responseData?: unknown; error?: unknown; steps?: FlowResultStep[] }> {
  const body = requestData.body as Record<string, unknown>
  const permissionName = body.permissionName as string
  const baseUrl = requestData.url.replace(API_CONFIG.endpoints.ageGateCheck, '')
  const steps: FlowResultStep[] = []

  // --- Step 1: age-gate/check ---
  const ageGateBody = { jurisdiction: body.jurisdiction, age: body.age }
  const ageGateRequest = { method: 'POST', url: requestData.url, body: ageGateBody }

  const ageGateResponse = await fetch(requestData.url, {
    method: 'POST',
    headers: requestData.headers,
    body: JSON.stringify(ageGateBody),
  })

  if (!ageGateResponse.ok) {
    const errorText = await ageGateResponse.text()
    let errorData: unknown
    try { errorData = JSON.parse(errorText) } catch { errorData = errorText }
    steps.push({ request: ageGateRequest, response: errorData })
    return { success: false, error: errorData, steps }
  }

  const ageGateData = await ageGateResponse.json()
  steps.push({ request: ageGateRequest, response: ageGateData })

  if (ageGateData.challenge) {
    return {
      success: false,
      error: 'Age assurance not required — age-gate returned a challenge (minor/consent path). Adjust the age parameter.',
      steps,
    }
  }

  if (!ageGateData.session?.sessionId) {
    return {
      success: false,
      error: `Unexpected age-gate response — no session returned (status: ${ageGateData.status}).`,
      steps,
    }
  }

  const sessionId: string = ageGateData.session.sessionId
  const redirectUrl = body.redirectUrl as string | undefined

  // --- Step 2: session/upgrade ---
  const upgradeUrl = `${baseUrl}${API_CONFIG.endpoints.sessionUpgrade}`
  const upgradeBody: Record<string, unknown> = {
    sessionId,
    requestedPermissions: [{ name: permissionName }],
  }
  if (redirectUrl) {
    upgradeBody.options = { redirectUrl }
  }
  const upgradeRequest = { method: 'POST', url: upgradeUrl, body: upgradeBody }

  const upgradeResponse = await fetch(upgradeUrl, {
    method: 'POST',
    headers: requestData.headers,
    body: JSON.stringify(upgradeBody),
  })

  if (!upgradeResponse.ok) {
    const errorText = await upgradeResponse.text()
    let errorData: unknown
    try { errorData = JSON.parse(errorText) } catch { errorData = errorText }
    steps.push({ request: upgradeRequest, response: errorData })
    return { success: false, error: errorData, steps }
  }

  const upgradeData = await upgradeResponse.json()
  steps.push({ request: upgradeRequest, response: upgradeData })

  const challenge = upgradeData.challenge
  if (
    challenge?.type?.toUpperCase() === 'CHALLENGE_SESSION_UPGRADE_BY_AGE_ASSURANCE' &&
    challenge.url
  ) {
    return {
      success: true,
      url: challenge.url,
      id: challenge.challengeId,
      steps,
    }
  }

  if (!challenge) {
    return {
      success: false,
      error: 'Age assurance not required — session/upgrade returned no challenge. The permission may already be enabled.',
      steps,
    }
  }

  return {
    success: false,
    error: `Unexpected challenge type: ${challenge.type}. Expected CHALLENGE_SESSION_UPGRADE_BY_AGE_ASSURANCE.`,
    steps,
  }
}
