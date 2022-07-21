import { Result } from 'types/api';
import { CCA } from 'types/cca/cca';

import { prisma } from '@constants/sys/db';

/**
 * Finds the specified CCA by its ID
 *
 * @param id ID of the CCA
 * @returns Returns a Result wrapped in a Promise
 */
export const findCCAbyID = async (id: string): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const query: CCA = await prisma.cCA.findUnique({
      where: {
        id: id,
      },
    });

    if (query) {
      result = { status: true, error: null, msg: query };
    } else {
      result = { status: false, error: 'Failed to fetch CCA', msg: null };
    }
  } catch (error) {
    console.error(error);
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
export const findCCAbyName = async (name: string): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const query: CCA = await prisma.cCA.findFirst({
      where: {
        name: name,
      },
    });

    if (query) {
      result = { status: true, error: null, msg: query };
    } else {
      result = { status: false, error: 'Failed to fetch CCA', msg: null };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch CCA', msg: null };
  }

  return result;
};

/**
 * Finds all the list of CCAs
 *
 * @returns A Result containing the CCAs in ascending order of name wrapped in a Promise
 */
export const findAllCCA = async (): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const ccaList: CCA[] = await prisma.cCA.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    if (ccaList) {
      result = { status: true, error: null, msg: ccaList };
    } else {
      result = { status: false, error: 'Failed to fetch CCA', msg: [] };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch CCA', msg: [] };
  }

  return result;
};
