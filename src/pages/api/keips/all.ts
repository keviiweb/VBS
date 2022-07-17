import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { KEIPS } from 'types/misc/keips';

import { fetchAllKEIPS, countKEIPS } from '@helper/sys/misc/keips';
import { currentSession } from '@helper/sys/sessionServer';
import { levels } from '@constants/sys/admin';

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
    (session.user.admin === levels.ADMIN || session.user.admin === levels.OWNER)
  ) {
    const limit: number = limitQuery !== undefined ? Number(limitQuery) : 10000;
    const skip: number = skipQuery !== undefined ? Number(skipQuery) : 0;

    const keipsDB: Result = await fetchAllKEIPS(limit, skip);
    const count: number = await countKEIPS();

    const parsedKEIPS: KEIPS[] = [];

    if (keipsDB.status) {
      const keipsDataArr: KEIPS[] = keipsDB.msg;
      if (count > 0) {
        for (let ven = 0; ven < keipsDataArr.length; ven += 1) {
          const keipsData: KEIPS = keipsDataArr[ven];
          if (keipsData) {
            const contrastingStr: string = keipsData.contrasting ? 'Yes' : 'No';
            const fulfilledStr: string = keipsData.fulfilled ? 'Yes' : 'No';

            const data: KEIPS = {
              matnet: keipsData.matnet,
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
        }
      }

      result = {
        status: true,
        error: null,
        msg: { count: count, res: parsedKEIPS },
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
