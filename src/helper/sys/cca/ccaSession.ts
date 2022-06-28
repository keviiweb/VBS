import { Result } from 'types/api';
import { CCASession } from 'types/cca/ccaSession';

import { prisma } from '@constants/sys/db';

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
