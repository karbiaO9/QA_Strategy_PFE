import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './base-query';
import { setCredentials, updateUserInfo, logoutUser, switchActiveProfile } from '../slices/auth-slice';

const API_BASE_URL = 'https://identity.physio.agregatech.com/api/v1/kine/auth';
const API_KINE_URL = 'https://identity.physio.agregatech.com/api/v1/kine';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: `${API_BASE_URL}/login`,
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Assuming the login payload returns everything needed.
          // If it only returns a token, you would trigger the /me query here instead.
          console.log('Login successful, updating auth state with:', data);
          dispatch(setCredentials({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            profiles: data.profiles,
            lastProfileId: data.lastProfileId
          }));
        } catch (err) {
          // Handle login failure natively in the component
          console.log('Login failed:', err);
        }
      },
    }),
    register: builder.mutation({
      query: (userData: FormData | Record<string, any>) => ({ 
        url: `${API_BASE_URL}/register`, 
        method: 'POST', 
        body: userData 
      }),
    }),
    logout: builder.mutation({
      query: () => ({ url: `${API_BASE_URL}/logout`, method: 'POST' }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(logoutUser());
      },
    }),
    getMe: builder.query({
      query: () => `${API_KINE_URL}/me`,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("getMe successful, updating user info with:", data);
          dispatch(updateUserInfo({
            user: data.user,
            profiles: data.availableProfiles || [],
            activeProfile: data.profile // This profile object contains the detailed permissions array
          }));
        } catch (err) {
            // Handle error
        }
      }
    }),
    // Password Management Endpoints
    forgotPassword: builder.mutation({
      query: (email) => ({ url: `${API_BASE_URL}/forgot-password`, method: 'POST', body: { email } }),
    }),
    verifyCode: builder.mutation({
      query: (data) => ({ url: `${API_BASE_URL}/verify-code`, method: 'POST', body: data }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({ url: `${API_BASE_URL}/reset-password`, method: 'POST', body: data }),
    }),
    changePassword: builder.mutation({
      query: (data) => ({ url: `${API_BASE_URL}/change-password`, method: 'POST', body: data }),
    }),
    // Profile Management
    selectProfile: builder.mutation({
      query: (profileId) => ({
        url: `${API_BASE_URL}/select-profile`,
        method: 'POST',
        body: { profileId },
      }),
      async onQueryStarted(profileId, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(switchActiveProfile(profileId));
          console.log('Profile successfully switched on backend');
        } catch (err) {
          // The UI will remain on the old profile, preventing a desync.
          console.error('Failed to switch profile on backend:', err);
        }
      },
    }),
    addProfile: builder.mutation({
      query: (formData: FormData) => ({
        url: `${API_KINE_URL}/profiles`,
        method: 'POST',
        body: formData,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // data: { newProfileId, profiles, me, ... }
          // We update the store with the new list of profiles provided by 'me'
          dispatch(updateUserInfo({
            user: data.me.user,
            profiles: data.me.profiles || [],
            activeProfile: data.me.profiles.find((p: any) => p.id === data.newProfileId) || data.me.profiles[0]
          }));
          
          // Optionally update the full profiles list in the state
          // This ensures the Switcher has the latest data
        } catch (err) {
          console.log('Add profile failed:', err);
        }
      },
    }),
    // invitations
    addPractitioner: builder.mutation({
      query: (data) => ({ url: `${API_BASE_URL}/invitations`, method: 'POST', body: data }),
    }),
    previewInvitation: builder.query({
      query: (data) => ({ url: `${API_BASE_URL}/invitations/preview`, method: 'POST', body: data }),
    }),
    acceptInvitation: builder.mutation({
      query: (data) => ({ url: `${API_BASE_URL}/accept-invitation`, method: 'POST', body: data }),
    }),
    attachProfile: builder.mutation({
      query: (data) => ({ url: `${API_BASE_URL}/invitations/attach`, method: 'POST', body: data }),    
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
  useForgotPasswordMutation,
  useVerifyCodeMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useSelectProfileMutation,
  useAddProfileMutation,
  useAddPractitionerMutation,
  usePreviewInvitationQuery,
  useAcceptInvitationMutation,
  useAttachProfileMutation,
} = authApi;