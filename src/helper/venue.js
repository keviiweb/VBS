import { prisma } from "@constants/db";
import { findSlots } from "@constants/helper";

export const fetchChildVenue = async (venue) => {
  try {
    const childVenues = await prisma.venue.findMany({
      where: { parentVenue: venue, isChildVenue: true },
    });

    return { status: true, error: null, msg: childVenues };
  } catch (error) {
    console.log(error);
    return { status: false, error: error, msg: "" };
  }
};

export const fetchAllVenue = async () => {
  try {
    const locations = await prisma.venue.findMany();
    return { status: true, error: null, msg: locations };
  } catch (error) {
    console.log(error);
    return { status: false, error: error, msg: "" };
  }
};

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

      if (start && end) {
        return { start: Number(start), end: Number(end) };
      } else {
        return { start: null, end: null };
      }
    } else {
      return { start: null, end: null };
    }
  } catch (error) {
    console.log(error);
    return { start: null, end: null };
  }
};

export const splitHours = async (opening) => {
  try {
    if (opening) {
      const hours = opening.split("-");

      if (hours) {
        return { start: Number(hours[0].trim()), end: Number(hours[1].trim()) };
      } else {
        return { start: null, end: null };
      }
    } else {
      return { start: null, end: null };
    }
  } catch (error) {
    console.log(error);
    return { start: null, end: null };
  }
};

export const splitOpeningHours = async (opening) => {
  try {
    if (opening) {
      const hours = opening.split("-");
      const start = await findSlots(hours[0].trim(), true);
      const end = await findSlots(hours[1].trim(), false);

      if (start && end) {
        return { start: Number(start), end: Number(end) };
      } else {
        return { start: null, end: null };
      }
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

export const createVenue = async (data) => {
  try {
    const venue = await prisma.venue.create({
      data: data,
    });

    if (venue) {
      return { status: true, error: "", msg: "Successfully created venue" };
    } else {
      return { status: false, error: "Failed to create venue", msg: "" };
    }
  } catch (error) {
    console.log(error);
    return { status: false, error: error, msg: "" };
  }
};

export const editVenue = async (data) => {
  try {
    const venue = await prisma.venue.update({
      where: {
        id: data.id,
      },
      data: data,
    });

    if (venue) {
      return { status: true, error: "", msg: "Successfully updated venue" };
    } else {
      return { status: false, error: "Failed to update venue", msg: "" };
    }
  } catch (error) {
    console.log(error);
    return { status: false, error: error, msg: "" };
  }
};
