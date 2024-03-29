import type { NextApiRequest, NextApiResponse } from 'next';
import { type Result } from 'types/api';
import { type CCAAttendance } from 'types/cca/ccaAttendance';
import { type CCASession } from 'types/cca/ccaSession';
import { type CCA } from 'types/cca/cca';

import { currentSession } from '@helper/sys/sessionServer';
import { actions } from '@constants/sys/admin';
import hasPermission from '@constants/sys/permission';
import { convertUnixToDate, dateISO } from '@constants/sys/date';

import {
  fetchAllCCAAttendance,
  fetchAllCCAAttendanceByCCA,
} from '@helper/sys/cca/ccaAttendance';
import { findCCASessionByID } from '@helper/sys/cca/ccaSession';
import { findCCAbyID } from '@helper/sys/cca/cca';

/**
 * Fetches the total attendance of everyone and extract into a file
 *
 * Used in:
 * /pages/sys/manage/admin/users
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

  const { ccaID } = req.body;

  if (session !== null && session !== undefined) {
    const parsedData: CCAAttendance[] = [];
    let allAttendanceRes: Result = { status: false, error: '', msg: '' };

    if (ccaID !== undefined) {
      const ccaIDField: string = (ccaID as string).trim();
      allAttendanceRes = await fetchAllCCAAttendanceByCCA(ccaIDField, session);
    } else if (
      hasPermission(session.user.admin, actions.FETCH_ALL_CCA_ATTENDANCE)
    ) {
      allAttendanceRes = await fetchAllCCAAttendance(session);
    }

    if (allAttendanceRes.status) {
      const allAttendance: CCAAttendance[] = allAttendanceRes.msg;
      if (allAttendance.length > 0) {
        for (let key = 0; key < allAttendance.length; key += 1) {
          const attendance: CCAAttendance = allAttendance[key];

          if (attendance.sessionID !== undefined) {
            const sessionDetailsRes: Result = await findCCASessionByID(
              attendance.sessionID,
              session,
            );
            if (sessionDetailsRes.status) {
              const sessionDetails: CCASession = sessionDetailsRes.msg;
              const { date } = sessionDetails;
              const dateObj: Date | null = convertUnixToDate(date);
              let dateStr: string = '';

              if (dateObj !== null) {
                dateStr = dateISO(dateObj);
              }

              const { time } = sessionDetails;
              const sessionName: string = sessionDetails.name;
              const ccaDetailsRes: Result = await findCCAbyID(
                sessionDetails.ccaID,
                session,
              );
              if (ccaDetailsRes.status) {
                const ccaDetails: CCA = ccaDetailsRes.msg;
                const ccaName: string = ccaDetails.name;

                const data: CCAAttendance = {
                  sessionName,
                  ccaName,
                  dateStr,
                  time,
                  sessionEmail: attendance.sessionEmail,
                  ccaAttendance: attendance.ccaAttendance,
                  ccaID: attendance.ccaID,
                };

                parsedData.push(data);
              }
            }
          }
        }
      }

      result = { status: true, error: null, msg: parsedData };
      res.status(200).send(result);
      res.end();
    } else {
      result = { status: false, error: allAttendanceRes.error, msg: [] };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = { status: false, error: 'Unauthenticated', msg: [] };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
