export enum RequestType {
  REQUEST = 'request',
  RESPONSE = 'response',
  ERROR = 'error',
  INFO = 'info',
  WEBHOOK = 'webhook',
}

export interface EventLog {
  timestamp: string
  event: string
  type?: RequestType
  details?: any
}

export interface FlowRequestData {
  method: string
  url: string
  headers: Record<string, string>
  body: any
}

export interface FlowResult {
  success: boolean
  url?: string
  id?: string
  responseData?: any
  error?: any
  requestData?: {
    method: string
    url: string
    body: any
  }
}

export interface FlowHandler {
  buildRequestData: (formData: FormData, apiUrl: string, apiKey: string) => FlowRequestData
  performAction: (formData: FlowRequestData) => Promise<{ success: boolean; url?: string; id?: string; responseData?: any; error?: any }>
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
}

export enum CDKFlow {
  ACCESS_AGE_VERIFICATION = 'Access Age Verification',
  FACIAL_AGE_ESTIMATION = 'Facial Age Estimation',
  TRUSTED_ADULT_VERIFICATION = 'Trusted Adult Verification',
  AGE_GATE = 'Age Gate',
  ID_VERIFICATION = 'ID Verification',
  AGE_KEY_VERIFICATION = 'AgeKey Verification',
  EMAIL_ESTIMATION = 'Email Age Estimation',
  END_TO_END = 'VPC End-to-End',
  DIRECT_NOTICES = 'Direct Notices',
  MANAGE_SESSION_PERMISSIONS = 'Manage Session Permissions',
  AGE_APPEAL = 'Age Appeal',
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

export type RequestBodyE2EOptions = {
  skipSteps?: boolean
  skipDataNotices?: boolean
  skipVerification?: boolean
  skipPermissions?: boolean
  skipPreferences?: boolean
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

export type AddEventMethod = (event: string, type: RequestType, details?: any) => void

export enum AgeType {
  AGE = 'Age',
  CATEGORY = 'Category',
}

export enum AgeCategory {
  ADULT = 'ADULT',
  DIGITAL_YOUTH_OR_ADULT = 'DIGITAL_YOUTH_OR_ADULT',
}
