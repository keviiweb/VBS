import { Result } from 'types/api';
import { CCASession } from 'types/cca/ccaSession';

import { prisma } from '@constants/sys/db';
import { calculateDuration } from '@constants/sys/date';
import { findSlots, splitHours } from '@constants/sys/helper';

/**
 * Finds all CCA Sessions filtered by CCA ID
 *
 * @param id CCA ID
 * @param limit Number of total records to fetch. Defaults to 100000
 * @param skip Number of records to skip. Defaults to 0
 * @returns A Result containing the list of CCA sessions wrapped in a Promise
 */
export const fetchAllCCASessionByCCAID = async (
  id: string,
  limit: number = 100000,
  skip: number = 0,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const query: CCASession[] = await prisma.cCASessions.findMany({
      where: {
        ccaID: id,
      },
      orderBy: [
        {
          date: 'desc',
        },
      ],
      skip: skip * limit,
      take: limit,
    });

    result = { status: true, error: null, msg: query };
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to find session', msg: [] };
  }

  return result;
};

/**
 * Counts the total of CCA sessions available filtered by CCA ID
 *
 * @param id CCA ID
 * @returns Total number of sessions wrapped in a Promise
 */
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

/**
 * Finds the specific CCA Session filtered by CCA ID
 *
 * @param id Session ID
 * @returns A Result containing the status wrapped in a Promise
 */
export const findCCASessionByID = async (id: string): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const query: CCASession = await prisma.cCASessions.findUnique({
      where: {
        id: id,
      },
    });

    if (query) {
      result = { status: true, error: null, msg: query };
    } else {
      result = { status: false, error: null, msg: null };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to find session', msg: null };
  }

  return result;
};

/**
 * Counts the total of session hours filtered by CCA ID
 *
 * @param ccaID CCA ID
 * @returns
 */
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
          if (session.optional !== undefined && !session.optional) {
            const sessionAttendanceHourStr: string = session.time;
            const { start, end } = await splitHours(sessionAttendanceHourStr);
            if (start !== null && end !== null) {
              const sessionDuration: number = await calculateDuration(
                start,
                end,
              );
              count += sessionDuration;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
  }

  return count;
};

/**
 * Edits a CCA Session
 *
 * @param data CCASession Object
 * @returns A Result containing the status wrapped in a Promise
 */
export const editSession = async (data: CCASession): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const sess: CCASession = await prisma.cCASessions.update({
      where: {
        id: data.id,
      },
      data: data,
    });

    if (sess) {
      result = {
        status: true,
        error: '',
        msg: `Successfully updated session`,
      };
    } else {
      result = { status: false, error: 'Failed to update session', msg: '' };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to update session', msg: '' };
  }

  return result;
};

/**
 * Locks a session by setting the editable flag to false
 *
 * @param data CCASession Object
 * @returns A Result containing the status wrapped in a Promise
 */
export const lockSession = async (data: CCASession): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const sess: CCASession = await prisma.cCASessions.update({
      where: {
        id: data.id,
      },
      data: {
        editable: false,
        updated_at: new Date().toISOString(),
      },
    });

    if (sess) {
      result = {
        status: true,
        error: '',
        msg: `Successfully lock session`,
      };
    } else {
      result = { status: false, error: 'Failed to lock session', msg: '' };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to lock session', msg: '' };
  }

  return result;
};

/**
 * Deletes a CCA Session filtered by its ID
 *
 * @param id CCASession ID
 * @returns A Result containing the status wrapped in a Promise
 */
export const deleteSessionByID = async (id: string): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const sess: CCASession = await prisma.cCASessions.delete({
      where: {
        id: id,
      },
    });

    if (sess) {
      result = {
        status: true,
        error: '',
        msg: `Successfully deleted session`,
      };
    } else {
      result = { status: false, error: 'Failed to delete session', msg: '' };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to delete session', msg: '' };
  }

  return result;
};

/**
 * Creates a CCA Session
 *
 * @param data CCASession Object
 * @returns A Result containing the status wrapped in a Promise
 */
export const createSession = async (data: CCASession): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const sess: CCASession = await prisma.cCASessions.create({
      data: data,
    });

    if (sess) {
      result = {
        status: true,
        error: '',
        msg: `Successfully created session`,
      };
    } else {
      result = { status: false, error: 'Failed to create session', msg: '' };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to create session', msg: '' };
  }

  return result;
};

/**
 * Checks whether there is a conflict
 *
 * A conflict is defined as clash in timing with another ongoing CCASession of the same
 * CCA
 *
 * @param data CCASession Object
 * @returns A boolean indicating if there is a conflict wrapped in a Promise
 */
export const isConflict = async (data: CCASession): Promise<boolean> => {
  try {
    const anyConflicting: CCASession[] = await prisma.cCASessions.findMany({
      where: {
        ccaID: data.ccaID,
        date: data.date,
        id: {
          not: data.id,
        },
      },
    });

    if (anyConflicting.length > 0) {
      const conflict: boolean = await checkConflict(data, anyConflicting);
      return conflict;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return true;
  }
};

/**
 * Check if there is any existing CCA Session created already
 *
 * Criterias for clash is as follows:
 * 1. Start time is within another ongoing session
 * 2. End time is within another ongoing session
 *
 * @param createRequest
 * @param existingRequest
 * @returns A boolean indicating if there is a conflict wrapped in a Promise
 */
export const checkConflict = async (
  createRequest: CCASession,
  existingRequest: CCASession[],
): Promise<boolean> => {
  let result = false;

  const { start, end } = await splitHours(createRequest.time);
  if (start !== null && end !== null) {
    const startH: string | null = await findSlots(start.toString(), true);
    const endH: string | null = await findSlots(end.toString(), false);

    if (startH !== null && endH !== null) {
      const startHNum: number = Number(startH);
      const endHNum: number = Number(endH);

      for (let key = 0; key < existingRequest.length; key += 1) {
        if (existingRequest[key]) {
          const exist: CCASession = existingRequest[key];

          const { start, end } = await splitHours(exist.time);
          if (start !== null && end !== null) {
            const eStartH: string | null = await findSlots(
              start.toString(),
              true,
            );
            const eEndH: string | null = await findSlots(end.toString(), false);

            if (startH !== null && endH !== null) {
              const eStartHNum: number = Number(eStartH);
              const eEndHNum: number = Number(eEndH);

              if (
                (eStartHNum >= startHNum && eStartHNum <= endHNum) ||
                (eEndHNum >= startHNum && eEndHNum <= endHNum)
              ) {
                return true;
              }
            }
          }
        }
      }
    }
  }

  return result;
};
