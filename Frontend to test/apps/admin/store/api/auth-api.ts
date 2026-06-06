import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ENDPOINT_API } from '../../config/api_endpoint';
import { logout, setCredentials } from '../slices/auth-slice';
import { getSession } from 'next-auth/react';
import { handleDefaultApiEffect, handleSyncAuthState } from '@physio-connect-frontend/shared-ui';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_ADMIN || 'https://identity.physio.agregatech.com';

const mapUser = (user: any) => ({
  id: user.id,
  firstName: user.firstName || user.name?.split(" ")[0] || "",
  lastName: user.lastName || user.name?.split(" ")[1] || "",
  email: user.email || "",
  profilePhoto: user.profilePhoto || user.image || null,
  cabinetId: user.cabinetId || "",
  role: user.role || { slug: "" },
});

export const authApi = createApi({
  reducerPath: 'authApi',
  tagTypes: ['User'],
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: async (headers) => {
      const session = await getSession();
      // @ts-ignore
      const token = session?.accessToken;
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: ENDPOINT_API.AUTH.LOGIN,
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: any) => ({
        ...response,
        user: mapUser(response.user),
      }),
      onQueryStarted: (arg, { dispatch, queryFulfilled }) => 
        handleSyncAuthState(queryFulfilled, dispatch, (data) => setCredentials({ 
          user: data.user, 
          permissions: data.permissions 
        })),
    }),
    logout: builder.mutation({
      query: () => ({
        url: ENDPOINT_API.AUTH.LOGOUT,
        method: 'POST',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch (err) {
          handleDefaultApiEffect(queryFulfilled);
        }
      },
    }),
    getMe: builder.query({
      query: () => ENDPOINT_API.ME.GET,
      providesTags: ['User'],
      transformResponse: (response: any) => ({
        ...response,
        user: mapUser(response.user),
      }),
      onQueryStarted: (arg, { dispatch, queryFulfilled }) => 
        handleSyncAuthState(queryFulfilled, dispatch, (data) => setCredentials({ 
          user: data.user, 
          permissions: data.permissions 
        })),
    }),
    updateMe: builder.mutation({
      query: (body) => ({
        url: ENDPOINT_API.ME.PATCH,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
      transformResponse: (response: any) => ({
        ...response,
        user: mapUser(response.user),
      }),
      onQueryStarted: (arg, { dispatch, queryFulfilled }) => 
        handleSyncAuthState(queryFulfilled, dispatch, (data) => setCredentials({ user: data.user })),
    }),
    refreshToken: builder.mutation({
      query: (body) => ({
        url: ENDPOINT_API.AUTH.REFRESH,
        method: 'POST',
        body,
      }),
      onQueryStarted: (arg, { queryFulfilled }) => handleDefaultApiEffect(queryFulfilled),
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({
        url: ENDPOINT_API.AUTH.FORGOT_PASSWORD,
        method: 'POST',
        body,
      }),
      onQueryStarted: (arg, { queryFulfilled }) => handleDefaultApiEffect(queryFulfilled),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({
        url: ENDPOINT_API.AUTH.RESET_PASSWORD,
        method: 'POST',
        body,
      }),
      onQueryStarted: (arg, { queryFulfilled }) => handleDefaultApiEffect(queryFulfilled),
    }),
    changePassword: builder.mutation({
      query: (body) => ({
        url: ENDPOINT_API.AUTH.CHANGE_PASSWORD,
        method: 'POST',
        body,
      }),
      onQueryStarted: (arg, { queryFulfilled }) => handleDefaultApiEffect(queryFulfilled),
    }),
    verifyCode: builder.mutation({
      query: (body) => ({
        url: ENDPOINT_API.AUTH.VERIFY_CODE,
        method: 'POST',
        body,
      }),
      onQueryStarted: (arg, { queryFulfilled }) => handleDefaultApiEffect(queryFulfilled),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useVerifyCodeMutation,
} = authApi;
