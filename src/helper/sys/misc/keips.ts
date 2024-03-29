import { prisma } from '@constants/sys/db';

import { type KEIPS } from 'types/misc/keips';
import { type Result } from 'types/api';
import { type Session } from 'next-auth/core/types';

import { checkerString } from '@constants/sys/helper';

import { logger } from '@helper/sys/misc/logger';
/**
 * In this file, MATNET is defined as
 * <last 4 digit of Student ID><last 4 digit of NUSNET ID>
 *
 * eg. Student ID: A1234567R, NUSNET: E0011232
 * eg. 567R1232
 */

/**
 * Finds the list of KEIPS filtered by the MATNET
 *
 * @param matnet MATNET of the user
 * @returns A Result containing the KEIPS record wrapped in a Promise
 */
export const fetchKEIPSByMatNet = async (matnet: string): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const keipsFromDB: KEIPS = await prisma.kEIPS.findUnique({
      where: {
        matnet,
      },
    });

    if (keipsFromDB !== undefined && keipsFromDB !== null) {
      result = { status: true, error: null, msg: keipsFromDB };
    } else {
      result = { status: false, error: 'Failed to fetch KEIPS', msg: null };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch KEIPS', msg: null };
    await logger('fetchKEIPSByMatNet', matnet, error.message);
  }

  return result;
};

/**
 * Populates the list of KEIPS read from a CSV file
 *
 * 1. First, the MATNET is captured and validated if it is a valid string
 * 2. After which, the specific KEIPS record is fetched
 * 3. If the record is available, the record is updated
 * 4. If the record cannot be found, a new record is created.
 *
 * @param dataField File content
 * @returns A Result containing the status wrapped in a Promise
 */
export const createKEIPSFile = async (
  dataField: any[],
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  let count = 0;
  try {
    for (let key = 0; key < dataField.length; key += 1) {
      const data = dataField[key];

      const matnet: string =
        data.MATNET !== undefined
          ? data.MATNET
          : data['﻿MATNET'] !== undefined
          ? data['﻿MATNET']
          : '';
      const top: string = data.Top4cca !== undefined ? data.Top4cca : '';
      const all: string = data.Allcca !== undefined ? data.Allcca : '';
      const bonus: string = data.Bonus !== undefined ? data.Bonus : '';
      const contrasting: string =
        data.Contrasting !== undefined ? data.Contrasting : '';
      const OSA: string = data.OSA !== undefined ? data.OSA : '';
      const osaPercentile: string =
        data.OSApercentile !== undefined ? data.OSApercentile : '';
      const roomDraw: string = data.Roomdraw !== undefined ? data.Roomdraw : '';
      const sem: string =
        data.Semesterstay !== undefined ? data.Semesterstay : '';
      const fulfil: string =
        data.Fullfilled !== undefined ? data.Fullfilled : '';

      if (checkerString(matnet)) {
        const userData: KEIPS = {
          matnet: matnet.trim().toLowerCase(),
          topCCA: top.trim(),
          allCCA: all.trim(),
          bonusCCA: bonus.trim(),
          contrasting,
          OSA,
          osaPercentile,
          roomDraw,
          semesterStay: sem.trim(),
          fulfilled: fulfil,
        };

        await prisma.kEIPS.upsert({
          where: {
            matnet: userData.matnet,
          },
          update: {
            topCCA: userData.topCCA,
            allCCA: userData.allCCA,
            bonusCCA: userData.bonusCCA,
            contrasting: userData.contrasting,
            OSA: userData.OSA,
            osaPercentile: userData.osaPercentile,
            roomDraw: userData.roomDraw,
            semesterStay: userData.semesterStay,
            fulfilled: userData.fulfilled,
          },
          create: {
            matnet: userData.matnet,
            topCCA: userData.topCCA,
            allCCA: userData.allCCA,
            bonusCCA: userData.bonusCCA,
            contrasting: userData.contrasting,
            OSA: userData.OSA,
            osaPercentile: userData.osaPercentile,
            roomDraw: userData.roomDraw,
            semesterStay: userData.semesterStay,
            fulfilled: userData.fulfilled,
          },
        });

        count += 1;
      }
    }

    await logger(
      'createKEIPSFile',
      session.user.email,
      `Successfully created ${count} KEIPS records`,
    );
    result = {
      status: true,
      error: null,
      msg: `Successfully created ${count} KEIPS records`,
    };
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to create KEIPS', msg: '' };
    await logger('createKEIPSFile', session.user.email, error.message);
  }
  return result;
};

/**
 * Counts the total of KEIPS records available
 *
 * @returns Total number of KEIP record wrapped in a Promise
 */
export const countKEIPS = async (session: Session): Promise<number> => {
  let count: number = 0;
  try {
    count = await prisma.kEIPS.count();
  } catch (error) {
    console.error(error);
    await logger('countKEIPS', session.user.email, error.message);
  }

  return count;
};

/**
 * Finds all KEIPS records
 *
 * @param limit Number of total records to fetch. Defaults to 100000
 * @param skip Number of records to skip. Defaults to 0
 * @returns A Result containing the list of KEIPS records wrapped in a Promise
 */
export const fetchAllKEIPS = async (
  limit: number = 100000,
  skip: number = 0,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const query: KEIPS[] = await prisma.kEIPS.findMany({
      skip: skip * limit,
      take: limit,
    });

    if (query !== undefined && query !== null) {
      result = { status: true, error: null, msg: query };
    } else {
      result = { status: false, error: 'Failed to fetch KEIPS', msg: [] };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch KEIPS', msg: [] };
    await logger('fetchAllKEIPS', session.user.email, error.message);
  }

  return result;
};

/**
 * Delete all KEIPS records
 *
 * @returns A Result wrapped in a Promise
 */
export const deleteAllKEIPS = async (session: Session): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const query: KEIPS[] = await prisma.kEIPS.deleteMany({});

    if (query !== undefined && query !== null) {
      result = { status: true, error: null, msg: 'Successfully deleted KEIPS' };
    } else {
      result = { status: false, error: 'Failed to delete KEIPS', msg: '' };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to delete KEIPS', msg: '' };
    await logger('deleteAllKEIPS', session.user.email, error.message);
  }

  return result;
};
