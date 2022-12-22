import { Result } from 'types/api';
import { CCA } from 'types/cca/cca';
import { Session } from 'next-auth/core/types';

import { prisma } from '@constants/sys/db';
import { checkerString } from '@constants/sys/helper';

import { logger } from '@helper/sys/misc/logger';

/**
 * Finds the specified CCA by its ID
 *
 * @param id ID of the CCA
 * @returns Returns a Result wrapped in a Promise
 */
export const findCCAbyID = async (
  id: string,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const query: CCA = await prisma.cCA.findUnique({
      where: {
        id,
      },
    });

    if (query !== null && query !== undefined) {
      result = { status: true, error: null, msg: query };
    } else {
      result = { status: false, error: 'Failed to fetch CCA', msg: null };
    }
  } catch (error) {
    console.error(error);
    if (id !== undefined && checkerString(id)) {
      await logger(`FindCCAByID - ${id}`, session.user.email, error.message);
    }
    result = { status: false, error: 'Failed to fetch CCA', msg: null };
  }

  return result;
};

/**
 * Finds the specified CCA by its Name
 *
 * Refer to the CCALIST under the Constant section for the full list
 *
 * @param name Name of the CCA
 * @returns Returns a Result wrapped in a Promsie
 */
export const findCCAbyName = async (
  name: string,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const query: CCA = await prisma.cCA.findFirst({
      where: {
        name,
      },
    });

    if (query !== null && query !== undefined) {
      result = { status: true, error: null, msg: query };
    } else {
      result = { status: false, error: 'Failed to fetch CCA', msg: null };
    }
  } catch (error) {
    console.error(error);
    if (name !== undefined && checkerString(name)) {
      await logger(
        `FindCCAByName - ${name}`,
        session.user.email,
        error.message,
      );
    }
    result = { status: false, error: 'Failed to fetch CCA', msg: null };
  }

  return result;
};

/**
 * Finds all the list of CCAs
 *
 * @returns A Result containing the CCAs in ascending order of name wrapped in a Promise
 */
export const findAllCCA = async (session: Session): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const ccaList: CCA[] = await prisma.cCA.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    if (ccaList !== null && ccaList !== undefined) {
      result = { status: true, error: null, msg: ccaList };
    } else {
      result = { status: false, error: 'Failed to fetch CCA', msg: [] };
    }
  } catch (error) {
    console.error(error);
    await logger('FindAllCCA', session.user.email, error.message);
    result = { status: false, error: 'Failed to fetch CCA', msg: [] };
  }

  return result;
};
