import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';

import { actions } from '@constants/sys/admin';
import hasPermission from '@constants/sys/permission';

import { currentSession } from '@helper/sys/sessionServer';
import { deleteAllLog } from '@helper/sys/misc/logger';

/**
 * Delete all Logs
 *
 * This is an KEWEB level request only
 *
 * Used in:
 * /pages/sys/manage/admin/misc
 *
 * @param req NextJS API Request
 * @param res NextJS API Response
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null);

  let result: Result = {
    status: false,
    error: null,
    msg: ''
  };

  if (
    session !== undefined &&
    session !== null &&
    hasPermission(session.user.admin, actions.EDIT_USER)
  ) {
    const logRes: Result = await deleteAllLog();
    if (logRes.status) {
      result = { status: true, error: null, msg: logRes.msg };
      res.status(200).send(result);
      res.end();
    } else {
      result = { status: false, error: logRes.error, msg: '' };
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
