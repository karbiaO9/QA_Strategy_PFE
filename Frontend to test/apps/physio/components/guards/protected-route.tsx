'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { RootState } from '@/store/store';
import { useGetMeQuery } from '@/store/api/auth-api';
import { setInitialized } from '@/store/slices/auth-slice';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized, accessToken, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  // 1. If we have a token but no user data (e.g. on refresh), fetch the user.
  // This is what will eventually set isInitialized to true via extraReducers.
  const { isFetching, isError } = useGetMeQuery(undefined, {
    skip: !accessToken || !!user,
  });

  useEffect(() => {
    // 2. If we aren't fetching, and we haven't initialized yet (and no token exists),
    // we need to manually trigger initialization so the UI can proceed.
    if (!isFetching && !accessToken && !isInitialized) {
      dispatch(setInitialized());
    }
  }, [isFetching, accessToken, isInitialized, dispatch]);

  useEffect(() => {
    // 3. Only redirect if we are fully initialized and definitely not authenticated.
    if (isInitialized && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  // 4. Stay in the loading state if:
  // - We are still fetching the user
  // - OR we haven't finished the initialization process
  if (!isInitialized || isFetching) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 5. Final safety check: if we are initialized but not authenticated, 
  // the useEffect above will handle the redirect. return null to avoid UI flash.
  if (!isAuthenticated) return null;

  return <>{children}</>;
}