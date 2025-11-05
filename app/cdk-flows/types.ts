export enum RequestType {
  REQUEST = 'request',
  RESPONSE = 'response',
  ERROR = 'error',
  INFO = 'info',
}

export interface EventLog {
  timestamp: string
  event: string
  type?: RequestType
  details?: any
}

export interface CDKFlowConfig {
  id: string
  name: string
  endpoint: string
  fields: FormField[]
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'number' | 'select' | 'radio'
  required?: boolean
  defaultValue?: string
  placeholder?: string
  options?: { value: string; label: string }[]
  dependsOn?: {
    field: string
    value: any
  }
  disabled?: boolean
  min?: number
  max?: number
}

export interface ApiKeyStatus {
  isConfigured: boolean
  apiUrl: string
}

export interface CDKFlowDevToolProps {
  onIframeUrlUpdate?: (url: string) => void
  apiKeyStatus: ApiKeyStatus
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

export interface Subject {
  email?: string
  id?: string
}

export interface TrustedAdultSubject {
  email: string // Required for trusted adult verification
  id?: string
}

export enum CDKFlow {
  ACCESS_AGE_VERIFICATION = 'Access Age Verification',
  FACIAL_AGE_ESTIMATION = 'Facial Age Estimation',
  TRUSTED_ADULT_VERIFICATION = 'Trusted Adult Verification',
  AGE_GATE = 'Age Gate',
  ID_VERIFICATION = 'ID Verification',
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
