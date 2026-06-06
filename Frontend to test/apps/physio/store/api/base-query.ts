import { fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { updateAccessToken, logoutUser } from '../slices/auth-slice';
import { RootState } from '../store';

const API_BASE_URL = 'https://identity.physio.agregatech.com/api/v1/kine/auth';

// Centralized list of public endpoints
const PUBLIC_ENDPOINTS = ['login', 'register', 'forgotPassword', 'verifyCode', 'resetPassword', 'previewInvitation', 'acceptInvitation'];

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState, endpoint }) => {
    const token = (getState() as RootState).auth.accessToken;
    console.log(`Preparing headers for endpoint "${endpoint}". Access token present: ${!!token}`);

    if (token && !PUBLIC_ENDPOINTS.includes(endpoint)) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Execute the initial request
  let result = await baseQuery(args, api, extraOptions);

  const isPublicEndpoint = PUBLIC_ENDPOINTS.includes(api.endpoint);

  if (result.error && result.error.status === 401 && !isPublicEndpoint) {
    const state = api.getState() as RootState;
    const refreshToken = state.auth.refreshToken;

    // Only attempt refresh if we actually have a refresh token in memory
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: `${API_BASE_URL}/refresh`,
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const data = refreshResult.data as { accessToken: string; refreshToken?: string };
        
        // Update store with new tokens
        api.dispatch(updateAccessToken({ 
          accessToken: data.accessToken, 
          refreshToken: data.refreshToken 
        }));

        // Retry the original failed request
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed (token expired/revoked) -> Logout
        api.dispatch(logoutUser());
      }
    } else {
      // No refresh token available -> Logout
      api.dispatch(logoutUser());
    }
  }

  return result;
};