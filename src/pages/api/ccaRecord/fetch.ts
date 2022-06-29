import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { CCARecord } from 'types/cca/ccaRecord';
import { CCA } from 'types/cca/cca';
import { User } from 'types/misc/user';
import { CCAAttendance } from 'types/cca/ccaAttendance';

import { currentSession } from '@helper/sys/sessionServer';
import {
  fetchAllCCARecordByUser,
  fetchAllCCARecordByID,
  countAllCCARecordByID,
} from '@helper/sys/cca/ccaRecord';

import { findCCAbyID } from '@helper/sys/cca/cca';
import { fetchUserByEmail } from '@helper/sys/misc/user';
import {
  fetchSpecificCCAAttendanceByUserEmail,
  countTotalAttendanceHours,
} from '@helper/sys/cca/ccaAttendance';
import { countTotalSessionHoursByCCAID } from '@helper/sys/cca/ccaSession';

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

    if (ccaIDRes !== undefined) {
      const limitQuery = req.body.limit;
      const skipQuery = req.body.skip;
      const limit: number = limitQuery !== undefined ? Number(limitQuery) : 100;
      const skip: number = skipQuery !== undefined ? Number(skipQuery) : 0;

      const ccaDetailsRes: Result = await findCCAbyID(ccaIDRes);
      if (ccaDetailsRes.status && ccaDetailsRes.msg) {
        const ccaDetails: CCA = ccaDetailsRes.msg;
        const ccaDB: Result = await fetchAllCCARecordByID(
          ccaIDRes,
          limit,
          skip,
        );

        const totalCount: number = await countAllCCARecordByID(ccaIDRes);
        if (ccaDB.status) {
          const ccaData: CCARecord[] = ccaDB.msg;
          const ccaAttendanceHours: number =
            await countTotalSessionHoursByCCAID(ccaIDRes);

          if (ccaData && ccaData.length > 0) {
            for (let ven = 0; ven < ccaData.length; ven += 1) {
              if (ccaData[ven]) {
                const record: CCARecord = ccaData[ven];
                if (record.sessionEmail !== undefined) {
                  const userResult: Result = await fetchUserByEmail(
                    record.sessionEmail,
                  );
                  if (userResult.status && userResult.msg) {
                    const user: User = userResult.msg;
                    const userAttendance: Result =
                      await fetchSpecificCCAAttendanceByUserEmail(
                        ccaIDRes,
                        user.email,
                      );
                    if (userAttendance.status) {
                      const userAttendanceHours =
                        await countTotalAttendanceHours(
                          userAttendance.msg as CCAAttendance[],
                        );
                      let rate: string = '100%';
                      if (ccaAttendanceHours !== 0) {
                        rate = `${(
                          (userAttendanceHours / ccaAttendanceHours) *
                          100
                        ).toFixed(1)}%`;
                      } else {
                        rate = 'No sessions found';
                      }

                      const data: CCARecord = {
                        id: record.id,
                        ccaID: record.ccaID,
                        leader: record.leader,
                        sessionEmail: record.sessionEmail,
                        sessionName: user.name,
                        sessionStudentID: user.studentID,
                        ccaName: ccaDetails.name,
                        image: ccaDetails.image,
                        rate: rate,
                      };

                      parsedCCARecord.push(data);
                    }
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
      const ccaDB: Result = await fetchAllCCARecordByUser(session);
      if (ccaDB.status) {
        const ccaData: CCARecord[] = ccaDB.msg;
        if (ccaData.length > 0) {
          for (let ven = 0; ven < ccaData.length; ven += 1) {
            if (ccaData[ven]) {
              const record: CCARecord = ccaData[ven];
              const { ccaID } = record;
              const ccaDetailsRes: Result = await findCCAbyID(ccaID);
              if (ccaDetailsRes.status && ccaDetailsRes.msg) {
                const ccaDetails: CCA = ccaDetailsRes.msg;

                const ccaAttendanceHours: number =
                  await countTotalSessionHoursByCCAID(record.ccaID);
                const userAttendance: Result =
                  await fetchSpecificCCAAttendanceByUserEmail(
                    record.ccaID,
                    session.user.email,
                  );
                if (userAttendance.status) {
                  const userAttendanceHours = await countTotalAttendanceHours(
                    userAttendance.msg as CCAAttendance[],
                  );
                  let rate: string = '100%';
                  if (ccaAttendanceHours !== 0) {
                    rate = `${(
                      (userAttendanceHours / ccaAttendanceHours) *
                      100
                    ).toFixed(1)}%`;
                  } else {
                    rate = 'No sessions found';
                  }

                  const data: CCARecord = {
                    id: record.id,
                    ccaID: record.ccaID,
                    leader: record.leader,
                    ccaName: ccaDetails.name,
                    rate: rate,
                    image: ccaDetails.image,
                  };

                  parsedCCARecord.push(data);
                }
              } else {
                console.error(ccaDetailsRes.error);
              }
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
