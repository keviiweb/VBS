import { prisma } from "@constants/db";
import { currentSession } from "@constants/helper";

const handler = async (req, res) => {
  const session = currentSession();

  let result = [];
  const { venue } = req.body;

  if (session) {
    if (venue) {
      try {
        const childVenues = await prisma.venue.findMany({
          where: { parentVenue: venue, isChildVenue: true },
        });

        if (childVenues != null) {
          childVenues.forEach((item) => {
            result.push(item);
          });
        }
        res.status(200).send(result);
      } catch (error) {
        console.log(error);
        res.status(200).send(result);
      }
    } else {
      res.status(200).send(result);
    }
  } else {
    res.status(200).send(result);
  }

  res.end();
};

export default handler;
