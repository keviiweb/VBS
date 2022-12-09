import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { CCAAttendance } from 'types/cca/ccaAttendance';
import { CCASession } from 'types/cca/ccaSession';
import { CCA } from 'types/cca/cca';

import { currentSession } from '@helper/sys/sessionServer';
import { findCCAbyID } from '@helper/sys/cca/cca';
import { fetchSpecificCCAAttendanceByUserEmail } from '@helper/sys/cca/ccaAttendance';
import {
  countAllCCASessionByCCAID,
  fetchAllCCASessionByCCAID,
} from '@helper/sys/cca/ccaSession';
import { isLeader } from '@helper/sys/cca/ccaRecord';

import { splitHours } from '@constants/sys/helper';
import {
  convertUnixToDate,
  dateISO,
  calculateDuration,
} from '@constants/sys/date';
import hasPermission from '@constants/sys/permission';
import { actions } from '@constants/sys/admin';

/**
 * Fetches the list of CCA attendance by the specific user email and CCA ID
 *
 * Used in:
 * @components/sys/cca/LeaderStudentModal
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

    const userPermission: boolean = hasPermission(
      session.user.admin,
      actions.FETCH_ALL_CCA_ATTENDANCE,
    );

    if (ccaID !== undefined && userEmail !== undefined) {
      const checkLdr: Result = await isLeader(ccaID, session);
      if (userPermission || (checkLdr.status && (checkLdr.msg as boolean))) {
        const limitQuery = req.body.limit;
        const skipQuery = req.body.skip;
        const limit: number =
          limitQuery !== undefined ? Number(limitQuery) : 100000;
        const skip: number = skipQuery !== undefined ? Number(skipQuery) : 0;

        const ccaDetailsRes: Result = await findCCAbyID(ccaID, session);
        if (
          ccaDetailsRes.status &&
          ccaDetailsRes.msg !== undefined &&
          ccaDetailsRes !== null
        ) {
          const ccaDetails: CCA = ccaDetailsRes.msg;
          const ccaDB: Result = await fetchSpecificCCAAttendanceByUserEmail(
            ccaID,
            userEmail,
            100000,
            0,
            session,
          );
          const sessionDB: Result = await fetchAllCCASessionByCCAID(
            ccaID,
            limit,
            skip,
            session,
          );
          const totalCount: number = await countAllCCASessionByCCAID(
            ccaID,
            session,
          );

          if (ccaDB.status && sessionDB.status) {
            const totalAttendance: CCAAttendance[] = ccaDB.msg;
            const totalSessions: CCASession[] = sessionDB.msg;
            if (totalSessions !== null && totalSessions.length > 0) {
              for (let key = 0; key < totalSessions.length; key += 1) {
                const sess: CCASession = totalSessions[key];
                if (sess.id !== undefined) {
                  const sessionID: string = sess.id;

                  const { date } = sess;
                  const dateObj: Date | null = convertUnixToDate(date);
                  let dateStr: string = '';

                  if (dateObj !== null) {
                    dateStr = dateISO(dateObj);
                  }

                  const sessionAttendanceHourStr: string = sess.time;
                  const { start, end } = await splitHours(
                    sessionAttendanceHourStr,
                  );
                  if (start !== null && end !== null) {
                    const sessionDuration: number = await calculateDuration(
                      start,
                      end,
                    );

                    const optionalStr: string =
                      sess.optional !== undefined && sess.optional
                        ? 'Yes'
                        : 'No';

                    const filteredAttendance: CCAAttendance[] =
                      totalAttendance.filter(
                        (item) => item.sessionID === sessionID,
                      );
                    if (filteredAttendance.length === 1) {
                      const filteredA: CCAAttendance = filteredAttendance[0];
                      const userDuration: number = filteredA.ccaAttendance;

                      const durationStr: string = `${userDuration} out of ${sessionDuration}`;

                      const data: CCAAttendance = {
                        id: filteredA.id,
                        sessionName: sess.name,
                        sessionEmail: userEmail,
                        ccaName: ccaDetails.name,
                        time: sess.time,
                        date,
                        dateStr,
                        durationStr,
                        ccaID: filteredA.ccaID,
                        ccaAttendance: userDuration,
                        optional: optionalStr,
                      };

                      parsedCCAAttendance.push(data);
                    } else {
                      const userDuration: number = 0;
                      const durationStr: string = `${userDuration} out of ${sessionDuration}`;

                      const data: CCAAttendance = {
                        date,
                        sessionName: sess.name,
                        sessionEmail: userEmail,
                        ccaName: ccaDetails.name,
                        time: sess.time,
                        dateStr,
                        durationStr,
                        ccaID,
                        ccaAttendance: userDuration,
                        optional: optionalStr,
                      };

                      parsedCCAAttendance.push(data);
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
