import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { CCARecord } from 'types/cca/ccaRecord';
import { CCA } from 'types/cca/cca';

import { currentSession } from '@helper/sys/sessionServer';
import { fetchAllCCARecordByUserEmail } from '@helper/sys/cca/ccaRecord';

import { levels } from '@constants/sys/admin';
import { findCCAbyID } from '@root/src/helper/sys/cca/cca';

/**
 * Fetches the CCA records for a specific user
 *
 * This is an OWNER and ADMIN level request only
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
    (session.user.admin === levels.ADMIN || session.user.admin === levels.OWNER)
  ) {
    const parsedCCARecord: CCARecord[] = [];

    let emailRes: string | undefined;
    if (email !== undefined) {
      emailRes = (email as string).trim();
    }

    if (emailRes !== undefined) {
      const fetchRes: Result = await fetchAllCCARecordByUserEmail(emailRes);
      if (fetchRes.status) {
        const userRecords: CCARecord[] = fetchRes.msg as CCARecord[];
        if (userRecords.length > 0) {
          for (let key = 0; key < userRecords.length; key += 1) {
            if (userRecords[key]) {
              const record: CCARecord = userRecords[key];
              const { ccaID } = record;
              const ccaDetailsRes: Result = await findCCAbyID(ccaID);
              if (ccaDetailsRes.status && ccaDetailsRes.msg) {
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
