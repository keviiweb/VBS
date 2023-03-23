import type { NextApiRequest, NextApiResponse } from 'next';
import { type Result } from 'types/api';
import { type CCARecord } from 'types/cca/ccaRecord';
import { type CCA } from 'types/cca/cca';
import { type User } from 'types/misc/user';
import { type CCAAttendance } from 'types/cca/ccaAttendance';

import { currentSession } from '@helper/sys/sessionServer';
import {
  fetchAllCCARecordByUser,
  fetchAllCCARecordByID,
  countAllCCARecordByID,
  isLeader,
} from '@helper/sys/cca/ccaRecord';

import { findCCAbyID } from '@helper/sys/cca/cca';
import { fetchUserByEmail } from '@helper/sys/misc/user';
import {
  fetchSpecificCCAAttendanceByUserEmail,
  countTotalAttendanceHours,
} from '@helper/sys/cca/ccaAttendance';
import { countTotalSessionHoursByCCAID } from '@helper/sys/cca/ccaSession';

import hasPermission from '@constants/sys/permission';
import { actions } from '@constants/sys/admin';

/**
 * Fetches the list of CCA records filtered by CCA ID
 *
 * Used in:
 * @components/sys/cca/SessionEditModal
 * @components/sys/cca/SessionCreateModal
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
    const parsedCCARecord: CCARecord[] = [];

    let ccaIDRes: string | undefined;
    if (id !== undefined) {
      ccaIDRes = (id as string).trim();
    }

    const userPermission: boolean = hasPermission(
      session.user.admin,
      actions.FETCH_USER_CCA_RECORD,
    );

    if (ccaIDRes !== undefined) {
      const checkLdr: Result = await isLeader(ccaIDRes, session);
      if (userPermission || (checkLdr.status && (checkLdr.msg as boolean))) {
        const limitQuery = req.body.limit;
        const skipQuery = req.body.skip;
        const limit: number =
          limitQuery !== undefined ? Number(limitQuery) : 100000;
        const skip: number = skipQuery !== undefined ? Number(skipQuery) : 0;

        const ccaDetailsRes: Result = await findCCAbyID(ccaIDRes, session);
        if (
          ccaDetailsRes.status &&
          ccaDetailsRes.msg !== null &&
          ccaDetailsRes.msg !== undefined
        ) {
          const ccaDetails: CCA = ccaDetailsRes.msg;
          const ccaDB: Result = await fetchAllCCARecordByID(
            ccaIDRes,
            limit,
            skip,
            session,
          );

          const totalCount: number = await countAllCCARecordByID(
            ccaIDRes,
            session,
          );
          if (ccaDB.status) {
            const ccaData: CCARecord[] = ccaDB.msg;
            const ccaAttendanceHours: number =
              await countTotalSessionHoursByCCAID(ccaIDRes, session);

            if (
              ccaData !== null &&
              ccaData !== undefined &&
              ccaData.length > 0
            ) {
              for (let ven = 0; ven < ccaData.length; ven += 1) {
                const record: CCARecord = ccaData[ven];
                if (record.sessionEmail !== undefined) {
                  const userResult: Result = await fetchUserByEmail(
                    record.sessionEmail,
                    session,
                  );
                  if (
                    userResult.status &&
                    userResult.msg !== null &&
                    userResult.msg !== undefined
                  ) {
                    const user: User = userResult.msg;
                    const userAttendance: Result =
                      await fetchSpecificCCAAttendanceByUserEmail(
                        ccaIDRes,
                        user.email,
                        100000,
                        0,
                        session,
                      );
                    if (userAttendance.status) {
                      const userAttendanceHours =
                        await countTotalAttendanceHours(
                          userAttendance.msg as CCAAttendance[],
                        );
                      let rate: string = '100%';
                      if (ccaAttendanceHours !== 0) {
                        if (userAttendanceHours > ccaAttendanceHours) {
                          rate = '100%';
                        } else {
                          rate = `${(
                            (userAttendanceHours / ccaAttendanceHours) *
                            100
                          ).toFixed(1)}%`;
                        }
                      } else {
                        rate = 'No sessions found';
                      }

                      const data: CCARecord = {
                        id: record.id,
                        ccaID: record.ccaID,
                        leader: record.leader,
                        sessionEmail: record.sessionEmail,
                        sessionName: user.name,
                        sessionID: user.id,
                        ccaName: ccaDetails.name,
                        image: ccaDetails.image,
                        rate,
                      };

                      parsedCCARecord.push(data);
                    }
                  }
                }
              }
            }

            result = {
              status: true,
              error: null,
              msg: { count: totalCount, res: parsedCCARecord },
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
          error: 'Not a CCA leader',
          msg: { count: 0, res: [] },
        };
        res.status(200).send(result);
        res.end();
      }
    } else {
      const ccaDB: Result = await fetchAllCCARecordByUser(session);
      if (ccaDB.status) {
        const ccaData: CCARecord[] = ccaDB.msg;
        if (ccaData.length > 0) {
          for (let ven = 0; ven < ccaData.length; ven += 1) {
            const record: CCARecord = ccaData[ven];
            const ccaAttendanceHours: number =
              await countTotalSessionHoursByCCAID(record.ccaID, session);
            const userAttendance: Result =
              await fetchSpecificCCAAttendanceByUserEmail(
                record.ccaID,
                session.user.email,
                100000,
                0,
                session,
              );
            if (userAttendance.status) {
              const userAttendanceHours = await countTotalAttendanceHours(
                userAttendance.msg as CCAAttendance[],
              );
              let rate: string = '100%';
              if (ccaAttendanceHours !== 0) {
                if (userAttendanceHours > ccaAttendanceHours) {
                  rate = '100%';
                } else {
                  rate = `${(
                    (userAttendanceHours / ccaAttendanceHours) *
                    100
                  ).toFixed(1)}%`;
                }
              } else {
                rate = 'No sessions found';
              }

              const data: CCARecord = {
                id: record.id,
                ccaID: record.ccaID,
                leader: record.leader,
                ccaName: record.ccaName,
                rate,
                image: record.image,
              };

              parsedCCARecord.push(data);
            }
          }
        }

        result = {
          status: true,
          error: null,
          msg: { count: parsedCCARecord.length, res: parsedCCARecord },
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
