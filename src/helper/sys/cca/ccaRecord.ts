import { Result } from 'types/api';
import { CCARecord } from 'types/cca/ccaRecord';

import { Session } from 'next-auth/core/types';
import { prisma } from '@constants/sys/db';

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

    result = { status: true, error: null, msg: query };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
};

export const fetchAllCCARecordByID = async (
  id: string,
  limit: number,
  skip: number,
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

    result = { status: true, error: null, msg: query };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
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
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
};
