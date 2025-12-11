import { AgeType, CDKFlow, FlowHandler, FormEntryKey, RequestBody, RequestBodySubject } from './types'
import { API_CONFIG } from '../utils/constants'
import { performVerification } from './verificationActions'

/**
 * Builds the request body for CDK flow API calls from form data.
 *
 * This function extracts form fields and constructs the JSON body that will be sent
 * to the k-ID API. The body structure varies by flow type but typically includes:
 * - jurisdiction: The user's jurisdiction (e.g., "US-CA")
 * - locale: The locale for localization (e.g., "en-GB")
 * - criteria: Age verification criteria (age number or age category)
 * - subject: User information (email, ID, claimed age/DOB)
 * - kuid: k-ID user identifier (if available)
 * - options: Flow-specific options (for end-to-end flows)
 *
 * @param formData - FormData object containing user input
 * @returns RequestBody object to be sent to the k-ID API
 *
 * @see https://docs.k-id.com/docs/cdk/api-reference - API Request Structure
 */
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

  const body: RequestBody = {}

  if (jurisdiction) {
    body.jurisdiction = jurisdiction
  }

  if (dob || age || email || id) {
    const subject: RequestBodySubject = {}

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
  const options: RequestBodyE2EOptions = {}
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

function getE2EBody(formData: FormData): {
  jurisdiction: string
  kuid?: string
  age?: number
  dateOfBirth?: string
  options?: {
    skipSteps?: boolean
    skipDataNotices?: boolean
    skipVerification?: boolean
    skipPermissions?: boolean
    skipPreferences?: boolean
  }
} {
  const jurisdiction = formData.get(FormEntryKey.JURISDICTION) as string
  const kuid = formData.get(FormEntryKey.KUID) as string
  const dob = formData.get(FormEntryKey.DOB) as string
  const age = formData.get(FormEntryKey.AGE) as string
  const skipSteps = formData.get(FormEntryKey.SKIP_STEPS) === 'true'
  const skipDataNotices = formData.get(FormEntryKey.SKIP_DATA_NOTICES) === 'true'
  const skipVerification = formData.get(FormEntryKey.SKIP_VERIFICATION) === 'true'
  const skipPermissions = formData.get(FormEntryKey.SKIP_PERMISSIONS) === 'true'
  const skipPreferences = formData.get(FormEntryKey.SKIP_PREFERENCES) === 'true'

  const body: {
    jurisdiction: string
    kuid?: string
    age?: number
    dateOfBirth?: string
    options?: {
      skipSteps?: boolean
      skipDataNotices?: boolean
      skipVerification?: boolean
      skipPermissions?: boolean
      skipPreferences?: boolean
    }
  } = {
    jurisdiction,
  }

  if (kuid) {
    body.kuid = kuid
  }

  if (age) {
    body.age = parseInt(age)
  }

  if (dob) {
    body.dateOfBirth = dob
  }

  // Build options object if any skip flags are set
  const options: {
    skipSteps?: boolean
    skipDataNotices?: boolean
    skipVerification?: boolean
    skipPermissions?: boolean
    skipPreferences?: boolean
  } = {}
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

/**
 * Flow handlers for different CDK flow types.
 *
 * Each flow type has a handler that:
 * 1. Builds the appropriate API request (URL, headers, body)
 * 2. Performs the API call using performVerification()
 *
 * The API response contains a URL that should be embedded in an iframe to display
 * the verification interface to the user.
 *
 * @see https://docs.k-id.com/docs/cdk/flows - Available CDK Flows
 * @see https://docs.k-id.com/docs/cdk/api-reference - API Endpoints
 */
export const flowHandlers: Record<CDKFlow, FlowHandler> = {
  /**
   * Age Gate flow handler.
   *
   * Generates a URL for the age gate widget that can be embedded in an iframe.
   * The age gate presents age verification options to users.
   */
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
  /**
   * Access Age Verification flow handler.
   *
   * Performs age verification and returns a URL for the verification interface.
   * This flow is used to verify a user's age before granting access.
   */
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
  /**
   * Facial Age Estimation flow handler.
   *
   * Estimates a user's age using facial recognition technology. This flow returns
   * a URL for the facial age estimation interface that can be embedded in an iframe.
   */
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
  /**
   * ID Verification flow handler.
   *
   * Verifies a user's identity using government-issued identification documents.
   * This flow returns a URL for the ID verification interface that can be embedded
   * in an iframe.
   */
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
  /**
   * AgeKey Verification flow handler.
   *
   * Performs an AgeKey verification for a user. This flow returns a URL for the
   * AgeKey verification interface that can be embedded in an iframe.
   */
  [CDKFlow.AGE_KEY_VERIFICATION]: {
    buildRequestData(formData: FormData, apiUrl: string, apiKey: string) {
      return {
        method: 'POST',
        url: `${apiUrl}${API_CONFIG.endpoints.ageKeyVerification}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: getBody(formData),
      }
    },
    performAction: performVerification,
  },
  /**
   * ConnectID Verification flow handler.
   *
   * Performs ConnectID verification for a user. This flow is currently only
   * available for Australia. Returns a URL for the ConnectID verification
   * interface that can be embedded in an iframe.
   */
  [CDKFlow.CONNECT_ID_VERIFICATION]: {
    buildRequestData(formData: FormData, apiUrl: string, apiKey: string) {
      return {
        method: 'POST',
        url: `${apiUrl}${API_CONFIG.endpoints.connectIdVerification}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: getBody(formData),
      }
    },
    performAction: performVerification,
  },
  /**
   * Email Age Estimation flow handler.
   *
   * Performs email inference with background check via VerifyMy. This flow returns
   * a URL for the email age estimation interface that can be embedded in an iframe.
   */
  [CDKFlow.EMAIL_ESTIMATION]: {
    buildRequestData(formData: FormData, apiUrl: string, apiKey: string) {
      return {
        method: 'POST',
        url: `${apiUrl}${API_CONFIG.endpoints.emailInference}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: getBody(formData),
      }
    },
    performAction: performVerification,
  },
  /**
   * Trusted Adult Verification flow handler.
   *
   * Verifies a trusted adult (parent or guardian) for consent purposes. This flow
   * requires an email address for the trusted adult and returns a URL for the
   * verification interface that can be embedded in an iframe.
   */
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
  /**
   * End-to-End (VPC) flow handler.
   *
   * Provides a complete verification, consent, and permission flow in a single
   * widget. This flow can be configured with various options to skip certain steps.
   * Returns a URL for the end-to-end interface that can be embedded in an iframe.
   *
   * The request body format for this endpoint is different from other endpoints:
   * - jurisdiction (required)
   * - kuid (optional)
   * - age (optional, integer at top level)
   * - dateOfBirth (optional, at top level, not in subject)
   * - options (optional, with skip flags)
   *
   * @see https://docs.k-id.com/api/endpoints/generate-e-2-eurl - API Documentation
   */
  [CDKFlow.END_TO_END]: {
    buildRequestData: (formData: FormData, apiUrl: string, apiKey: string) => {
      return {
        method: 'POST',
        url: `${apiUrl}${API_CONFIG.endpoints.endToEnd}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: getE2EBody(formData),
      }
    },
    performAction: performVerification,
  },
  /**
   * Direct Notices flow handler.
   *
   * Displays compliance notices directly to users without requiring full verification.
   * This flow returns a URL for the direct notices interface that can be embedded
   * in an iframe.
   */
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
  /**
   * Manage Session Permissions flow handler.
   *
   * Allows users to manage permissions for an existing session. This flow requires
   * a session ID and email address. Returns a URL for the permission management
   * interface that can be embedded in an iframe.
   */
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
  /**
   * Age Appeal flow handler.
   *
   * Allows users to appeal an age verification decision. This flow requires
   * age criteria (age or age category) to be specified in the request body.
   */
  [CDKFlow.AGE_APPEAL]: {
    buildRequestData: (formData: FormData, apiUrl: string, apiKey: string) => {
      return {
        method: 'POST',
        url: `${apiUrl}${API_CONFIG.endpoints.ageAppeal}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: getBody(formData),
      }
    },
    performAction: performVerification,
  },
}
