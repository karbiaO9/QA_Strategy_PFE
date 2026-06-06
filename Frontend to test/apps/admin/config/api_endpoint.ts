export const ENDPOINT_API = {
  AUTH: {
    LOGIN: '/api/admin/v1/auth/login',
    LOGOUT: '/api/admin/v1/auth/logout',
    REFRESH: '/api/admin/v1/auth/refresh',
    FORGOT_PASSWORD: '/api/admin/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/admin/v1/auth/reset-password',
    CHANGE_PASSWORD: '/api/admin/v1/auth/change-password',
    VERIFY_CODE: '/api/admin/v1/auth/verify-code',
  },
  ME: {
    GET: '/api/admin/v1/me',
    PATCH: '/api/admin/v1/me',
  },
} as const;
