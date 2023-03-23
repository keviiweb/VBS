import type { NextApiRequest, NextApiResponse } from 'next';
import { type Result } from 'types/api';
import { type KEIPS } from 'types/misc/keips';

import { fetchAllKEIPS, countKEIPS } from '@helper/sys/misc/keips';
import { currentSession } from '@helper/sys/sessionServer';

import { actions } from '@constants/sys/admin';
import hasPermission from '@constants/sys/permission';
import { checkerNumber } from '@constants/sys/helper';

/**
 * In this file, MATNET is defined as
 * <last 4 digit of Student ID><last 4 digit of NUSNET ID>
 *
 * eg. Student ID: A1234567R, NUSNET: E0011232
 * eg. 567R1232
 */

/**
 * Fetches the list of KEIPS
 *
 * This is an KEWEB level request only
 *
 * Used in:
 * /pages/sys/manage/admin/keips
 *
 * @param req NextJS API Request
 * @param res NextJS API Response
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null);

  const limitQuery = req.query.limit;
  const skipQuery = req.query.skip;

  let result: Result = {
    status: false,
    error: null,
    msg: '',
  };

  if (
    session !== null &&
    session !== undefined &&
    hasPermission(session.user.admin, actions.FETCH_ALL_KEIPS)
  ) {
    const limit: number =
      limitQuery !== undefined ? Number(limitQuery) : 100000;
    const skip: number = skipQuery !== undefined ? Number(skipQuery) : 0;

    const keipsDB: Result = await fetchAllKEIPS(limit, skip, session);
    const count: number = await countKEIPS(session);

    const parsedKEIPS: KEIPS[] = [];

    if (keipsDB.status) {
      const keipsDataArr: KEIPS[] = keipsDB.msg;
      if (count > 0) {
        for (let ven = 0; ven < keipsDataArr.length; ven += 1) {
          const keipsData: KEIPS = keipsDataArr[ven];

          let osaPercentile: string = '';
          if (checkerNumber(Number(keipsData.osaPercentile))) {
            const numosaPercentile: number = Number(keipsData.osaPercentile);
            osaPercentile = numosaPercentile.toFixed(2);
          } else {
            osaPercentile = keipsData.osaPercentile;
          }

          const data: KEIPS = {
            matnet: keipsData.matnet.toLowerCase(),
            topCCA: keipsData.topCCA,
            allCCA: keipsData.allCCA,
            bonusCCA: keipsData.bonusCCA,
            contrasting: keipsData.contrasting,
            OSA: keipsData.OSA,
            osaPercentile,
            roomDraw: keipsData.roomDraw,
            semesterStay: keipsData.semesterStay,
            fulfilled: keipsData.fulfilled,
            contrastingStr: keipsData.contrasting,
            fulfilledStr: keipsData.fulfilled,
          };

          parsedKEIPS.push(data);
        }
      }

      result = {
        status: true,
        error: null,
        msg: { count, res: parsedKEIPS },
      };
      res.status(200).send(result);
      res.end();
    } else {
      result = {
        status: false,
        error: keipsDB.error,
        msg: { count: 0, res: [] },
      };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = {
      status: false,
      error: 'Unauthenticated',
      msg: { count: 0, res: [] },
    };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
