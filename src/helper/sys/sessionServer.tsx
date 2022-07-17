import { Session } from 'next-auth/core/types';
import { options } from '@constants/sys/nextAuthOptions';
import { unstable_getServerSession } from 'next-auth/next';
import { levels } from '@constants/sys/admin';

export const currentSession = async (
  request: any = null,
  response: any = null,
  context: any = null,
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
    let session: Session | null = null;
    if (context !== null) {
      session = (await unstable_getServerSession(
        context.req,
        context.res,
        options,
      )) as Session;
    } else if (request !== null && response !== null) {
      session = (await unstable_getServerSession(
        request,
        response,
        options,
      )) as Session;
    }
    return session;
  }
};
