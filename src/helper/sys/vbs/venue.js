import { prisma } from '@constants/sys/db';
import { findSlots, dateISO } from '@constants/sys/helper';

export const fetchChildVenue = async (venue) => {
  try {
    const childVenues = await prisma.venue.findMany({
      where: { parentVenue: venue, isChildVenue: true },
    });

    return { status: true, error: null, msg: childVenues };
  } catch (error) {
    return { status: false, error: error.toString(), msg: '' };
  }
};

export const fetchAllVenue = async () => {
  try {
    const locations = await prisma.venue.findMany();
    return { status: true, error: null, msg: locations };
  } catch (error) {
    return { status: false, error: error.toString(), msg: '' };
  }
};

export const fetchVenue = async () => {
  try {
    const locations = await prisma.venue.findMany({
      where: { visible: true, isChildVenue: false },
    });

    if (locations) {
      return { status: true, error: null, msg: locations };
    }
    return { status: true, error: null, msg: '' };
  } catch (error) {
    return { status: false, error: 'Connection timeout', msg: '' };
  }
};

export const findVenueByID = async (id) => {
  try {
    const locations = await prisma.venue.findFirst({
      where: { id },
    });

    if (locations) {
      return { status: true, error: null, msg: locations };
    }
    return { status: true, error: null, msg: '' };
  } catch (error) {
    return { status: false, error: 'Connection timeout', msg: '' };
  }
};

export const fetchOpeningHours = async (id) => {
  try {
    const locations = await prisma.venue.findFirst({
      where: { id },
    });

    if (locations) {
      const opening = locations.openingHours;
      const hours = opening.split('-');
      const start = await findSlots(hours[0].trim(), true);
      const end = await findSlots(hours[1].trim(), false);

      if (start && end) {
        return { start: Number(start), end: Number(end) };
      }
      return { start: null, end: null };
    }
    return { start: null, end: null };
  } catch (error) {
    return { start: null, end: null };
  }
};

export const splitHours = async (opening) => {
  try {
    if (opening) {
      const hours = opening.split('-');

      if (hours) {
        return {
          start: Number(hours[0].trim()),
          end: Number(hours[1].trim()),
        };
      }
      return { start: null, end: null };
    }
    return { start: null, end: null };
  } catch (error) {
    return { start: null, end: null };
  }
};

export const splitHoursISO = async (date, timeSlot) => {
  try {
    if (timeSlot) {
      const hours = timeSlot.split('-');

      if (hours) {
        const startHour = hours[0].trim();
        const endHour = hours[1].trim();

        const start = `${dateISO(date)}T${startHour
          .toString()
          .slice(0, 2)}:${startHour.slice(2)}:00`;
        const end = `${dateISO(date)}T${endHour
          .toString()
          .slice(0, 2)}:${endHour.slice(2)}:00`;

        return { start, end };
      }
      return { start: null, end: null };
    }
    return { start: null, end: null };
  } catch (error) {
    return { start: null, end: null };
  }
};
export const splitOpeningHours = async (opening) => {
  try {
    if (opening) {
      const hours = opening.split('-');
      const start = await findSlots(hours[0].trim(), true);
      const end = await findSlots(hours[1].trim(), false);

      if (start && end) {
        return { start: Number(start), end: Number(end) };
      }
      return { start: null, end: null };
    }
    return { start: null, end: null };
  } catch (error) {
    return { start: null, end: null };
  }
};

export const isInstantBook = async (id) => {
  try {
    const locations = await prisma.venue.findFirst({
      where: { id },
    });

    if (locations) {
      return locations.isInstantBook;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export const isVisible = async (id) => {
  try {
    const locations = await prisma.venue.findFirst({
      where: { id },
    });

    if (locations) {
      return locations.visible;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export const createVenue = async (data) => {
  try {
    const venue = await prisma.venue.create({
      data,
    });

    if (venue) {
      return {
        status: true,
        error: '',
        msg: 'Successfully created venue',
      };
    }
    return { status: false, error: 'Failed to create venue', msg: '' };
  } catch (error) {
    return { status: false, error: error.toString(), msg: '' };
  }
};

export const editVenue = async (data) => {
  try {
    const venue = await prisma.venue.update({
      where: {
        id: data.id,
      },
      data,
    });

    if (venue) {
      return {
        status: true,
        error: '',
        msg: 'Successfully updated venue',
      };
    }
    return { status: false, error: 'Failed to update venue', msg: '' };
  } catch (error) {
    return { status: false, error: error.toString(), msg: '' };
  }
};
