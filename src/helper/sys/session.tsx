import { getSession } from 'next-auth/react';
import { Session } from 'next-auth/core/types';
import { NextApiRequest } from 'next';

export const currentSession = async (
  req: NextApiRequest = null,
): Promise<Session> => {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    let session = null;
    session = {
      expires: '1',
      user: {
        username: 'Test user',
        email: 'testing@test.com',
        admin: true,
        studentID: 'A7654321',
      },
    };

    return session;
  } else {
    const isServer = typeof window === 'undefined';
    let session = null;
    if (isServer && req) {
      session = await getSession({ req });
      return session;
    } else {
      session = await getSession();
      return session;
    }
  }
};
