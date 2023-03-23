import type { NextApiRequest, NextApiResponse } from 'next';
import { type Result } from 'types/api';
import { type CCASession } from 'types/cca/ccaSession';
import { type CCA } from 'types/cca/cca';
import { type CCAAttendance } from 'types/cca/ccaAttendance';
import { type User } from 'types/misc/user';

import { currentSession } from '@helper/sys/sessionServer';
import { findCCAbyID } from '@helper/sys/cca/cca';
import {
  countAllCCASessionByCCAID,
  fetchAllCCASessionByCCAID,
  lockSession,
} from '@helper/sys/cca/ccaSession';
import { fetchAllCCAAttendanceBySession } from '@helper/sys/cca/ccaAttendance';
import { fetchUserByEmail } from '@helper/sys/misc/user';

import {
  convertUnixToDate,
  dateISO,
  calculateDuration,
  convertDateToUnix,
  fetchCurrentDate,
  compareDate,
} from '@constants/sys/date';
import { splitHours } from '@constants/sys/helper';
import hasPermission from '@constants/sys/permission';
import { actions } from '@constants/sys/admin';

/**
 * Fetches the list of CCA sessions filtered by CCA ID
 *
 * Used in:
 * @components/sys/cca/MemberModal
 * @components/sys/cca/LeaderModal
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

  const { id } = req.body;

  if (session !== null && session !== undefined) {
    const parsedCCASession: CCASession[] = [];

    let ccaID: string | undefined;
    if (id !== undefined) {
      ccaID = (id as string).trim();
    }

    if (ccaID !== undefined) {
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
        const ccaDB: Result = await fetchAllCCASessionByCCAID(
          ccaID,
          limit,
          skip,
          session,
        );
        const totalCount: number = await countAllCCASessionByCCAID(
          ccaID,
          session,
        );
        if (ccaDB.status) {
          const ccaData: CCASession[] = ccaDB.msg;
          if (ccaData !== null && ccaData !== undefined && ccaData.length > 0) {
            for (let ven = 0; ven < ccaData.length; ven += 1) {
              const record: CCASession = ccaData[ven];

              if (record.id !== undefined) {
                const { time } = record;
                const { start, end } = await splitHours(time);
                if (start !== null && end !== null) {
                  let editableStr: string =
                    record.editable !== undefined && record.editable
                      ? 'Yes'
                      : 'No';

                  if (record.editable !== undefined && record.editable) {
                    const currentDate: number = convertDateToUnix(
                      dateISO(fetchCurrentDate()),
                    );
                    const sessionDate: number = record.date;
                    const threshold: number =
                      process.env.SESSION_EDITABLE_DAY !== undefined
                        ? Number(process.env.SESSION_EDITABLE_DAY)
                        : 14;

                    const userPermission: boolean = hasPermission(
                      session.user.admin,
                      actions.OVERRIDE_EDIT_SESSION,
                    );

                    if (
                      sessionDate <= currentDate &&
                      !compareDate(sessionDate, threshold)
                    ) {
                      let lockSessionSuccess = true;
                      if (record.editable !== undefined && record.editable) {
                        const lockRes: Result = await lockSession(
                          record,
                          session,
                        );
                        if (!lockRes.status) {
                          lockSessionSuccess = false;
                          result = {
                            status: false,
                            error: lockRes.error,
                            msg: '',
                          };
                          res.status(200).send(result);
                          res.end();
                        }
                      }

                      editableStr = 'No';
                      record.editable = false;
                    }
                  }

                  const duration: number = await calculateDuration(start, end);

                  const dateObj: Date | null = convertUnixToDate(record.date);
                  let dateStr: string = '';

                  if (dateObj !== null) {
                    dateStr = dateISO(dateObj);
                  }

                  const optionalStr: string =
                    record.optional !== undefined && record.optional
                      ? 'Yes'
                      : 'No';

                  const attendanceRes: Result =
                    await fetchAllCCAAttendanceBySession(record.id, session);

                  if (
                    attendanceRes.status &&
                    attendanceRes.msg !== undefined &&
                    attendanceRes.msg !== null
                  ) {
                    const attendance: CCAAttendance[] = attendanceRes.msg;
                    for (let key = 0; key < attendance.length; key += 1) {
                      const attend: CCAAttendance = attendance[key];

                      if (attend.sessionEmail !== undefined) {
                        const userEmail: string = attend.sessionEmail;
                        const userRes: Result = await fetchUserByEmail(
                          userEmail,
                          session,
                        );
                        if (
                          userRes.status &&
                          userRes.msg !== undefined &&
                          userRes.msg !== null
                        ) {
                          const user: User = userRes.msg;
                          attend.sessionID = user.id;
                          attend.sessionName = user.name;
                        }
                      }
                    }

                    const data: CCASession = {
                      id: record.id,
                      ccaID,
                      ccaName: ccaDetails.name,
                      name: record.name,
                      date: record.date,
                      dateStr,
                      time: record.time,
                      duration,
                      editable: record.editable,
                      optional: record.optional,
                      editableStr,
                      optionalStr,
                      remarks: record.remarks,
                      ldrNotes: record.ldrNotes,
                      realityM: JSON.stringify(attendance),
                    };

                    parsedCCASession.push(data);
                  }
                }
              }
            }
          }

          result = {
            status: true,
            error: null,
            msg: { count: totalCount, res: parsedCCASession },
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
