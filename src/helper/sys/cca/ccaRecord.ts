import { Result } from 'types/api';
import { CCARecord } from 'types/cca/ccaRecord';
import { CCA } from 'types/cca/cca';

import { Session } from 'next-auth/core/types';
import { prisma } from '@constants/sys/db';
import { checkerString } from '@constants/sys/helper';

import { findCCAbyName } from '@helper/sys/cca/cca';

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

export const createCCARecordFile = async (
  dataField: any[],
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    for (let key = 0; key < dataField.length; key += 1) {
      if (dataField[key]) {
        const data = dataField[key];

        const ccaName: string = data.ccaName !== undefined ? data.ccaName : '';
        const email: string = data.email !== undefined ? data.email : '';
        const leader: boolean =
          data.leader !== undefined && data.leader === 'yes' ? true : false;

        if (checkerString(ccaName)) {
          const ccaRes: Result = await findCCAbyName(ccaName);
          if (ccaRes.status) {
            const ccaDetails: CCA = ccaRes.msg as CCA;

            if (ccaDetails && ccaDetails.id !== undefined) {
              const userData: CCARecord = {
                sessionEmail: email,
                ccaID: ccaDetails.id,
                leader: leader,
              };

              await prisma.cCARecord.upsert({
                where: {
                  sessionEmail: userData.sessionEmail,
                  ccaID: ccaDetails.id,
                },
                update: {
                  leader: userData.leader,
                },
                create: {
                  sessionEmail: userData.sessionEmail,
                  ccaID: ccaDetails.id,
                  leader: userData.leader,
                },
              });
            }
          }
        }
      }
    }

    result = {
      status: true,
      error: null,
      msg: 'Successfully populated CCA Records',
    };
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
