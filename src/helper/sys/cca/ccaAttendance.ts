import { Result } from 'types/api';
import { CCAAttendance } from 'types/cca/ccaAttendance';

import { prisma } from '@constants/sys/db';
import { checkerString } from '@constants/sys/helper';

export const countSpecificCCAAttendanceByUserEmail = async (
  ccaID: string,
  email: string,
): Promise<number> => {
  let count = 0;

  try {
    count = await prisma.cCAAttendance.count({
      where: {
        ccaID: ccaID,
        sessionEmail: email,
      },
    });
  } catch (error) {
    console.error(error);
  }

  return count;
};

export const fetchSpecificCCAAttendanceByUserEmail = async (
  ccaID: string,
  email: string,
  limit: number = 1000,
  skip: number = 0,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const query: CCAAttendance[] = await prisma.cCAAttendance.findMany({
      where: {
        ccaID: ccaID,
        sessionEmail: email,
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

export const fetchAllCCAAttendanceByCCA = async (
  ccaID: string,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const query: CCAAttendance[] = await prisma.cCAAttendance.findMany({
      where: {
        ccaID: ccaID,
      },
    });

    result = { status: true, error: null, msg: query };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
};

export const fetchAllCCAAttendanceBySession = async (
  sessionID: string,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const query: CCAAttendance[] = await prisma.cCAAttendance.findMany({
      where: {
        sessionID: sessionID,
      },
    });

    result = { status: true, error: null, msg: query };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
};

export const countTotalAttendanceHours = async (
  attendance: CCAAttendance[],
): Promise<number> => {
  if (
    attendance !== null &&
    attendance !== undefined &&
    attendance.length > 0
  ) {
    let count = 0;

    for (let key = 0; key < attendance.length; key += 1) {
      if (attendance[key]) {
        const attend: CCAAttendance = attendance[key];
        count += attend.ccaAttendance;
      }
    }

    return count;
  }

  return 0;
};

export const editAttendance = async (attendance: CCAAttendance[]) => {
  if (attendance.length > 0) {
    for (let key = 0; key < attendance.length; key += 1) {
      if (attendance[key]) {
        const attend: CCAAttendance = attendance[key];
        const id: string =
          attend.id && checkerString(attend.id) ? attend.id : '';
        if (checkerString(id)) {
          // delete
        }

        // create
      }
    }
  }
};
