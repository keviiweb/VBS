import { currentSession } from '@helper/sys/session';
import { findAllCCA } from '@helper/sys/vbs/cca';

const handler = async (req, res) => {
  const session = await currentSession(req);
  let result = '';
  const cca = [];

  if (session) {
    try {
      const ccaList = await findAllCCA();
      if (ccaList.status) {
        const { msg } = ccaList;
        msg.forEach((item) => {
          cca.push(item);
        });
      }

      result = {
        status: true,
        error: null,
        msg: cca,
      };
      res.status(200).send(result);
      res.end();
    } catch (error) {
      console.error(error);
      result = {
        status: false,
        error: error.toString(),
        msg: '',
      };
      res.status(200).send(result);
      res.end();
    }
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
