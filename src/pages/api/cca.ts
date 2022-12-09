import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { CCA } from 'types/cca/cca';

import { currentSession } from '@helper/sys/sessionServer';
import { findAllCCA } from '@helper/sys/cca/cca';

/**
 * Fetches all CCAs in the database
 *
 * Used in:
 * @components/sys/vbs/VenueBookingModal
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

  const cca: CCA[] = [];

  if (session !== undefined && session !== null) {
    const ccaList: Result = await findAllCCA(session);
    if (ccaList.status) {
      const { msg } = ccaList;
      msg.forEach((item: CCA) => {
        cca.push(item);
      });

      result = {
        status: true,
        error: null,
        msg: cca,
      };
    } else {
      result = {
        status: false,
        error: ccaList.error,
        msg: [],
      };
    }

    res.status(200).send(result);
    res.end();
  } else {
    result = {
      status: false,
      error: 'Unauthenticated',
      msg: [],
    };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
