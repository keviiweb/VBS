import { getSession } from 'next-auth/react';
import { Session } from 'next-auth/core/types';
import { NextApiRequest } from 'next';
import { levels } from '@constants/sys/admin';

/**
 * Retrieves the current session. This function is used for client-sided requests
 *
 * @param req NextJS Request
 * @returns A Next-Auth Session or null wrapped in a Promise
 */
export const currentSession = async (
  req: NextApiRequest | null = null,
): Promise<Session | null> => {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    let session: Session | null = null;
    session = {
      expires: '1',
      user: {
        username: 'Test user',
        email: 'testing@test.com',
        admin: levels.OWNER,
        studentID: 'A7654321',
        roomNum: 'C124',
      },
    };

    return session;
  } else {
    const isServer = typeof window === 'undefined';
    let session: Session | null = null;
    if (isServer && req) {
      session = await getSession({ req });
    } else {
      session = await getSession();
    }
    return session;
  }
};
