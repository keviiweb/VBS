import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { User } from 'types/misc/user';

import { checkerString } from '@constants/sys/helper';
import { actions } from '@constants/sys/admin';
import hasPermission from '@constants/sys/permission';

import { currentSession } from '@helper/sys/sessionServer';
import { editUser } from '@helper/sys/misc/user';

/**
 * Edit the user
 *
 * This is an OWNER level request only
 *
 * Used in:
 * /pages/sys/manage/admin/users
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

  const { id, name, email, admin } = req.body;

  if (
    session !== undefined &&
    session !== null &&
    hasPermission(session.user.admin, actions.EDIT_USER)
  ) {
    if (checkerString(id) && checkerString(name) && checkerString(email)) {
      const idField: string = (id as string).trim();
      const nameField: string = (name as string).trim();
      const emailField: string = (email as string).trim().toLowerCase();
      const adminField: number = admin as number;

      const user: User = {
        id: idField,
        name: nameField,
        email: emailField,
        admin: adminField,
        updated_at: new Date().toISOString(),
      };

      const userRes = await editUser(user, session);
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
      result = { status: false, error: 'Missing information', msg: '' };
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
