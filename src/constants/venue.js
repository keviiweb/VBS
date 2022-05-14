import { prisma } from "./db";
import { currentSession } from "./helper";

export const fetchVenue = async () => {
  const session = currentSession();

  if (session) {
    try {
      const locations = await prisma.venue.findMany({
        where: { visible: true, isChildVenue: false },
      });

      if (locations) {
        return { status: true, error: null, msg: locations };
      } else {
        return { status: true, error: null, msg: "" };
      }
    } catch (error) {
      console.log(error);
      return { status: false, error: "Connection timeout", msg: "" };
    }
  } else {
    return { status: false, error: "User must be authenticated", msg: "" };
  }
};

export const findVenueByID = async (id) => {
  const session = currentSession();

  if (session) {
    try {
      const locations = await prisma.venue.findFirst({
        where: { id: id },
      });

      if (locations) {
        return { status: true, error: null, msg: locations };
      } else {
        return { status: true, error: null, msg: "" };
      }
    } catch (error) {
      console.log(error);
      return { status: false, error: "Connection timeout", msg: "" };
    }
  } else {
    return { status: false, error: "User must be authenticated", msg: "" };
  }
};
