import { Result } from 'types/api';
import { CCARecord } from 'types/cca/ccaRecord';
import { CCA } from 'types/cca/cca';
import { Session } from 'next-auth/core/types';

import { prisma } from '@constants/sys/db';
import { checkerString } from '@constants/sys/helper';
import hasPermission from '@constants/sys/permission';
import { actions } from '@constants/sys/admin';

import { findAllCCA, findCCAbyID, findCCAbyName } from '@helper/sys/cca/cca';
import { fetchUserByEmail } from '@helper/sys/misc/user';
import { logger } from '@helper/sys/misc/logger';
import { deleteAttendanceByUser } from '@helper/sys/cca/ccaAttendance';

/**
 * Finds all CCA Records filtered by the user email
 *
 * @param email Email address of the user
 * @returns A Result containing the status wrapped in a Promise
 */
export const fetchAllCCARecordByUserEmail = async (
  email: string,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const query: CCARecord[] = await prisma.cCARecord.findMany({
      where: {
        sessionEmail: email,
      },
      distinct: ['ccaID'],
    });

    if (query !== undefined && query !== null) {
      result = { status: true, error: null, msg: query };
    } else {
      result = { status: false, error: 'Failed to fetch CCA records', msg: [] };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch CCA records', msg: [] };
    await logger(
      'fetchAllCCARecordByUserEmail',
      session.user.email,
      error.message,
    );
  }

  return result;
};

/**
 * Finds all CCA Records filtered by the user email
 *
 * @param session Next-Auth Session object
 * @returns A Result containing the status wrapped in a Promise
 */
export const fetchAllCCARecordByUser = async (
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const query: CCARecord[] = await prisma.cCARecord.findMany({
      where: {
        sessionEmail: session.user.email,
      },
      distinct: ['ccaID'],
    });

    if (query !== undefined && query !== null) {
      result = { status: true, error: null, msg: query };
    } else {
      result = { status: false, error: 'Failed to fetch CCA records', msg: [] };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch CCA records', msg: [] };
    await logger('fetchAllCCARecordByUser', session.user.email, error.message);
  }

  return result;
};

/**
 * Finds all CCA Records filtered by the user email
 *
 * @param session Next-Auth Session object
 * @returns A Result containing the status wrapped in a Promise
 */
export const fetchAllCCARecordByUserWDetails = async (
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    let query: Result;
    const permission: boolean = hasPermission(
      session.user.admin,
      actions.FETCH_ALL_CCA,
    );

    if (permission) {
      query = await findAllCCA(session);
    } else {
      query = await fetchAllCCARecordByUser(session);
    }

    const parsedCCARecord: CCARecord[] = [];
    if (query.status) {
      if (permission) {
        const ccaData: CCA[] = query.msg;
        for (let ven = 0; ven < ccaData.length; ven += 1) {
          const ccaDetails: CCA = ccaData[ven];
          if (ccaDetails.id !== undefined) {
            const data: CCARecord = {
              id: ccaDetails.id,
              ccaID: ccaDetails.id,
              leader: true,
              ccaName: ccaDetails.name,
              image: ccaDetails.image,
            };

            parsedCCARecord.push(data);
          }
        }
      } else {
        const ccaData: CCARecord[] = query.msg;

        if (ccaData.length > 0) {
          for (let ven = 0; ven < ccaData.length; ven += 1) {
            const record: CCARecord = ccaData[ven];
            const { ccaID } = record;
            const ccaDetailsRes: Result = await findCCAbyID(ccaID, session);
            if (
              ccaDetailsRes.status &&
              ccaDetailsRes.msg !== null &&
              ccaDetailsRes.msg !== undefined
            ) {
              const ccaDetails: CCA = ccaDetailsRes.msg;
              const data: CCARecord = {
                id: record.id,
                ccaID: record.ccaID,
                leader: record.leader,
                ccaName: ccaDetails.name,
                image: ccaDetails.image,
              };

              parsedCCARecord.push(data);
            }
          }
        }
      }

      result = { status: true, error: null, msg: parsedCCARecord };
    } else {
      result = { status: false, error: query.error, msg: [] };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch CCA records', msg: [] };
    await logger(
      'fetchAllCCARecordByUserWDetails',
      session.user.email,
      error.message,
    );
  }

  return result;
};

/**
 * Finds all CCA records filtered by the CCA ID
 *
 * @param id CCA ID
 * @param limit Number of total records to fetch. Defaults to 100000
 * @param skip Number of records to skip. Defaults to 0
 * @returns A Result containing the list of CCA records wrapped in a Promise
 */
