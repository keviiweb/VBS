import { prisma } from "@constants/db";
import { currentSession } from "@constants/helper";

const handler = async (req, res) => {
  const session = currentSession();
  let result = [];

  if (session) {
    try {
      const ccaList = await prisma.CCA.findMany();
      if (ccaList != null) {
        ccaList.forEach((item) => {
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
