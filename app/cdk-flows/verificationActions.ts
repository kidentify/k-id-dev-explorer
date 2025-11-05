'use server'

import { FlowRequestData } from './types'

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
): Promise<{ success: boolean; url?: string; id?: string; responseData?: any; error?: any }> {
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
