import { Result } from 'types/api';
import { CCAAttendance } from 'types/cca/ccaAttendance';

import { prisma } from '@constants/sys/db';

export const fetchAllCCAAttendanceByUserEmail = async (
  email: string,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const query: CCAAttendance[] = await prisma.cCAAttendance.findMany({
      where: {
        sessionEmail: email,
      },
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
