import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import { currentSession } from '@helper/sys/session';

import Layout from '@layout/sys/index';
import Loading from '@layout/sys/Loading';
import { type Session } from 'next-auth/core/types';
import { actions } from '@constants/sys/admin';
import hasPermission from '@constants/sys/permission';

/**
 * This component checks if the user is authenticated.
 *
 * If the user is authenticated:
 * 1. If the admin flag is set to true, check whether the user has the correct permission
 * 2. If the user does not have the correct permission, redirect to /unauthorized path
 * 3. Else, display the content
 *
 * If the user is not authenticated, redirect to signin page
 *
 * @param param0 React Children and Admin boolean
 * @returns The layout to display to users
 */
export default function Auth({ children, admin }) {
  const { data: session, status } = useSession();
  const loading: boolean = status === 'loading';
  const hasUser: boolean = !(session?.user == null);
  const router = useRouter();
  const devSession = useRef<Session | null>(null);
  const isAdmin: boolean = admin !== undefined;

  useEffect(() => {
    async function fetchData() {
      try {
        if (
          process.env.NEXT_PUBLIC_SETDEV === 'true' &&
          (process.env.NODE_ENV === undefined ||
            process.env.NODE_ENV === null ||
            process.env.NODE_ENV === 'development')
        ) {
          devSession.current = await currentSession();
          if (devSession.current !== null && devSession.current.user !== null) {
            if (!devSession.current.user.acceptedTerm) {
              await router.push('/sys/acceptTerms');
            } else if (isAdmin) {
              const permission: boolean = hasPermission(
                devSession.current.user.admin,
                actions.VIEW_ADMIN_PAGE,
              );

              if (permission !== null && !permission) {
                await router.push('/sys/unauthorized');
              }
            }
          }
        } else if (!loading && !hasUser) {
          await router.push('/sys/signin');
        } else if (
          session !== null &&
          session.user !== null &&
          status === 'authenticated'
        ) {
          if (!session.user.acceptedTerm) {
            await router.push('/sys/acceptTerms');
          } else if (isAdmin) {
            const permission: boolean = hasPermission(
              session.user.admin,
              actions.VIEW_ADMIN_PAGE,
            );

            if (permission !== null && !permission) {
              await router.push('/sys/unauthorized');
            }
          }
        }
      } catch (error) {
        await router.push('/sys/unauthorized');
      }
    }

    fetchData();
  }, [loading, hasUser, isAdmin, router, session, status]);

  if (
    process.env.NEXT_PUBLIC_SETDEV === 'true' &&
    (process.env.NODE_ENV === undefined ||
      process.env.NODE_ENV === null ||
      process.env.NODE_ENV === 'development')
  ) {
    return <Layout session={devSession.current}>{children}</Layout>;
  }

  if (loading || !hasUser) {
    return <Loading />;
  }

  return <Layout session={session}>{children}</Layout>;
}
