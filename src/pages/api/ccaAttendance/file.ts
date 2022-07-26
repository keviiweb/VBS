import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { CCASession } from 'types/cca/ccaSession';

import { currentSession } from '@helper/sys/sessionServer';
import { fetchAllCCASession } from '@helper/sys/cca/ccaSession';

import { levels } from '@constants/sys/admin';
import { createObjectCsvWriter } from 'csv-writer';

/**
 * Fetches the total attendance of everyone and extract into a file
 *
 * @param req NextJS API Request
 * @param res NextJS API Response
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null);

  let result: Result = {
    status: false,
    error: null,
    msg: '',
  };

  if (
    session !== null &&
    session !== undefined &&
    session.user.admin === levels.OWNER
  ) {
    const allSessionRes: Result = await fetchAllCCASession(session);
    if (allSessionRes.status) {
      const allSession: CCASession[] = allSessionRes.msg;
      if (allSession.length > 0) {
        const csvWriter = createObjectCsvWriter({
          path: 'out.csv',
          header: [
            { id: 'name', title: 'Name' },
            { id: 'surname', title: 'Surname' },
            { id: 'age', title: 'Age' },
            { id: 'gender', title: 'Gender' },
          ],
        });

        console.log(csvWriter);
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-disposition', 'attachment');
    } else {
      result = { status: false, error: allSessionRes.error, msg: [] };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = { status: false, error: 'Unauthenticated', msg: [] };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