export const fetchAllCCARecordByID = async (
  id: string,
  limit: number = 100000,
  skip: number = 0,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const query: CCARecord[] = await prisma.cCARecord.findMany({
      where: {
        ccaID: id,
      },
      skip: skip * limit,
      take: limit,
      distinct: ['sessionEmail'],
    });

    if (query !== undefined && query !== null) {
      result = { status: true, error: null, msg: query };
    } else {
      result = { status: false, error: 'Failed to fetch CCA records', msg: [] };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch CCA records', msg: [] };
    await logger('fetchAllCCARecordByID', session.user.email, error.message);
  }

  return result;
};

/**
 * Counts the total of CCA records available filtered by CCA ID
 *
 * @param id CCA ID
 * @returns Total number of records wrapped in a Promise
 */
export const countAllCCARecordByID = async (
  id: string,
  session: Session,
): Promise<number> => {
  let count: number = 0;

  try {
    count = await prisma.cCARecord.count({
      where: {
        ccaID: id,
      },
    });
  } catch (error) {
    console.error(error);
    await logger('countAllCCARecordByID', session.user.email, error.message);
  }

  return count;
};

/**
 * Check whether the user is a CCA Leader of the particular CCA
 *
 * @param ccaID CCA ID
 * @param session Next-Auth Session object
 * @returns A Result containing the status wrapped in a Promise
 */
export const isLeader = async (
  ccaID: string,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const ldr: CCARecord = await prisma.cCARecord.findFirst({
      where: {
        ccaID,
        sessionEmail: session.user.email,
        leader: true,
      },
    });

    if (ldr !== undefined && ldr !== null) {
      result = { status: true, error: null, msg: true };
    } else {
      result = { status: true, error: null, msg: false };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch CCA record', msg: '' };
    await logger('isLeader', session.user.email, error.message);
  }

  return result;
};

/**
 * Finds the specific CCA records filtered by CCA ID and user Email
 *
 * @param ccaID CCA ID
 * @param email Email address of the user
 * @returns A Result containing the list of records wrapped in a Promise
 */
export const fetchSpecificCCARecord = async (
  ccaID: string,
  email: string,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const query: CCARecord = await prisma.cCARecord.findFirst({
      where: {
        ccaID,
        sessionEmail: email,
      },
    });

    if (query !== undefined && query !== null) {
      result = { status: true, error: null, msg: query };
    } else {
      result = {
        status: false,
        error: 'Failed to fetch CCA records',
        msg: null,
      };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch CCA records', msg: null };
    await logger('fetchSpecificCCARecord', session.user.email, error.message);
  }

  return result;
};

/**
 * Edits a CCA Record
 *
 * @param data CCARecord Object
 * @returns A Result containing the status wrapped in a Promise
 */
export const editCCARecord = async (
  data: CCARecord,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const query: CCARecord = await prisma.cCARecord.update({
      where: {
        id: data.id,
      },
      data,
    });

    if (query !== undefined && query !== null) {
      if (data.id !== undefined && checkerString(data.id)) {
        await logger(
          `editCCARecord - ${data.id}`,
          session.user.email,
          'Successfully updated record',
        );
      }
      result = {
        status: true,
        error: '',
        msg: 'Successfully updated record',
      };
    } else {
      if (data.id !== undefined && checkerString(data.id)) {
        await logger(
          `editCCARecord - ${data.id}`,
          session.user.email,
          'Failed to update record',
        );
      }
      result = { status: false, error: 'Failed to update record', msg: '' };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to update record', msg: '' };
    if (data.id !== undefined && checkerString(data.id)) {
      await logger(
        `editCCARecord - ${data.id}`,
        session.user.email,
        error.message,
      );
    }
  }

  return result;
};

/**
 * Creates a CCA Record entry in the database
 *
 * @param data CCARecord Object
 * @returns A Result containing the status wrapped in a Promise
 */
export const createCCARecord = async (
  data: CCARecord,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const query: CCARecord = await prisma.cCARecord.create({
      data,
    });

    if (query !== undefined && query !== null) {
      if (query.id !== undefined && checkerString(query.id)) {
        await logger(
          `createCCARecord - ${query.id}`,
          session.user.email,
          'Successfully created record',
        );
      }

      result = {
        status: true,
        error: '',
        msg: 'Successfully created record',
      };
    } else {
      await logger(
        'createCCARecord',
        session.user.email,
        'Failed to create record',
      );
      result = { status: false, error: 'Failed to create record', msg: '' };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to create record', msg: '' };
    await logger('createCCARecord', session.user.email, error.message);
  }

  return result;
};

/**
 * Deletes a CCA Record entry in the database
 *
 * @param data CCARecord Object
 * @returns A Result containing the status wrapped in a Promise
 */
