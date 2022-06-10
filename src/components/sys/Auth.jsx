import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { currentSession } from '@helper/sys/session';
import Layout from '@layout/sys/index';
import Loading from '@layout/sys/Loading';

function Auth({ children, admin }) {
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const { session, status } = await currentSession();
        const loading = status === 'loading';
        const hasUser = !!session?.user;
        const isAdmin = !!admin;

        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
          if (isAdmin && !session.user.admin) {
            router.push('/unauthorized');
          } else {
            return <Layout>{children}</Layout>;
          }
        } else if (!loading && !hasUser) {
          router.push('/sys/signin');
        } else if (isAdmin && !session.user.admin) {
          router.push('/unauthorized');
        } else {
          if (loading || !hasUser) {
            return <Loading />;
          }
          return <Layout>{children}</Layout>;
        }

        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    }

    fetchData();
  }, [admin, children, router]);
}

export default Auth;
