import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { CCARecord } from 'types/cca/ccaRecord';
import { CCA } from 'types/cca/cca';

import { currentSession } from '@helper/sys/sessionServer';
import { fetchAllCCARecordByUserEmail } from '@helper/sys/cca/ccaRecord';
import { findCCAbyID } from '@helper/sys/cca/cca';

import { actions } from '@constants/sys/admin';
import hasPermission from '@constants/sys/permission';

/**
 * Fetches the CCA records for a specific user
 *
 * This is an JCRC level or KEWEB level request only.
 *
 * Used in:
 * @components/sys/misc/UserModal
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

  const { email } = req.body;

  if (
    session !== null &&
    session !== undefined &&
    hasPermission(session.user.admin, actions.FETCH_USER_CCA_RECORD)
  ) {
    const parsedCCARecord: CCARecord[] = [];

    let emailRes: string | undefined;
    if (email !== undefined) {
      emailRes = (email as string).trim();
    }

    if (emailRes !== undefined) {
      const fetchRes: Result = await fetchAllCCARecordByUserEmail(
        emailRes,
        session,
      );
      if (fetchRes.status) {
        const userRecords: CCARecord[] = fetchRes.msg as CCARecord[];
        if (userRecords.length > 0) {
          for (let key = 0; key < userRecords.length; key += 1) {
            const record: CCARecord = userRecords[key];
            const { ccaID } = record;
            const ccaDetailsRes: Result = await findCCAbyID(ccaID, session);
            if (
              ccaDetailsRes.status &&
              ccaDetailsRes.msg !== null &&
              ccaDetailsRes !== undefined
            ) {
              const ccaDetails: CCA = ccaDetailsRes.msg;
              const data: CCARecord = {
                id: record.id,
                ccaID: record.ccaID,
                leader: record.leader,
                ccaName: ccaDetails.name,
                image: ccaDetails.image,
              };

              parsedCCARecord.push(data);
            }
          }
        }

        result = {
          status: true,
          error: null,
          msg: parsedCCARecord,
        };
        res.status(200).send(result);
        res.end();
      } else {
        result = {
          status: false,
          error: 'No records found',
          msg: [],
        };
        res.status(200).send(result);
        res.end();
      }
    } else {
      result = {
        status: false,
        error: 'Missing information',
        msg: [],
      };
      res.status(200).send(result);
      res.end();
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
