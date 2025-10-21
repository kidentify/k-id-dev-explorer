'use server'

import { CDKFlow, FlowResult } from './types'
import { flowHandlers } from './flowHandlers'

export async function performCDKFlow(flow: CDKFlow, formData: FormData): Promise<FlowResult> {
  try {
    const apiUrl = process.env.K_ID_API_URL || 'https://game-api.test.k-id.com'
    const apiKey = process.env.K_ID_API_KEY

    if (!apiKey || apiKey === 'your_api_key_here') {
      throw new Error('API key not configured. Please set K_ID_API_KEY in your .env.local file.')
    }

    const requestData = flowHandlers[flow].buildRequestData(formData, apiUrl, apiKey)
    const result = await flowHandlers[flow].performAction(requestData)

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
  data?: any
  error?: string
  requestData?: {
    method: string
    url: string
    headers?: Record<string, string>
  }
}

export async function getChallengeStatus(challengeId: string): Promise<ChallengeStatusResult> {
  try {
    const apiUrl = process.env.K_ID_API_URL || 'https://game-api.test.k-id.com'
    const apiKey = process.env.K_ID_API_KEY

    if (!apiKey || apiKey === 'your_api_key_here') {
      throw new Error('API key not configured. Please set K_ID_API_KEY in your .env.local file.')
    }

    const url = `${apiUrl}/api/v1/challenge/get-status?challengeId=${encodeURIComponent(challengeId)}`
    const headers = {
      Authorization: `Bearer ${apiKey}`,
    }

    const response = await fetch(url, {
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

export async function getSessionStatus(sessionId: string): Promise<ChallengeStatusResult> {
  try {
    const apiUrl = process.env.K_ID_API_URL || 'https://game-api.test.k-id.com'
    const apiKey = process.env.K_ID_API_KEY

    if (!apiKey || apiKey === 'your_api_key_here') {
      throw new Error('API key not configured. Please set K_ID_API_KEY in your .env.local file.')
    }

    const url = `${apiUrl}/api/v1/session/get?sessionId=${encodeURIComponent(sessionId)}`
    const headers = {
      Authorization: `Bearer ${apiKey}`,
    }

    const response = await fetch(url, {
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
