'use server'

import { FlowRequestData } from './types'

export async function performVerification(
  requestData: FlowRequestData,
): Promise<{ success: boolean; url?: string; id?: string; responseData?: any; error?: any }> {
  try {
    const requestBody = JSON.stringify(requestData.body)
    console.log('=== API REQUEST ===')
    console.log('URL:', requestData.url)
    console.log('Method:', requestData.method)
    console.log('Headers:', requestData.headers)
    console.log('Body:', requestBody)
    
    const response = await fetch(requestData.url, {
      method: requestData.method,
      headers: requestData.headers,
      body: requestBody,
    })

    console.log('=== API RESPONSE ===')
    console.log('Status:', response.status, response.statusText)
    console.log('Headers:', Object.fromEntries(response.headers.entries()))

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

    const data = await response.json()
    console.log('Success Response Body:', JSON.stringify(data, null, 2))

    if (data.url) {
      // Return both URL and ID if available, plus full response data
      return { 
        success: true,
        id: data.id,
        url: data.url,
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
