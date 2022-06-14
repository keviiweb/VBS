import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { currentSession } from '@helper/sys/session';
import Layout from '@layout/sys/index';
import Loading from '@layout/sys/Loading';
import { useSession } from 'next-auth/react';

export default function Auth({ children, admin }) {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const hasUser = !!session?.user;
  const router = useRouter();
  const devSession = useRef(null);
  const isAdmin = !!admin;

  useEffect(() => {
    async function fetchData() {
      try {
        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
          devSession.current = await currentSession();
          if (isAdmin && !devSession.current.user.admin) {
            router.push('/unauthorized');
          }
        } else if (!loading && !hasUser) {
          router.push('/sys/signin');
        } else if (isAdmin && !session.user.admin) {
          router.push('/unauthorized');
        }
      } catch (error) {
        router.push('/unauthorized');
      }
    }

    fetchData();
  }, [loading, hasUser, isAdmin, router, session]);

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    return <Layout session={session}>{children}</Layout>;
  }
  if (loading || !hasUser) {
    return <Loading />;
  }

  return <Layout session={session}>{children}</Layout>;
}
