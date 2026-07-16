import type { ReactNode } from 'react'
import { CDKFlow } from '../cdk-flows/types'
import { API_CONFIG } from '../utils/constants'

/**
 * The specialized age verification methods, matching the k-ID API doc's
 * "specialized age verification" set (https://docs.k-id.com/api/overview/):
 * facial age estimation, ID document verification, AgeKey, ConnectID, credit
 * card, trusted adult, and inference-based verification.
 *
 * Each entry maps a stable id to the underlying CDK flow + API endpoint that is
 * invoked when the end-user picks it from the customized menu. The flow enum is
 * reused so the existing flowHandlers / performCDKFlow pipeline builds the
 * request and returns a widget URL for iframe embedding.
 */
export type SpecializedMethodId =
  | 'facial'
  | 'id'
  | 'agekey'
  | 'connectid'
  | 'creditcard'
  | 'trustedadult'
  | 'inference'

export interface SpecializedMethod {
  id: SpecializedMethodId
  flow: CDKFlow
  endpoint: string
  /** i18n key suffix under the `specialized.methods.*` namespace (doc-accurate name). */
  titleKey: string
  descKey: string
  /** Consumer-menu icon. */
  icon: ReactNode
  /** Tailwind accent used for the icon chip in the Settings + menu views. */
  accent: string
  /** Whether the method needs an email in the shared params (trusted adult, inference). */
  requiresEmail?: boolean
}

const iconFacial = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m18 0V5a2 2 0 00-2-2h-4M3 15v4a2 2 0 002 2h4m6 0h4a2 2 0 002-2v-4" />
    <circle cx="12" cy="11" r="3.2" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 17.5a4.6 4.6 0 019 0" />
  </svg>
)

const iconId = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
    <rect x="3" y="5" width="18" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="8.5" cy="11" r="2" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 9.5h5M13 12.5h5M6 15.5c.5-1.3 1.4-2 2.5-2s2 .7 2.5 2" />
  </svg>
)

const iconAgeKey = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
    <circle cx="8" cy="12" r="4" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.7 11h8.3M17 11v4m2.5-4v3" />
  </svg>
)

const iconConnectId = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.5l7.5 3.2v5c0 4.4-3 8.3-7.5 9.8-4.5-1.5-7.5-5.4-7.5-9.8v-5L12 2.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
  </svg>
)

const iconCreditCard = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 9.5h19M6 14.5h4" />
  </svg>
)

const iconTrustedAdult = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
    <circle cx="8.5" cy="8" r="2.6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="16.5" cy="9" r="2.1" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 18.5c0-2.8 2.2-4.6 5-4.6s5 1.8 5 4.6M15 14c2.3 0 4 1.6 4 3.9" />
  </svg>
)

const iconInference = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7l8 6 8-6" />
  </svg>
)

export const SPECIALIZED_METHODS: SpecializedMethod[] = [
  {
    id: 'facial',
    flow: CDKFlow.FACIAL_AGE_ESTIMATION,
    endpoint: API_CONFIG.endpoints.facialAgeEstimation,
    titleKey: 'facialTitle',
    descKey: 'facialDesc',
    icon: iconFacial,
    accent: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  {
    id: 'id',
    flow: CDKFlow.ID_VERIFICATION,
    endpoint: API_CONFIG.endpoints.idVerification,
    titleKey: 'idTitle',
    descKey: 'idDesc',
    icon: iconId,
    accent: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    id: 'agekey',
    flow: CDKFlow.AGE_KEY_VERIFICATION,
    endpoint: API_CONFIG.endpoints.ageKeyVerification,
    titleKey: 'agekeyTitle',
    descKey: 'agekeyDesc',
    icon: iconAgeKey,
    accent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    id: 'connectid',
    flow: CDKFlow.CONNECT_ID_VERIFICATION,
    endpoint: API_CONFIG.endpoints.connectIdVerification,
    titleKey: 'connectidTitle',
    descKey: 'connectidDesc',
    icon: iconConnectId,
    accent: 'text-sky-600 bg-sky-50 border-sky-200',
  },
  {
    id: 'creditcard',
    flow: CDKFlow.CREDIT_CARD_VERIFICATION,
    endpoint: API_CONFIG.endpoints.creditCardVerification,
    titleKey: 'creditcardTitle',
    descKey: 'creditcardDesc',
    icon: iconCreditCard,
    accent: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    id: 'trustedadult',
    flow: CDKFlow.TRUSTED_ADULT_VERIFICATION,
    endpoint: API_CONFIG.endpoints.trustedAdultVerification,
    titleKey: 'trustedadultTitle',
    descKey: 'trustedadultDesc',
    icon: iconTrustedAdult,
    accent: 'text-rose-600 bg-rose-50 border-rose-200',
    requiresEmail: true,
  },
  {
    id: 'inference',
    flow: CDKFlow.EMAIL_ESTIMATION,
    endpoint: API_CONFIG.endpoints.emailInference,
    titleKey: 'inferenceTitle',
    descKey: 'inferenceDesc',
    icon: iconInference,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    requiresEmail: true,
  },
]
