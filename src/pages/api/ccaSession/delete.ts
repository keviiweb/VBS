import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { CCASession } from 'types/cca/ccaSession';

import { currentSession } from '@helper/sys/sessionServer';
import {
  deleteSessionByID,
  findCCASessionByID,
} from '@helper/sys/cca/ccaSession';
import { isLeader } from '@helper/sys/cca/ccaRecord';
import { deleteAttendanceBySessionID } from '@helper/sys/cca/ccaAttendance';

import hasPermission from '@constants/sys/permission';
import { actions } from '@constants/sys/admin';

/**
 * Delete the CCA session
 *
 * Used in:
 * @components/sys/cca/SessionModal
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
    const sessionID: string = (id as string).trim();
    if (sessionID !== undefined) {
      const userPermission: boolean = hasPermission(
        session.user.admin,
        actions.OVERRIDE_DELETE_SESSION,
      );

      const sessionRes: Result = await findCCASessionByID(sessionID, session);
      if (sessionRes.status && sessionRes.msg) {
        const ccaSession: CCASession = sessionRes.msg;
        const editable: boolean = ccaSession.editable
          ? ccaSession.editable
          : false;

        if (userPermission || editable) {
          const ldrRes: Result = await isLeader(ccaSession.ccaID, session);
          if (userPermission || (ldrRes.status && ldrRes.msg)) {
            const deleteAttendanceRes: Result =
              await deleteAttendanceBySessionID(id, session);
            if (deleteAttendanceRes.status) {
              const deleteSessionRes: Result = await deleteSessionByID(
                id,
                session,
              );
              if (deleteSessionRes.status) {
                result = {
                  status: true,
                  error: null,
                  msg: deleteSessionRes.msg,
                };
                res.status(200).send(result);
                res.end();
              } else {
                result = {
                  status: false,
                  error: deleteSessionRes.error,
                  msg: '',
                };
                res.status(200).send(result);
                res.end();
              }
            } else {
              result = {
                status: false,
                error: deleteAttendanceRes.error,
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
          error: sessionRes.error,
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
