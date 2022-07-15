import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { CCASession } from 'types/cca/ccaSession';

import { currentSession } from '@helper/sys/sessionServer';
import { findCCAbyID } from '@helper/sys/cca/cca';
import { isLeader } from '@helper/sys/cca/ccaRecord';
import { createSession } from '@helper/sys/cca/ccaSession';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null);

  let result: Result = {
    status: false,
    error: null,
    msg: '',
  };

  const { data } = req.body;

  if (session !== null && session !== undefined) {
    if (data !== null && data !== undefined) {
      const parsedData: CCASession = data as CCASession;

      const findCCA: Result = await findCCAbyID(parsedData.ccaID);
      if (findCCA.status && findCCA.msg) {
        const ldrRes: Result = await isLeader(parsedData.ccaID, session);
        if (ldrRes.status && ldrRes.msg) {
          const expectedM: string =
            parsedData && parsedData.expectedM ? parsedData.expectedM : '';
          const sessionData: CCASession = {
            ccaID: parsedData.ccaID,
            date: parsedData.date,
            name: parsedData.name,
            time: parsedData.time,
            optional: parsedData.optional === true,
            editable: true,
            remarks: parsedData.remarks,
            ldrNotes: parsedData.ldrNotes,
            expectedM: expectedM,
          };

          const createSessionRes: Result = await createSession(sessionData);
          if (createSessionRes.status) {
            result = {
              status: true,
              error: '',
              msg: createSessionRes.msg,
            };
            res.status(200).send(result);
            res.end();
          } else {
            result = {
              status: false,
              error: createSessionRes.error,
              msg: '',
            };
            res.status(200).send(result);
            res.end();
          }
        } else {
          result = {
            status: false,
            error: 'Not a CCA leader',
            msg: '',
          };
          res.status(200).send(result);
          res.end();
        }
      } else {
        result = {
          status: false,
          error: 'Invalid CCA ID',
          msg: '',
        };
        res.status(200).send(result);
        res.end();
      }
    } else {
      result = {
        status: false,
        error: 'Incomplete information',
        msg: '',
      };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = {
      status: false,
      error: 'Unauthenticated',
      msg: '',
    };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
