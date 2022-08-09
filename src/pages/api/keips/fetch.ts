import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { KEIPS } from 'types/misc/keips';

import { checkerString } from '@constants/sys/helper';

import { fetchKEIPSByMatNet } from '@helper/sys/misc/keips';

/**
 * In this file, MATNET is defined as
 * <last 4 digit of Student ID><last 4 digit of NUSNET ID>
 *
 * eg. Student ID: A1234567R, NUSNET: E0011232
 * eg. 567R1232
 */

/**
 * Fetches the specific KEIPS record based on MATNET
 *
 * Used in:
 * /pages/sys/keips
 *
 * @param req NextJS API Request
 * @param res NextJS API Response
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let result: Result = {
    status: false,
    error: null,
    msg: '',
  };

  const { matnet } = req.body;

  if (matnet !== undefined && checkerString(matnet)) {
    const matnetField: string = (matnet as string).trim();

    const keipsDB: Result = await fetchKEIPSByMatNet(matnetField);
    const parsedKEIPS: KEIPS[] = [];

    if (keipsDB.status) {
      const keipsData: KEIPS = keipsDB.msg;
      if (keipsData !== null && keipsData !== undefined) {
        const contrastingStr: string = keipsData.contrasting ? 'Yes' : 'No';
        const fulfilledStr: string = keipsData.fulfilled ? 'Yes' : 'No';

        const data: KEIPS = {
          matnet: matnetField,
          topCCA: keipsData.topCCA,
          allCCA: keipsData.allCCA,
          bonusCCA: keipsData.bonusCCA,
          contrasting: keipsData.contrasting,
          OSA: keipsData.OSA,
          osaPercentile: Number(keipsData.osaPercentile.toFixed(2)),
          roomDraw: keipsData.roomDraw,
          semesterStay: keipsData.semesterStay,
          fulfilled: keipsData.fulfilled,
          contrastingStr: contrastingStr,
          fulfilledStr: fulfilledStr,
        };

        parsedKEIPS.push(data);
      }

      result = {
        status: true,
        error: null,
        msg: parsedKEIPS,
      };
      res.status(200).send(result);
      res.end();
    } else {
      result = {
        status: false,
        error: keipsDB.error,
        msg: [],
      };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = {
      status: false,
      error: 'Missing Information',
      msg: [],
    };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
