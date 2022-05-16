import { prisma } from "@constants/db";
import { findSlots } from "@constants/timeslot";

export const fetchVenue = async () => {
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
};

export const findVenueByID = async (id) => {
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
};

export const fetchOpeningHours = async (id) => {
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
};

export const isInstantBook = async (id) => {
  try {
    const locations = await prisma.venue.findFirst({
      where: { id: id },
    });

    if (locations) {
      return locations.isInstantBook;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const isVisible = async (id) => {
  try {
    const locations = await prisma.venue.findFirst({
      where: { id: id },
    });

    if (locations) {
      return locations.visible;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};
