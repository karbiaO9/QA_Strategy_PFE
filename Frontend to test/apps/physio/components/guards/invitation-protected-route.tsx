'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { RootState } from '@/store/store';
import { useGetMeQuery } from '@/store/api/auth-api';
import { setInitialized } from '@/store/slices/auth-slice';

export default function InvitationProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    isAuthenticated,
    isInitialized,
    accessToken,
    user,
  } = useSelector((state: RootState) => state.auth);

  // Refresh user if token exists
  const { isFetching } = useGetMeQuery(undefined, {
    skip: !accessToken || !!user,
  });

  useEffect(() => {
    if (!isFetching && !accessToken && !isInitialized) {
      dispatch(setInitialized());
    }
  }, [isFetching, accessToken, isInitialized, dispatch]);

  useEffect(() => {
    if (!isInitialized) return;

    const inviteId =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('pc_invite_id')
        : null;

    // Must be authenticated
    if (!isAuthenticated) {
      router.replace('/login?inviteContext=true');
      return;
    }

    // Must have invitation context
    if (!inviteId) {
      router.replace('/');
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized || isFetching) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}