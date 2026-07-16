export enum RequestType {
  REQUEST = 'request',
  RESPONSE = 'response',
  ERROR = 'error',
  INFO = 'info',
  WEBHOOK = 'webhook',
}

/**
 * Loosely-typed payload attached to an {@link EventLog}. The shape varies by
 * event (api-request / api-response / webhook-received / *-error / js-message),
 * so the commonly-read fields are declared and an index signature keeps
 * arbitrary writers valid. Declared as typed rather than `unknown` so the event
 * log/copy/download code can read fields without truthiness narrowing to `{}`.
 */
export interface EventDetails {
  method?: string
  url?: string
  body?: unknown
  headers?: unknown
  id?: string
  shortUrl?: string
  challengeId?: string
  sessionId?: string
  responseData?: unknown
  error?: unknown
  signatureStatus?: string
  timestamp?: string
  [key: string]: unknown
}

export interface EventLog {
  timestamp: string
  event: string
  type?: RequestType
  details?: EventDetails
}

export interface FlowRequestData {
  method: string
  url: string
  headers: Record<string, string>
  body: RequestBody | Record<string, unknown>
}

export interface FlowResultStep {
  request: {
    method: string
    url: string
    body: Record<string, unknown>
  }
  response: unknown
}

export interface FlowResult {
  success: boolean
  url?: string
  shortUrl?: string
  id?: string
  challengeId?: string
  sessionId?: string
  responseData?: unknown
  error?: unknown
  requestData?: {
    method: string
    url: string
    body: RequestBody | Record<string, unknown>
  }
  steps?: FlowResultStep[]
}

export interface FlowHandler {
  buildRequestData: (formData: FormData, apiUrl: string, apiKey: string) => FlowRequestData
  performAction: (formData: FlowRequestData) => Promise<{
    success: boolean
    url?: string
    shortUrl?: string
    id?: string
    challengeId?: string
    sessionId?: string
    responseData?: unknown
    error?: unknown
    steps?: FlowResultStep[]
  }>
}

export enum FormEntryKey {
  AGE = 'age',
  AGE_CATEGORY = 'ageCategory',
  AGE_CRITERIA = 'ageCriteria',
  AGE_TYPE = 'ageType',
  DOB = 'dob',
  EMAIL = 'email',
  ID = 'id',
  JURISDICTION = 'jurisdiction',
  KUID = 'kuid',
  LOCALE = 'locale',
  SESSION_ID = 'sessionId',
  SKIP_STEPS = 'skipSteps',
  SKIP_DATA_NOTICES = 'skipDataNotices',
  SKIP_VERIFICATION = 'skipVerification',
  SKIP_PERMISSIONS = 'skipPermissions',
  SKIP_PREFERENCES = 'skipPreferences',
  REDIRECT_URL = 'redirectUrl',
  PASS_IF_OVER = 'passIfOver',
  FAIL_IF_UNDER = 'failIfUnder',
  PERMISSION_NAME = 'permissionName',
}

export enum CDKFlow {
  ACCESS_AGE_VERIFICATION = 'Access Age Verification',
  FACIAL_AGE_ESTIMATION = 'Facial Age Estimation',
  TRUSTED_ADULT_VERIFICATION = 'Trusted Adult Verification',
  AGE_GATE = 'Age Gate',
  ID_VERIFICATION = 'ID Verification',
  CREDIT_CARD_VERIFICATION = 'Credit Card Verification',
  AGE_KEY_VERIFICATION = 'AgeKey Verification',
  CONNECT_ID_VERIFICATION = 'ConnectID Verification',
  EMAIL_ESTIMATION = 'Email Age Estimation',
  END_TO_END = 'VPC End-to-End',
  DIRECT_NOTICES = 'Direct Notices',
  MANAGE_SESSION_PERMISSIONS = 'Manage Session Permissions',
  AGE_APPEAL = 'Age Appeal',
  SESSION_UPGRADE_AGE_ASSURANCE = 'Session Upgrade Age Assurance',
  AGE_GATE_CHECK = 'Age Gate Check',
}

export type RequestBodyCriteria = {
  age?: number
  ageCategory?: string
}

export type RequestBodySubject = {
  email?: string
  id?: string
  claimedAge?: number
  claimedDateOfBirth?: string
}

export type RequestBodyFacialAgeEstimationOptions = {
  passIfOver?: number
  failIfUnder?: number
}

export type RequestBodyE2EOptions = {
  skipSteps?: boolean
  skipDataNotices?: boolean
  skipVerification?: boolean
  skipPermissions?: boolean
  skipPreferences?: boolean
  redirectUrl?: string
  facialAgeEstimation?: RequestBodyFacialAgeEstimationOptions
}

export type RequestBody = {
  jurisdiction?: string
  locale?: string
  criteria?: RequestBodyCriteria
  subject?: RequestBodySubject
  kuid?: string
  sessionId?: string
  options?: RequestBodyE2EOptions
}

export type AddEventMethod = (event: string, type: RequestType, details?: EventDetails) => void

export enum AgeType {
  AGE = 'Age',
  CATEGORY = 'Category',
}

export enum AgeCategory {
  ADULT = 'ADULT',
  DIGITAL_YOUTH_OR_ADULT = 'DIGITAL_YOUTH_OR_ADULT',
}
