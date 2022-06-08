import { getSession } from 'next-auth/react';

export const currentSession = async (req = null) => {
  var session = null;
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    session = {
      expires: '1',
      user: {
        username: 'Test user',
        email: 'testing@test.com',
        admin: true,
        studentID: 'A7654321',
      },
    };
  } else {
    const isServer = typeof window === 'undefined';
    let session = null;
    if (isServer && req) {
      session = await getSession({ req });
    } else {
      session = await getSession();
    }

    return session;
  }

  return session;
};
