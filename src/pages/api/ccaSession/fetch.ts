import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { CCASession } from 'types/cca/ccaSession';
import { CCA } from 'types/cca/cca';
import { CCAAttendance } from 'types/cca/ccaAttendance';
import { User } from 'types/misc/user';

import { currentSession } from '@helper/sys/sessionServer';
import { findCCAbyID } from '@helper/sys/cca/cca';
import {
  countAllCCASessionByCCAID,
  fetchAllCCASessionByCCAID,
} from '@helper/sys/cca/ccaSession';
import { fetchAllCCAAttendanceBySession } from '@helper/sys/cca/ccaAttendance';
import { fetchUserByEmail } from '@helper/sys/misc/user';

import {
  convertUnixToDate,
  dateISO,
  calculateDuration,
} from '@constants/sys/date';
import { splitHours } from '@constants/sys/helper';

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
      if (ccaDetailsRes.status && ccaDetailsRes.msg) {
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
          if (ccaData && ccaData.length > 0) {
            for (let ven = 0; ven < ccaData.length; ven += 1) {
              if (ccaData[ven]) {
                const record: CCASession = ccaData[ven];

                if (record.id !== undefined) {
                  const { time } = record;
                  const { start, end } = await splitHours(time);
                  if (start !== null && end !== null) {
                    const duration: number = await calculateDuration(
                      start,
                      end,
                    );

                    const dateObj: Date | null = convertUnixToDate(record.date);
                    let dateStr: string = '';

                    if (dateObj !== null) {
                      dateStr = dateISO(dateObj);
                    }

                    const editableStr: string = record.editable ? 'Yes' : 'No';
                    const optionalStr: string = record.optional ? 'Yes' : 'No';

                    const attendanceRes: Result =
                      await fetchAllCCAAttendanceBySession(record.id, session);

                    if (attendanceRes.status && attendanceRes.msg) {
                      const attendance: CCAAttendance[] = attendanceRes.msg;
                      for (let key = 0; key < attendance.length; key += 1) {
                        if (attendance[key]) {
                          const attend: CCAAttendance = attendance[key];

                          if (attend.sessionEmail !== undefined) {
                            const userEmail: string = attend.sessionEmail;
                            const userRes: Result = await fetchUserByEmail(
                              userEmail,
                              session,
                            );
                            if (userRes.status && userRes.msg) {
                              const user: User = userRes.msg;
                              attend.sessionID = user.id;
                              attend.sessionName = user.name;
                            }
                          }
                        }
                      }

                      const data: CCASession = {
                        id: record.id,
                        ccaID: ccaID,
                        ccaName: ccaDetails.name,
                        name: record.name,
                        date: record.date,
                        dateStr: dateStr,
                        time: record.time,
                        duration: duration,
                        editable: record.editable,
                        optional: record.optional,
                        editableStr: editableStr,
                        optionalStr: optionalStr,
                        remarks: record.remarks,
                        ldrNotes: record.ldrNotes,
                        expectedM: record.expectedM,
                        expectedMName: record.expectedMName,
                        realityM: JSON.stringify(attendance),
                      };

                      parsedCCASession.push(data);
                    }
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
