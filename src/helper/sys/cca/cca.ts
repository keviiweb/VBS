import { Result } from 'types/api';
import { CCA } from 'types/cca/cca';

import { prisma } from '@constants/sys/db';
import moment from 'moment';

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

export const calculateDuration = async (
  start: number,
  end: number,
): Promise<number> => {
  let duration: number = 0;

  const s: string = start.toString().padStart(4, '0');
  const e: string = end.toString().padStart(4, '0');

  const startH = `${s.toString().slice(0, 2)}:${s.toString().slice(2)}:00`;
  const endH = `${e.toString().slice(0, 2)}:${e.toString().slice(2)}:00`;

  const startTimeM = moment(startH, 'HH:mm:ss');
  const endTimeM = moment(endH, 'HH:mm:ss');
  const durationH = moment.duration(endTimeM.diff(startTimeM));
  duration = durationH.asHours();

  return duration;
};
