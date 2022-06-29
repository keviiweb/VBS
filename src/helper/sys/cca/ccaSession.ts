import { Result } from 'types/api';
import { CCASession } from 'types/cca/ccaSession';

import { prisma } from '@constants/sys/db';
import { splitHours } from '@helper/sys/vbs/venue';

export const fetchAllCCASessionByCCAID = async (
  id: string,
  limit: number,
  skip: number,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const query: CCASession[] = await prisma.cCASessions.findMany({
      where: {
        ccaID: id,
      },
      skip: skip * limit,
      take: limit,
    });

    result = { status: true, error: null, msg: query };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
};

export const countAllCCASessionByCCAID = async (
  id: string,
): Promise<number> => {
  let count = 0;

  try {
    count = await prisma.cCASessions.count({
      where: {
        ccaID: id,
      },
    });
  } catch (error) {
    console.error(error);
  }

  return count;
};

export const findCCASessionByID = async (id: string): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const query: CCASession = await prisma.cCASessions.findUnique({
      where: {
        id: id,
      },
    });

    result = { status: true, error: null, msg: query };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
};

export const countTotalSessionHoursByCCAID = async (
  ccaID: string,
): Promise<number> => {
  let count = 0;
  try {
    const query: CCASession[] = await prisma.cCASessions.findMany({
      where: {
        ccaID: ccaID,
      },
    });

    if (query !== undefined && query !== null && query.length > 0) {
      for (let key = 0; key < query.length; key += 1) {
        if (query[key]) {
          const session: CCASession = query[key];
          const sessionAttendanceHourStr: string = session.time;
          const { start, end } = await splitHours(sessionAttendanceHourStr);
          if (start !== null && end !== null) {
            const sessionDuration: number =
              Math.round(((end - start) / 60) * 10) / 10;
            count += sessionDuration;
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
  }

  return count;
};
