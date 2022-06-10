import { getSession, useSession } from 'next-auth/react';

export const currentSession = async (req = null) => {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    let session = null;
    let status = 'authenticated';
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
    let session = null;
    if (isServer && req) {
      session = await getSession({ req });
      return session;
    } else if (isServer) {
      session = await getSession();
      return session;
    } else {
      const { data: session, status } = useSession();
      return { session, status };
    }
  }
};
