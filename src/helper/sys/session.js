import { getSession, useSession } from 'next-auth/react';

export const currentSession = async (req = null) => {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    let session = null;
    let status = 'unauthenticated';

    session = {
      expires: '1',
      user: {
        username: 'Test user',
        email: 'testing@test.com',
        admin: true,
        studentID: 'A7654321',
      },
    };

    return { session, status };
  } else {
    const isServer = typeof window === 'undefined';

    if (isServer && req) {
      let session = null;
      let status = 'unauthenticated';

      session = await getSession({ req });
      if (session) {
        status = 'authenticated';
      }

      return { session, status };
    } else {
      const { data: session, status } = useSession();
      return { session, status };
    }
  }
};
