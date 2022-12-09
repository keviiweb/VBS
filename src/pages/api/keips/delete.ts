import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';

import { actions } from '@constants/sys/admin';
import hasPermission from '@constants/sys/permission';

import { currentSession } from '@helper/sys/sessionServer';
import { deleteAllKEIPS } from '@helper/sys/misc/keips';

export const config = {
  api: {
    bodyParser: false
  }
};

/**
 * In this file, MATNET is defined as
 * <last 4 digit of Student ID><last 4 digit of NUSNET ID>
 *
 * eg. Student ID: A1234567R, NUSNET: E0011232
 * eg. 567R1232
 */

/**
 * Deletes all data stored in the KEIPS table
 *
 * This is an KEWEB level request only
 *
 * Used in:
 * /pages/sys/manage/admin/keips
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
    hasPermission(session.user.admin, actions.DELETE_KEIPS)
  ) {
    const keipsRes: Result = await deleteAllKEIPS(session);
    if (keipsRes.status) {
      result = {
        status: true,
        error: null,
        msg: keipsRes.msg
      };
      res.status(200).send(result);
      res.end();
    } else {
      result = {
        status: false,
        error: keipsRes.error,
        msg: ''
      };
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
