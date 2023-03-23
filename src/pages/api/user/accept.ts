import type { NextApiRequest, NextApiResponse } from 'next';
import { type Result } from 'types/api';
import { type User } from 'types/misc/user';

import { currentSession } from '@helper/sys/sessionServer';
import { acceptTermsForUser, fetchUserByEmail } from '@helper/sys/misc/user';

/**
 * Accepts terms and conditions
 *
 * Used in:
 * /pages/sys/acceptTerms
 *
 * @param req NextJS API Request
 * @param res NextJS API Response
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null);

  let result: Result = {
    status: false,
    error: null,
    msg: '',
  };

  if (session !== undefined && session !== null) {
    const doesUserExistRes: Result = await fetchUserByEmail(
      session.user.email,
      session,
    );
    if (doesUserExistRes.status) {
      const user: User = doesUserExistRes.msg;
      const userRes = await acceptTermsForUser(user, session);
      if (userRes.status) {
        result = { status: true, error: null, msg: userRes.msg };
        res.status(200).send(result);
        res.end();
      } else {
        result = { status: false, error: userRes.error, msg: '' };
        res.status(200).send(result);
        res.end();
      }
    } else {
      result = { status: false, error: doesUserExistRes.error, msg: '' };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = { status: false, error: 'Unauthenticated request', msg: '' };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
