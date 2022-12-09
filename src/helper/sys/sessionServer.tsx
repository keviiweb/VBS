import { Session } from 'next-auth/core/types';
import { options } from '@constants/sys/nextAuthOptions';
import { unstable_getServerSession } from 'next-auth/next';
import { levels } from '@constants/sys/admin';

/**
 * Retrieves the current session. This function is used for server-sided requests
 *
 * @param request NextJS Request
 * @param response NextJS Response
 * @param context Request Context
 * @returns A Next-Auth Session or null wrapped in a Promise
 */
export const currentSession = async (
  request: any = null,
  response: any = null,
  context: any = null
): Promise<Session | null> => {
  if (
    process.env.NEXT_PUBLIC_SETDEV === 'true' &&
    (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')
  ) {
    let session: Session | null = null;
    session = {
      expires: '1',
      user: {
        username: 'Test user',
        email: 'testing@test.com',
        admin: levels.KEWEB,
        acceptedTerm: true
      }
    };

    return session;
  } else {
    let session: Session | null = null;
    if (context !== null) {
      session = (await unstable_getServerSession(
        context.req,
        context.res,
        options
      )) as Session;
    } else if (request !== null && response !== null) {
      session = (await unstable_getServerSession(
        request,
        response,
        options
      )) as Session;
    }
    return session;
  }
};
