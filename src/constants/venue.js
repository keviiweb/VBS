import { prisma } from "@constants/db";
import { currentSession } from "@constants/helper";
import { findSlots } from "@constants/timeslot";

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

export const fetchOpeningHours = async (id) => {
  const session = currentSession();

  if (session) {
    try {
      const locations = await prisma.venue.findFirst({
        where: { id: id },
      });

      if (locations) {
        const opening = locations.openingHours;
        const hours = opening.split("-");
        const start = await findSlots(hours[0].trim(), true);
        const end = await findSlots(hours[1].trim(), false);

        return { start: Number(start), end: Number(end) };
      } else {
        return { start: null, end: null };
      }
    } catch (error) {
      console.log(error);
      return { start: null, end: null };
    }
  } else {
    return { start: null, end: null };
  }
};
