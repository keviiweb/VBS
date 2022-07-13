import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { CCASession } from 'types/cca/ccaSession';
import { CCAAttendance } from 'types/cca/ccaAttendance';

import { currentSession } from '@helper/sys/sessionServer';
import { findCCAbyID } from '@helper/sys/cca/cca';
import { isLeader } from '@helper/sys/cca/ccaRecord';
import { editSession } from '@helper/sys/cca/ccaSession';
import { editAttendance } from '@helper/sys/cca/ccaAttendance';

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
        const editable: boolean = parsedData.editable
          ? parsedData.editable === true
          : false;
        if (editable) {
          const ldrRes: Result = await isLeader(parsedData.ccaID, session);
          if (ldrRes.status && ldrRes.msg) {
            const expectedM: string =
              parsedData && parsedData.expectedM ? parsedData.expectedM : '';
            const sessionData: CCASession = {
              id: parsedData.id,
              ccaID: parsedData.ccaID,
              date: parsedData.date,
              name: parsedData.name,
              time: parsedData.time,
              optional: parsedData.optional === true,
              remarks: parsedData.remarks,
              ldrNotes: parsedData.ldrNotes,
              expectedM: expectedM,
              updated_at: new Date().toISOString(),
            };

            let success: boolean = true;
            const editSessionRes: Result = await editSession(sessionData);
            if (editSessionRes.status) {
              if (parsedData && parsedData.realityM !== undefined) {
                const parsedRealityData: CCAAttendance[] = JSON.parse(
                  parsedData.realityM,
                );

                if (
                  parsedRealityData.length > 0 &&
                  parsedData.id !== undefined
                ) {
                  const editRes: Result = await editAttendance(
                    parsedData.id,
                    parsedRealityData,
                  );
                  if (!editRes.status) {
                    success = false;

                    result = {
                      status: false,
                      error: editRes.error,
                      msg: '',
                    };
                    res.status(200).send(result);
                    res.end();
                  }
                }
              }

              if (success) {
                result = {
                  status: true,
                  error: null,
                  msg: editSessionRes.msg,
                };
                res.status(200).send(result);
                res.end();
              }
            } else {
              result = {
                status: false,
                error: editSessionRes.error,
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
            error: 'Session not editable',
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
