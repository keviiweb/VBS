import { currentSession } from '@helper/sys/session';
import { findAllCCA } from '@helper/sys/vbs/cca';

const handler = async (req, res) => {
  const session = await currentSession(req);
  const result = [];

  if (session) {
    try {
      const ccaList = await findAllCCA();
      if (ccaList.status) {
        const { msg } = ccaList;
        msg.forEach((item) => {
          result.push(item);
        });
      }
      res.status(200).send(result);
      res.end();
    } catch (error) {
      console.log(error);
      res.status(200).send(result);
      res.end();
    }
  } else {
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
