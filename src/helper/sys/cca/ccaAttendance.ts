import { Result } from 'types/api';
import { CCAAttendance } from 'types/cca/ccaAttendance';

import { prisma } from '@constants/sys/db';
import { checkerString } from '@constants/sys/helper';

export const fetchSpecificCCAAttendanceByUserEmail = async (
  ccaID: string,
  email: string,
  limit: number = 100000,
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

    if (query) {
      result = { status: true, error: null, msg: query };
    } else {
      result = { status: false, error: 'Failed to fetch attendance', msg: [] };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch attendance', msg: [] };
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

    if (query) {
      result = { status: true, error: null, msg: query };
    } else {
      result = { status: false, error: 'Failed to fetch attendance', msg: [] };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch attendance', msg: [] };
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

export const deleteAttendance = async (
  sessionID: string,
  attend: CCAAttendance,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const query: CCAAttendance = await prisma.cCAAttendance.deleteMany({
      where: {
        sessionID: sessionID,
        ccaID: attend.ccaID,
        sessionEmail: attend.sessionEmail,
        id: attend.id,
      },
    });

    if (query) {
      result = { status: true, error: null, msg: query };
    } else {
      result = { status: false, error: 'Failed to delete attendance', msg: '' };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to delete attendance', msg: '' };
  }

  return result;
};

export const deleteAttendanceBySessionID = async (
  sessionID: string,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const query: CCAAttendance = await prisma.cCAAttendance.deleteMany({
      where: {
        sessionID: sessionID,
      },
    });

    if (query) {
      result = { status: true, error: null, msg: query };
    } else {
      result = { status: false, error: 'Failed to delete attendance', msg: '' };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
};

export const createAttendance = async (
  attend: CCAAttendance,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const query: CCAAttendance = await prisma.cCAAttendance.create({
      data: attend,
    });

    if (query) {
      result = { status: true, error: null, msg: query };
    } else {
      result = { status: false, error: 'Failed to create attendance', msg: '' };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to create attendance', msg: '' };
  }

  return result;
};

export const editAttendance = async (
  ccaSessionID: string,
  attendance: CCAAttendance[],
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  if (attendance.length > 0) {
    for (let key = 0; key < attendance.length; key += 1) {
      if (attendance[key]) {
        const attend: CCAAttendance = attendance[key];
        const id: string = attend.id !== undefined ? attend.id : '';
        if (checkerString(id)) {
          const deleteRes: Result = await deleteAttendance(
            ccaSessionID,
            attend,
          );
          if (!deleteRes.status) {
            result = { status: false, error: deleteRes.error, msg: '' };
            break;
          }
        }

        if (attend.ccaAttendance > 0) {
          const data: CCAAttendance = {
            ccaID: attend.ccaID,
            ccaAttendance: attend.ccaAttendance,
            sessionID: ccaSessionID,
            sessionEmail: attend.sessionEmail,
          };

          const createRes: Result = await createAttendance(data);
          if (createRes.status) {
            result = {
              status: true,
              error: null,
              msg: 'Successfully edited attendance',
            };
          } else {
            result = { status: false, error: createRes.error, msg: '' };
            break;
          }
        } else {
          result = {
            status: true,
            error: null,
            msg: 'Successfully edited attendance',
          };
        }
      }
    }
  }

  return result;
};
