import { getSession } from "next-auth/react";
import { prisma } from "@constants/db";

export const retrieveAllLocation = async (req, res) => {
    const session = await getSession({req});
    
    if (session) {
      const locations = await prisma.venue.findMany({
        where: { visible: true },
      });
  
      if (locations != null) {
        res.status(200).json({ status: true, error: null, msg: locations });
      } else {
        res.status(200).json({ status: true, error: null, msg: "" });
      }
    } else {
        res.status(200).json({ status: false, error: "User must be authenticated", msg: "" });
    }
    
    res.end()
};