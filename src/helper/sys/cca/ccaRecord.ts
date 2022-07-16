import { Result } from 'types/api';
import { CCARecord } from 'types/cca/ccaRecord';
import { CCA } from 'types/cca/cca';

import { Session } from 'next-auth/core/types';
import { prisma } from '@constants/sys/db';
import { checkerString } from '@constants/sys/helper';

import { findCCAbyName } from '@helper/sys/cca/cca';
import { fetchUserByEmail } from '@helper/sys/misc/user';

export const fetchAllCCARecordByUserEmail = async (
  email: string,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const query: CCARecord[] = await prisma.cCARecord.findMany({
      where: {
        sessionEmail: email,
      },
      distinct: ['ccaID'],
    });

    if (query) {
      result = { status: true, error: null, msg: query };
    } else {
      result = { status: false, error: 'Failed to fetch CCA records', msg: [] };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch CCA records', msg: [] };
  }

  return result;
};

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

    if (query) {
      result = { status: true, error: null, msg: query };
    } else {
      result = { status: false, error: 'Failed to fetch CCA records', msg: [] };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch CCA records', msg: [] };
  }

  return result;
};

export const fetchAllCCARecordByID = async (
  id: string,
  limit: number = 100000,
  skip: number = 0,
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

    if (query) {
      result = { status: true, error: null, msg: query };
    } else {
      result = { status: false, error: 'Failed to fetch CCA records', msg: [] };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch CCA records', msg: [] };
  }

  return result;
};

export const countAllCCARecordByID = async (id: string): Promise<number> => {
  let count: number = 0;

  try {
    count = await prisma.cCARecord.count({
      where: {
        ccaID: id,
      },
    });
  } catch (error) {
    console.error(error);
  }

  return count;
};

export const isLeader = async (
  ccaID: string,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const ldr: CCARecord = await prisma.cCARecord.findFirst({
      where: {
        ccaID: ccaID,
        sessionEmail: session.user.email,
        leader: true,
      },
    });

    if (ldr) {
      result = { status: true, error: null, msg: true };
    } else {
      result = { status: true, error: null, msg: false };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch CCA record', msg: '' };
  }

  return result;
};

export const fetchSpecificCCARecord = async (
  ccaID: string,
  email: string,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const query: CCARecord = await prisma.cCARecord.findFirst({
      where: {
        ccaID: ccaID,
        sessionEmail: email,
      },
    });

    if (query) {
      result = { status: true, error: null, msg: query };
    } else {
      result = { status: false, error: 'Failed to fetch CCA records', msg: '' };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch CCA records', msg: '' };
  }

  return result;
};

export const editCCARecord = async (data: CCARecord): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const query: CCARecord = await prisma.cCARecord.update({
      where: {
        id: data.id,
      },
      data: data,
    });

    if (query) {
      result = {
        status: true,
        error: '',
        msg: `Successfully updated record`,
      };
    } else {
      result = { status: false, error: 'Failed to update record', msg: '' };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to update record', msg: '' };
  }

  return result;
};

export const createCCARecord = async (data: CCARecord): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const query: CCARecord = await prisma.cCARecord.create({
      data: data,
    });

    if (query) {
      result = {
        status: true,
        error: '',
        msg: `Successfully created record`,
      };
    } else {
      result = { status: false, error: 'Failed to create record', msg: '' };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to create record', msg: '' };
  }

  return result;
};

export const createCCARecordFile = async (
  dataField: any[],
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  let success: boolean = true;

  try {
    for (let key = 0; key < dataField.length; key += 1) {
      if (dataField[key]) {
        const data = dataField[key];

        const ccaName: string = data.ccaName !== undefined ? data.ccaName : '';
        const email: string = data.email !== undefined ? data.email : '';
        const leader: boolean =
          data.leader !== undefined && data.leader === 'yes' ? true : false;

        const userRes: Result = await fetchUserByEmail(email.trim());
        if (userRes.status) {
          if (checkerString(ccaName)) {
            const ccaRes: Result = await findCCAbyName(ccaName.trim());
            if (ccaRes.status) {
              const ccaDetails: CCA = ccaRes.msg as CCA;
              if (ccaDetails && ccaDetails.id !== undefined) {
                const existingRecordsRes: Result = await fetchSpecificCCARecord(
                  ccaDetails.id.trim(),
                  email.trim(),
                );
                if (existingRecordsRes.status && existingRecordsRes.msg) {
                  const existingRecords: CCARecord = existingRecordsRes.msg;
                  const userData: CCARecord = {
                    id: existingRecords.id,
                    sessionEmail: email.trim(),
                    ccaID: ccaDetails.id.trim(),
                    leader: leader,
                  };

                  const updateRes: Result = await editCCARecord(userData);
                  if (!updateRes.status) {
                    success = false;
                    result = {
                      status: false,
                      error: updateRes.error,
                      msg: '',
                    };
                    break;
                  }
                } else {
                  const userData: CCARecord = {
                    sessionEmail: email.trim(),
                    ccaID: ccaDetails.id.trim(),
                    leader: leader,
                  };

                  const createRes: Result = await createCCARecord(userData);
                  if (!createRes.status) {
                    success = false;
                    result = {
                      status: false,
                      error: createRes.error,
                      msg: '',
                    };
                    break;
                  }
                }
              }
            } else {
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
          success = false;
          result = {
            status: false,
            error: `Failed to find user ${email.trim()}`,
            msg: '',
          };
          break;
        }
      }
    }

    if (success) {
      result = {
        status: true,
        error: null,
        msg: 'Successfully populated CCA Records',
      };
    }
  } catch (error) {
    console.error(error);
    result = {
      status: false,
      error: 'Failed to populate CCA Records',
      msg: '',
    };
  }
  return result;
};
