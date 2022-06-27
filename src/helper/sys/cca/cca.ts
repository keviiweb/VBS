import { Result } from 'types/api';
import { CCA } from 'types/cca/cca';
import { CCARecord } from 'types/cca/ccaRecord';

import { Session } from 'next-auth/core/types';
import { prisma } from '@constants/sys/db';

export const findCCAbyName = async (name: string): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const query: CCA = await prisma.cCA.findUnique({
      where: {
        name: name,
      },
    });

    result = { status: true, error: null, msg: query };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
};

export const findCCAbyID = async (id: string): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const query: CCA = await prisma.cCA.findUnique({
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

export const findAllCCA = async (): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const ccaList: CCA[] = await prisma.cCA.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    result = { status: true, error: null, msg: ccaList };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
};