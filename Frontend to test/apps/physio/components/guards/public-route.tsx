'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { useGetMeQuery } from '@/store/api/auth-api';
import { setInitialized } from '@/store/slices/auth-slice';

export default function PublicRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    isAuthenticated,
    accessToken,
    user,
    isInitialized,
  } = useSelector((state: RootState) => state.auth);

  const { isFetching } = useGetMeQuery(undefined, {
    skip: !accessToken || !!user,
  });

  useEffect(() => {
    if (!isFetching && !accessToken && !isInitialized) {
      dispatch(setInitialized());
    }
  }, [isFetching, accessToken, isInitialized, dispatch]);

  useEffect(() => {
    // Wait until auth state is stable
    if (!isInitialized) return;

    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isInitialized, router]);

  // Stable loading state
  if (!isInitialized || isFetching) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  // Avoid flash before redirect
  if (isAuthenticated) return null;

  return <>{children}</>;
}