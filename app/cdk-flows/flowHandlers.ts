import { AgeType, CDKFlow, FlowHandler, FormEntryKey, RequestBody, RequestBodySubject } from './types'
import { API_CONFIG } from '../utils/constants'
import { performVerification } from './verificationActions'

function getBody(formData: FormData): RequestBody {
  const jurisdiction = formData.get(FormEntryKey.JURISDICTION) as string
  const locale = formData.get(FormEntryKey.LOCALE) as string
  const ageType = formData.get(FormEntryKey.AGE_TYPE) as AgeType
  const ageCriteria = formData.get(FormEntryKey.AGE_CRITERIA) as string
  const ageCategory = formData.get(FormEntryKey.AGE_CATEGORY) as string
  const dob = formData.get(FormEntryKey.DOB) as string
  const age = formData.get(FormEntryKey.AGE) as string
  const email = formData.get(FormEntryKey.EMAIL) as string
  const id = formData.get(FormEntryKey.ID) as string
  const kuid = formData.get(FormEntryKey.KUID) as string
  const skipSteps = formData.get(FormEntryKey.SKIP_STEPS) === 'true'
  const skipDataNotices = formData.get(FormEntryKey.SKIP_DATA_NOTICES) === 'true'
  const skipVerification = formData.get(FormEntryKey.SKIP_VERIFICATION) === 'true'
  const skipPermissions = formData.get(FormEntryKey.SKIP_PERMISSIONS) === 'true'
  const skipPreferences = formData.get(FormEntryKey.SKIP_PREFERENCES) === 'true'

  const criteria = ageType ? (ageType === AgeType.AGE ? { age: parseInt(ageCriteria) } : { ageCategory }) : null

  let body: RequestBody = {}

  if (jurisdiction) {
    body.jurisdiction = jurisdiction
  }

  if (dob || age || email || id) {
    let subject: RequestBodySubject = {}

    if (dob) {
      subject.claimedDateOfBirth = dob
    }

    if (age) {
      subject.claimedAge = parseInt(age)
    }

    if (email) {
      subject.email = email
    }

    if (id) {
      subject.id = id
    }

    body.subject = subject
  }

  if (locale) {
    body.locale = locale
  }

  if (criteria) {
    body.criteria = criteria
  }

  if (kuid) {
    body.kuid = kuid
  }

  // Build options object if any skip flags are set
  const options: any = {}
  if (skipSteps) options.skipSteps = true
  if (skipDataNotices) options.skipDataNotices = true
  if (skipVerification) options.skipVerification = true
  if (skipPermissions) options.skipPermissions = true
  if (skipPreferences) options.skipPreferences = true

  if (Object.keys(options).length > 0) {
    body.options = options
  }

  return body
}

function getManagePermissionsBody(formData: FormData): { sessionId: string; email: string } {
  const sessionId = formData.get(FormEntryKey.SESSION_ID) as string
  const email = formData.get(FormEntryKey.EMAIL) as string

  return {
    sessionId,
    email
  }
}

export const flowHandlers: Record<CDKFlow, FlowHandler> = {
  [CDKFlow.AGE_GATE]: {
    buildRequestData: (formData: FormData, apiUrl: string, apiKey: string) => {
      return {
        method: 'POST',
        url: `${apiUrl}${API_CONFIG.endpoints.ageGate}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: getBody(formData),
      }
    },
    performAction: performVerification,
  },
  [CDKFlow.ACCESS_AGE_VERIFICATION]: {
    buildRequestData: (formData: FormData, apiUrl: string, apiKey: string) => {
      return {
        method: 'POST',
        url: `${apiUrl}${API_CONFIG.endpoints.accessAgeVerification}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: getBody(formData),
      }
    },
    performAction: performVerification,
  },
  [CDKFlow.FACIAL_AGE_ESTIMATION]: {
    buildRequestData(formData: FormData, apiUrl: string, apiKey: string) {
      return {
        method: 'POST',
        url: `${apiUrl}${API_CONFIG.endpoints.facialAgeEstimation}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: getBody(formData),
      }
    },
    performAction: performVerification,
  },
  [CDKFlow.ID_VERIFICATION]: {
    buildRequestData(formData: FormData, apiUrl: string, apiKey: string) {
      return {
        method: 'POST',
        url: `${apiUrl}${API_CONFIG.endpoints.idVerification}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: getBody(formData),
      }
    },
    performAction: performVerification,
  },
  [CDKFlow.TRUSTED_ADULT_VERIFICATION]: {
    buildRequestData: (formData: FormData, apiUrl: string, apiKey: string) => {
      return {
        method: 'POST',
        url: `${apiUrl}${API_CONFIG.endpoints.trustedAdultVerification}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: getBody(formData),
      }
    },
    performAction: performVerification,
  },
  [CDKFlow.END_TO_END]: {
    buildRequestData: (formData: FormData, apiUrl: string, apiKey: string) => {
      return {
        method: 'POST',
        url: `${apiUrl}${API_CONFIG.endpoints.endToEnd}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: getBody(formData),
      }
    },
    performAction: performVerification,
  },
  [CDKFlow.DIRECT_NOTICES]: {
    buildRequestData: (formData: FormData, apiUrl: string, apiKey: string) => {
      return {
        method: 'POST',
        url: `${apiUrl}${API_CONFIG.endpoints.directNotices}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: getBody(formData),
      }
    },
    performAction: performVerification,
  },
  [CDKFlow.MANAGE_SESSION_PERMISSIONS]: {
    buildRequestData: (formData: FormData, apiUrl: string, apiKey: string) => {
      return {
        method: 'POST',
        url: `${apiUrl}${API_CONFIG.endpoints.manageSessionPermissions}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: getManagePermissionsBody(formData),
      }
    },
    performAction: performVerification,
  },
}
