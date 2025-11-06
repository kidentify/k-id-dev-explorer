export const BUTTON_COLORS = {
  primary: '#745eee',
  hover: '#6a4fd8',
  disabled: '#a08ff0',
} as const

/**
 * Configuration for k-ID CDK API endpoints.
 * 
 * These endpoints are used to initiate various CDK flows. Each endpoint returns
 * a URL that should be embedded in an iframe to display the verification interface.
 * 
 * All endpoints require:
 * - Bearer token authentication (API key)
 * - POST method (except status endpoints)
 * - JSON request body
 * 
 */
export const API_CONFIG = {
  defaultHost: 'game-api.test.k-id.com',
  endpoints: {
    // Access Age Verification endpoint
    // Documentation: https://docs.k-id.com/reference/api/endpoints/access-age-verification
    accessAgeVerification: '/api/v1/age-verification/perform',
    
    // Trusted Adult Verification endpoint
    // Documentation: https://docs.k-id.com/reference/api/endpoints/trusted-adult-verification
    trustedAdultVerification: '/api/v1/age-verification/perform-trusted-adult-verification',
    
    // Facial Age Estimation endpoint
    // Documentation: https://docs.k-id.com/reference/api/endpoints/facial-age-estimation
    facialAgeEstimation: '/api/v1/age-verification/perform-facial-age-estimation',
    
    // Age Gate widget endpoint - generates a URL for age gate widget
    // Documentation: https://docs.k-id.com/reference/api/endpoints/age-gate
    ageGate: '/api/v1/widget/generate-age-gate-url',
    
    // ID Verification endpoint
    // Documentation: https://docs.k-id.com/reference/api/endpoints/id-verification
    idVerification: '/api/v1/age-verification/perform-id-verification',
    
    // End-to-End widget endpoint - generates a URL for full E2E flow
    // Documentation: https://docs.k-id.com/reference/api/endpoints/end-to-end
    endToEnd: '/api/v1/widget/generate-e2e-url',
    
    // Direct Notices widget endpoint
    // Documentation: https://docs.k-id.com/reference/api/endpoints/direct-notices
    directNotices: '/api/v1/widget/generate-direct-notices-url',
    
    // Manage Session Permissions widget endpoint
    // Documentation: https://docs.k-id.com/reference/api/endpoints/manage-session-permissions
    manageSessionPermissions: '/api/v1/widget/generate-manage-session-permissions-url',
    
    // Age Appeal endpoint - allows users to appeal age verification decisions
    // Documentation: https://docs.k-id.com/reference/api/endpoints/age-appeal
    ageAppeal: '/api/v1/age-verification/perform-age-appeal',
  },
} as const

export const FORM_CLASSES = {
  base: 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500',
  disabled: 'bg-gray-100 text-gray-500 cursor-not-allowed',
} as const
