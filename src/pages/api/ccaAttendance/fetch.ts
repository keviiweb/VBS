import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { CCAAttendance } from 'types/cca/ccaAttendance';
import { CCASession } from 'types/cca/ccaSession';

import { currentSession } from '@helper/sys/sessionServer';
import { calculateDuration, findCCAbyID } from '@helper/sys/cca/cca';
import {
  countSpecificCCAAttendanceByUserEmail,
  fetchSpecificCCAAttendanceByUserEmail,
} from '@helper/sys/cca/ccaAttendance';
import { findCCASessionByID } from '@helper/sys/cca/ccaSession';
import { splitHours } from '@helper/sys/vbs/venue';

import { convertUnixToDate, dateISO } from '@constants/sys/date';
import { isLeader } from '@helper/sys/cca/ccaRecord';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null);

  let result: Result = {
    status: false,
    error: null,
    msg: '',
  };

  const { id, email } = req.body;

  if (session !== null && session !== undefined) {
    const parsedCCAAttendance: CCAAttendance[] = [];

    let ccaID: string | undefined;
    if (id !== undefined) {
      ccaID = (id as string).trim();
    }

    let userEmail: string | undefined;
    if (email !== undefined) {
      userEmail = (email as string).trim();
    }

    if (ccaID !== undefined && userEmail !== undefined) {
      const checkLdr: Result = await isLeader(ccaID, session);
      if (checkLdr.status && checkLdr.msg) {
        const limitQuery = req.body.limit;
        const skipQuery = req.body.skip;
        const limit: number =
          limitQuery !== undefined ? Number(limitQuery) : 100;
        const skip: number = skipQuery !== undefined ? Number(skipQuery) : 0;

        const ccaDetailsRes: Result = await findCCAbyID(ccaID);
        if (ccaDetailsRes.status && ccaDetailsRes.msg) {
          const ccaDB: Result = await fetchSpecificCCAAttendanceByUserEmail(
            ccaID,
            userEmail,
            limit,
            skip,
          );
          const totalCount: number =
            await countSpecificCCAAttendanceByUserEmail(ccaID, userEmail);

          if (ccaDB.status) {
            const ccaAttendanceMsg: CCAAttendance[] = ccaDB.msg;
            if (ccaAttendanceMsg && ccaAttendanceMsg.length > 0) {
              for (let key = 0; key < ccaAttendanceMsg.length; key += 1) {
                if (ccaAttendanceMsg[key]) {
                  const attendance: CCAAttendance = ccaAttendanceMsg[key];
                  const { sessionID } = attendance;

                  if (sessionID !== undefined) {
                    const sessionRes: Result = await findCCASessionByID(
                      sessionID,
                    );
                    if (sessionRes.status && sessionRes.msg) {
                      const ccaSession: CCASession = sessionRes.msg;

                      const { date } = ccaSession;
                      const dateObj: Date | null = convertUnixToDate(date);
                      let dateStr: string = '';

                      if (dateObj !== null) {
                        dateStr = dateISO(dateObj);
                      }

                      const sessionAttendanceHourStr: string = ccaSession.time;
                      const { start, end } = await splitHours(
                        sessionAttendanceHourStr,
                      );
                      if (start !== null && end !== null) {
                        const sessionDuration: number = await calculateDuration(
                          start,
                          end,
                        );

                        const userDuration: number = attendance.ccaAttendance;

                        const durationStr: string = `${userDuration} out of ${sessionDuration}`;

                        const data: CCAAttendance = {
                          id: attendance.id,
                          date: date,
                          dateStr: dateStr,
                          durationStr: durationStr,
                          ccaID: attendance.ccaID,
                          ccaAttendance: userDuration,
                        };

                        parsedCCAAttendance.push(data);
                      }
                    }
                  }
                }
              }
            }

            result = {
              status: true,
              error: null,
              msg: { count: totalCount, res: parsedCCAAttendance },
            };

            res.status(200).send(result);
            res.end();
          } else {
            result = {
              status: false,
              error: ccaDB.error,
              msg: { count: 0, res: [] },
            };
            res.status(200).send(result);
            res.end();
          }
        } else {
          result = {
            status: false,
            error: ccaDetailsRes.error,
            msg: { count: 0, res: [] },
          };
          res.status(200).send(result);
          res.end();
        }
      } else {
        result = {
          status: false,
          error: 'Not CCA Leader',
          msg: { count: 0, res: [] },
        };
        res.status(200).send(result);
        res.end();
      }
    } else {
      result = {
        status: false,
        error: 'Incomplete information',
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
