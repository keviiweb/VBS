import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import { currentSession } from '@helper/sys/session';

import Layout from '@layout/sys/index';
import Loading from '@layout/sys/Loading';
import { Session } from 'next-auth/core/types';
import { levels } from '@constants/sys/admin';

export default function Auth({ children, admin }) {
  const { data: session, status } = useSession();
  const loading: boolean = status === 'loading';
  const hasUser: boolean = !!session?.user;
  const router = useRouter();
  const devSession = useRef<Session | null>(null);
  const isAdmin: boolean = admin !== undefined;

  useEffect(() => {
    async function fetchData() {
      try {
        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
          devSession.current = await currentSession();
          if (isAdmin && devSession.current !== null) {
            if (!devSession.current.user.admin) {
              router.push('/unauthorized');
            } else if (
              !(
                devSession.current.user.admin === levels.ADMIN ||
                devSession.current.user.admin === levels.OWNER
              )
            ) {
              router.push('/unauthorized');
            }
          }
        } else if (!loading && !hasUser) {
          router.push('/sys/signin');
        } else if (isAdmin && session !== null && status === 'authenticated') {
          if (!session.user.admin) {
            router.push('/unauthorized');
          } else if (
            !(
              session.user.admin === levels.ADMIN ||
              session.user.admin === levels.OWNER
            )
          ) {
            router.push('/unauthorized');
          }
        }

        if (!loading && !hasUser) {
          router.push('/sys/signin');
        } else if (isAdmin && session !== null && status === 'authenticated') {
          if (!session.user.admin) {
            router.push('/unauthorized');
          } else if (
            !(
              session.user.admin === levels.ADMIN ||
              session.user.admin === levels.OWNER
            )
          ) {
            router.push('/unauthorized');
          }
        }
      } catch (error) {
        router.push('/unauthorized');
      }
    }

    fetchData();
  }, [loading, hasUser, isAdmin, router, session, status]);

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    return <Layout session={devSession.current}>{children}</Layout>;
  }

  if (loading || !hasUser) {
    return <Loading />;
  }

  return <Layout session={session}>{children}</Layout>;
}
