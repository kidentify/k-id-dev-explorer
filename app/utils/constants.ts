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
    accessAgeVerification: '/api/v1/age-verification/perform-access-age-verification',
    
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
    
    // AgeKey Verification endpoint
    // Documentation: https://docs.k-id.com/api/endpoints/perform-age-key-verification
    ageKeyVerification: '/api/v1/age-verification/perform-age-key-verification',
    
    // Connect ID Verification endpoint
    // Documentation: https://docs.k-id.com/api/endpoints/perform-connect-id-verification
    connectIdVerification: '/api/v1/age-verification/perform-connect-id-verification',
    
    // Email Age Estimation endpoint - performs email inference with background check via VerifyMy
    // Documentation: https://docs.k-id.com/api/endpoints/perform-inference
    emailInference: '/api/v1/age-verification/perform-inference',
    
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
