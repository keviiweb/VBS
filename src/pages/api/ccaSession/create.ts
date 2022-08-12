import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { CCASession } from 'types/cca/ccaSession';

import { currentSession } from '@helper/sys/sessionServer';
import { findCCAbyID } from '@helper/sys/cca/cca';
import { isLeader } from '@helper/sys/cca/ccaRecord';
import { createSession, isConflict } from '@helper/sys/cca/ccaSession';

import hasPermission from '@constants/sys/permission';
import { actions } from '@constants/sys/admin';

/**
 * Create a new CCA session
 *
 * Used in:
 * @components/sys/cca/SessionCreateConfirmationModal
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

  const { data } = req.body;

  if (session !== null && session !== undefined) {
    if (data !== null && data !== undefined) {
      const parsedData: CCASession = data as CCASession;

      const userPermission: boolean = hasPermission(
        session.user.admin,
        actions.OVERRIDE_CREATE_SESSION,
      );

      const findCCA: Result = await findCCAbyID(parsedData.ccaID, session);
      if (findCCA.status && findCCA.msg) {
        const ldrRes: Result = await isLeader(parsedData.ccaID, session);
        if (userPermission || (ldrRes.status && ldrRes.msg)) {
          const expectedM: string =
            parsedData && parsedData.expectedM
              ? parsedData.expectedM.trim()
              : '';

          const expectedMName: string =
            parsedData && parsedData.expectedMName
              ? parsedData.expectedMName.trim()
              : '';

          const sessionData: CCASession = {
            ccaID: parsedData.ccaID.trim(),
            date: parsedData.date,
            name: parsedData.name.trim(),
            time: parsedData.time.trim(),
            optional: parsedData.optional === true,
            editable: true,
            remarks: parsedData.remarks?.trim(),
            ldrNotes: parsedData.ldrNotes?.trim(),
            expectedM: expectedM,
            expectedMName: expectedMName,
          };

          const findSessRes: boolean = await isConflict(sessionData, session);
          if (findSessRes) {
            result = {
              status: false,
              error: 'A session already exist within the timing',
              msg: '',
            };
            res.status(200).send(result);
            res.end();
          } else {
            const createSessionRes: Result = await createSession(
              sessionData,
              session,
            );
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
