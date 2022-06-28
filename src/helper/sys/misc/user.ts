import { prisma } from '@constants/sys/db';

import { User } from '@root/src/types/misc/user';
import { Result } from 'types/api';

export const fetchUserByEmail = async (email: string): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const userFromDB: User = await prisma.users.findUnique({
      where: {
        email: email,
      },
    });
    result = { status: true, error: null, msg: userFromDB };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
};
