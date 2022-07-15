import { Result } from 'types/api';
import { CCA } from 'types/cca/cca';

import { prisma } from '@constants/sys/db';

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
      result = { status: false, error: 'Failed to fetch CCA', msg: '' };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch CCA', msg: '' };
  }

  return result;
};

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
      result = { status: false, error: 'Failed to fetch CCA', msg: '' };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch CCA', msg: '' };
  }

  return result;
};
