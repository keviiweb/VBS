import { currentSession } from '@helper/sys/session';
import { findAllCCA } from '@helper/sys/vbs/cca';

const handler = async (req, res) => {
  const session = await currentSession(req);
  let result = [];

  if (session) {
    try {
      const ccaList = await findAllCCA();
      if (ccaList.status) {
        const msg = ccaList.msg;
        msg.forEach((item) => {
          result.push(item);
        });
      }
      res.status(200).send(result);
      res.end();
      return;
    } catch (error) {
      console.log(error);
      res.status(200).send(result);
      res.end();
      return;
    }
  } else {
    res.status(200).send(result);
    res.end();
    return;
  }
};

export default handler;
