import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { CCARecord } from 'types/cca/ccaRecord';

import { currentSession } from '@helper/sys/sessionServer';
import { fetchAllCCARecordByUser } from '@helper/sys/cca/ccaRecord';
import { CCA } from '@root/src/types/cca/cca';
import { findCCAbyID } from '@root/src/helper/sys/cca/cca';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null);

  let result: Result = {
    status: false,
    error: null,
    msg: '',
  };

  if (session !== null && session !== undefined) {
    const ccaDB: Result = await fetchAllCCARecordByUser(session);
    const parsedCCARecord: CCARecord[] = [];

    if (ccaDB.status) {
      const ccaData: CCARecord[] = ccaDB.msg;
      if (ccaData.length > 0) {
        for (let ven = 0; ven < ccaData.length; ven += 1) {
          if (ccaData[ven]) {
            const record: CCARecord = ccaData[ven];
            const { ccaID } = record;
            const ccaDetailsRes: Result = await findCCAbyID(ccaID);
            if (ccaDetailsRes.status) {
              const ccaDetails: CCA = ccaDetailsRes.msg;
              const data: CCARecord = {
                id: record.id,
                ccaID: record.ccaID,
                leader: record.leader,
                ccaName: ccaDetails.name,
                image: ccaDetails.image,
              };

              parsedCCARecord.push(data);
            } else {
              console.error(ccaDetailsRes.error);
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
        error: ccaDB.error,
        msg: [],
      };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = { status: false, error: 'Unauthenticated', msg: '' };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