export const deleteCCARecord = async (
  data: CCARecord,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const query: CCARecord = await prisma.cCARecord.delete({
      where: {
        id: (data.id as string).trim(),
      },
    });

    if (query !== undefined && query !== null) {
      if (data.sessionEmail !== undefined) {
        const deleteAttendanceRes: Result = await deleteAttendanceByUser(data.ccaID, data.sessionEmail, session);
        if (deleteAttendanceRes.status) {
          result = {
            status: true,
            error: '',
            msg: 'Successfully deleted record',
          };
        } else {
          result = {
            status: false,
            error: deleteAttendanceRes.error,
            msg: '',
          };
        }
      } else {
        result = {
          status: false,
          error: `Failed to delete attendance for user`,
          msg: '',
        };
      }
 
    } else {
      await logger(
        'deleteCCARecord',
        session.user.email,
        'Failed to delete record',
      );
      result = { status: false, error: 'Failed to delete record', msg: '' };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to delete record', msg: '' };
    await logger('deleteCCARecord', session.user.email, error.message);
  }

  return result;
};

/**
 * Populates the list of CCA Records read from a CSV file
 *
 * 1. First, the email of the user is validated against
 * 2. Next, the CCA name is validated against
 * 3. After which, the specific CCA record of the user and the CCA is fetched
 * 4. If the record is available, the record is updated
 * 5. If the record cannot be found, a new record is created.
 *
 * @param dataField File content
 * @returns A Result containing the status wrapped in a Promise
 */
export const createCCARecordFile = async (
  dataField: any[],
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  let success: boolean = true;
  let totalCount: number = 0;
  let count: number = 0;

  try {
    for (let key = 0; key < dataField.length; key += 1) {
      const data = dataField[key];
      totalCount += 1;

      const ccaName: string = data.ccaName !== undefined ? data.ccaName : '';
      const email: string = data.email !== undefined ? data.email : '';
      const leader: boolean = !!(
        data.leader !== undefined && data.leader === 'yes'
      );

      const userRes: Result = await fetchUserByEmail(email.trim(), session);
      if (userRes.status) {
        if (checkerString(ccaName)) {
          const ccaRes: Result = await findCCAbyName(ccaName.trim(), session);
          if (ccaRes.status) {
            const ccaDetails: CCA = ccaRes.msg as CCA;
            if (
              ccaDetails !== null &&
              ccaDetails !== undefined &&
              ccaDetails.id !== undefined
            ) {
              const existingRecordsRes: Result = await fetchSpecificCCARecord(
                ccaDetails.id.trim(),
                email.trim(),
                session,
              );
              if (
                existingRecordsRes.status &&
                existingRecordsRes.msg !== undefined &&
                existingRecordsRes !== null
              ) {
                const existingRecords: CCARecord = existingRecordsRes.msg;
                const userData: CCARecord = {
                  id: existingRecords.id,
                  sessionEmail: email.trim(),
                  ccaID: ccaDetails.id.trim(),
                  leader,
                  updated_at: new Date().toISOString(),
                };

                const updateRes: Result = await editCCARecord(
                  userData,
                  session,
                );
                if (!updateRes.status) {
                  success = false;
                  result = {
                    status: false,
                    error: updateRes.error,
                    msg: '',
                  };
                  break;
                } else {
                  count += 1;
                }
              } else {
                const userData: CCARecord = {
                  sessionEmail: email.trim(),
                  ccaID: ccaDetails.id.trim(),
                  leader,
                };

                const createRes: Result = await createCCARecord(
                  userData,
                  session,
                );
                if (!createRes.status) {
                  success = false;
                  result = {
                    status: false,
                    error: createRes.error,
                    msg: '',
                  };
                  break;
                } else {
                  count += 1;
                }
              }
            }
          } else {
            await logger(
              'createCCARecordFile',
              session.user.email,
              `Failed to find CCA ${ccaName.trim()}`,
            );
            success = false;
            result = {
              status: false,
              error: `Failed to find CCA ${ccaName.trim()}`,
              msg: '',
            };
            break;
          }
        }
      } else {
        await logger(
          'createCCARecordFile',
          session.user.email,
          `Failed to find user ${email.trim()}`,
        );
        success = false;
        result = {
          status: false,
          error: `Failed to find user ${email.trim()}`,
          msg: '',
        };
        break;
      }
    }

    if (success) {
      await logger(
        'createCCARecordFile',
        session.user.email,
        `Successfully populated ${count} CCA Records out of total ${totalCount}`,
      );
      result = {
        status: true,
        error: null,
        msg: `Successfully populated ${count} CCA Records out of total ${totalCount}`,
      };
    }
  } catch (error) {
    console.error(error);
    result = {
      status: false,
      error: 'Failed to populate CCA Records',
      msg: '',
    };
    await logger('createCCARecordFile', session.user.email, error.message);
  }
  return result;
};
