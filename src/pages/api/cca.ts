import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { CCA } from 'types/cca';

import { currentSession } from '@helper/sys/session';
import { findAllCCA } from '@helper/sys/vbs/cca';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req);
  let result: Result = null;
  const cca: CCA[] = [];

  if (session !== undefined && session !== null) {
    const ccaList: Result = await findAllCCA();
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
        msg: '',
      };
    }

    res.status(200).send(result);
    res.end();
  } else {
    result = {
      status: false,
      error: 'Unauthenticated',
      msg: '',
    };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
