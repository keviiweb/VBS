import { getSession } from "next-auth/react";
import { prisma } from "@constants/db";

const venue = async (req, res) => {
  const session = await getSession({ req });

  if (session) {
    console.log("Session", JSON.stringify(session, null, 2))
    const locations = await prisma.venue.findMany({
      where: { visible: true },
    });

    if (locations != null) {
      res.status(200).json({ status: true, error: null, msg: locations });
    } else {
      res.status(200).json({ status: true, error: null, msg: "" });
    }
  } else {
    res.status(401);
  }

  res.end();
};

export default venue;