import type { NextApiRequest, NextApiResponse } from 'next';
import { type Result } from 'types/api';
import { type User } from 'types/misc/user';

import { currentSession } from '@helper/sys/sessionServer';
import { searchUser } from '@helper/sys/misc/user';

import { actions } from '@constants/sys/admin';
import hasPermission from '@constants/sys/permission';
import {
  fetchSpecificCCARecord,
  isLeader,
} from '@root/src/helper/sys/cca/ccaRecord';

/**
 * Searches the residents list
 *
 *
 * Used in:
 * components/sys/cca/MemberEditModal
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

  const { ccaID, input } = req.body;

  if (session !== null && session !== undefined) {
    let ccaIDRes: string | undefined;
    if (ccaID !== undefined) {
      ccaIDRes = (ccaID as string).trim();
    }

    let inputRes: string | undefined;
    if (input !== undefined) {
      inputRes = (input as string).trim();
    }

    const userPermission: boolean = hasPermission(
      session.user.admin,
      actions.FETCH_USER_CCA_RECORD,
    );

    if (ccaIDRes !== undefined && inputRes !== undefined) {
      const checkLdr: Result = await isLeader(ccaIDRes, session);
      if (userPermission || (checkLdr.status && (checkLdr.msg as boolean))) {
        const userSearchRes: Result = await searchUser(inputRes, session);
        if (userSearchRes.status) {
          const userSearchMsg: User[] = userSearchRes.msg;
          for (let i = 0; i < userSearchMsg.length; i++) {
            const user: User = userSearchMsg[i];

            const ccaRecordRes: Result = await fetchSpecificCCARecord(
              ccaIDRes,
              user.email,
              session,
            );
            if (
              ccaRecordRes.status &&
              ccaRecordRes.msg !== undefined &&
              ccaRecordRes.msg !== null
            ) {
              user.isMemberOfCCA = true;
            } else {
              user.isMemberOfCCA = false;
            }
          }

          result = {
            status: true,
            error: null,
            msg: userSearchMsg,
          };
          res.status(200).send(result);
          res.end();
        } else {
          result = {
            status: false,
            error: userSearchRes.error,
            msg: [],
          };
          res.status(200).send(result);
          res.end();
        }
      } else {
        result = {
          status: false,
          error: 'Not a CCA leader',
          msg: [],
        };
        res.status(200).send(result);
        res.end();
      }
    }
  } else {
    result = {
      status: false,
      error: 'Unauthenticated',
      msg: [],
    };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
