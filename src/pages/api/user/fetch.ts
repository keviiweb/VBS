import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { User } from 'types/misc/user';

import { currentSession } from '@helper/sys/sessionServer';
import { fetchAllUser, countUser } from '@helper/sys/misc/user';
import { levels } from '@constants/sys/admin';

/**
 * Fetches the list of users
 *
 * This is an OWNER level request only
 *
 * @param req NextJS API Request
 * @param res NextJS API Response
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null);

  const limitQuery = req.query.limit;
  const skipQuery = req.query.skip;

  let result: Result = {
    status: false,
    error: null,
    msg: '',
  };

  if (
    session !== null &&
    session !== undefined &&
    session.user.admin === levels.OWNER
  ) {
    const limit: number = limitQuery !== undefined ? Number(limitQuery) : 100;
    const skip: number = skipQuery !== undefined ? Number(skipQuery) : 0;

    const userDB: Result = await fetchAllUser(limit, skip);
    const count: number = await countUser();

    const parsedUser: User[] = [];

    if (userDB.status) {
      const userData: User[] = userDB.msg;
      if (count > 0) {
        for (let ven = 0; ven < userData.length; ven += 1) {
          if (userData[ven]) {
            const user: User = userData[ven];

            const isAdmin: string = user.admin ? 'Yes' : 'No';

            const data: User = {
              id: user.id,
              name: user.name,
              studentID: user.studentID,
              roomNum: user.roomNum,
              email: user.email,
              admin: user.admin,
              adminStr: isAdmin,
            };

            parsedUser.push(data);
          }
        }
      }

      result = {
        status: true,
        error: null,
        msg: { count: count, res: parsedUser },
      };
      res.status(200).send(result);
      res.end();
    } else {
      result = {
        status: false,
        error: userDB.error,
        msg: { count: 0, res: [] },
      };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = {
      status: false,
      error: 'Unauthenticated',
      msg: { count: 0, res: [] },
    };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
