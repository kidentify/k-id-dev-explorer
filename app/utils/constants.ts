export const BUTTON_COLORS = {
  primary: '#745eee',
  hover: '#6a4fd8',
  disabled: '#a08ff0',
} as const

export const API_CONFIG = {
  defaultHost: 'game-api.test.k-id.com',
  endpoints: {
    accessAgeVerification: '/api/v1/age-verification/perform-access-age-verification',
    trustedAdultVerification: '/api/v1/age-verification/perform-trusted-adult-verification',
    facialAgeEstimation: '/api/v1/age-verification/perform-facial-age-estimation',
    ageGate: '/api/v1/widget/generate-age-gate-url',
    idVerification: '/api/v1/age-verification/perform-id-verification',
    endToEnd: '/api/v1/widget/generate-e2e-url',
    directNotices: '/api/v1/widget/generate-direct-notices-url',
    manageSessionPermissions: '/api/v1/widget/generate-manage-session-permissions-url',
  },
} as const

export const FORM_CLASSES = {
  base: 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500',
  disabled: 'bg-gray-100 text-gray-500 cursor-not-allowed',
} as const
