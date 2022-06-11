import { Result } from 'types/api';
import { prisma } from '@constants/sys/db';

export const findCCAbyName = async (name: string) => {
  let result: Result = null;

  try {
    const query = await prisma.cCA.findUnique({
      where: {
        name: name,
      },
    });

    result = { status: true, error: null, msg: query };
  } catch (error) {
    console.log(error);
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
};

export const findCCAbyID = async (id: string) => {
  let result: Result = null;

  try {
    const query = await prisma.cCA.findUnique({
      where: {
        id: id,
      },
    });

    result = { status: true, error: null, msg: query };
  } catch (error) {
    console.log(error);
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
};

export const findAllCCA = async () => {
  let result: Result = null;

  try {
    const ccaList = await prisma.cCA.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    result = { status: true, error: null, msg: ccaList };
  } catch (error) {
    console.log(error);
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
};

export const isLeader = async (ccaID: string, session: any) => {
  let result: Result = null;

  try {
    const ldr = await prisma.cCALeader.findFirst({
      where: {
        ccaID: ccaID,
        sessionEmail: session.user.email,
      },
    });

    if (ldr) {
      result = { status: true, error: null, msg: true };
    } else {
      result = { status: true, error: null, msg: false };
    }
  } catch (error) {
    console.log(error);
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
};
