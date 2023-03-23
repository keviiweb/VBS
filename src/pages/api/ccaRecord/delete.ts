import type { NextApiRequest, NextApiResponse } from 'next';
import { type Result } from 'types/api';
import { type CCARecord } from 'types/cca/ccaRecord';

import { currentSession } from '@helper/sys/sessionServer';
import {
  isLeader,
  fetchSpecificCCARecord,
  deleteCCARecord,
} from '@helper/sys/cca/ccaRecord';

import hasPermission from '@constants/sys/permission';
import { actions } from '@constants/sys/admin';

/**
 * Create a CCA record for the resident
 *
 * Used in:
 * @components/sys/cca/MemberEditModal
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

  const { ccaID, email } = req.body;

  if (session !== null && session !== undefined) {
    let ccaIDRes: string | undefined;
    if (ccaID !== undefined) {
      ccaIDRes = (ccaID as string).trim();
    }

    let emailRes: string | undefined;
    if (email !== undefined) {
      emailRes = (email as string).trim();
    }

    const userPermission: boolean = hasPermission(
      session.user.admin,
      actions.FETCH_USER_CCA_RECORD,
    );

    if (ccaIDRes !== undefined && emailRes !== undefined) {
      const checkLdr: Result = await isLeader(ccaIDRes, session);
      if (userPermission || (checkLdr.status && (checkLdr.msg as boolean))) {
        const existCCARecordRes: Result = await fetchSpecificCCARecord(
          ccaIDRes,
          emailRes,
          session,
        );
        if (
          existCCARecordRes.status &&
          existCCARecordRes.msg !== undefined &&
          existCCARecordRes.msg !== null
        ) {
          const existCCARecordResMsg: CCARecord = existCCARecordRes.msg;

          const ccaRecord: CCARecord = {
            id: existCCARecordResMsg.id,
            ccaID: ccaIDRes,
            sessionEmail: emailRes,
            leader: false,
          };

          const ccaRecordRes: Result = await deleteCCARecord(
            ccaRecord,
            session,
          );
          if (ccaRecordRes.status) {
            result = {
              status: true,
              error: null,
              msg: ccaRecordRes.msg,
            };
            res.status(200).send(result);
            res.end();
          } else {
            result = {
              status: false,
              error: ccaRecordRes.error,
              msg: '',
            };
            res.status(200).send(result);
            res.end();
          }
        } else {
          result = {
            status: false,
            error: 'Resident is already not a member of the CCA!',
            msg: '',
          };
          res.status(200).send(result);
          res.end();
        }
      } else {
        result = {
          status: false,
          error: 'Not a CCA leader',
          msg: { count: 0, res: [] },
        };
        res.status(200).send(result);
        res.end();
      }
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
