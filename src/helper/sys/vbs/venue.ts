import { prisma } from '@constants/sys/db';
import { findSlots } from '@constants/sys/helper';
import { dateISO, isValidDate } from '@constants/sys/date';

import { Venue } from 'types/vbs/venue';
import { Result } from 'types/api';

export const countVenue = async (): Promise<number> => {
  let count: number = 0;
  try {
    count = await prisma.venue.count();
  } catch (error) {
    console.error(error);
  }

  return count;
};

export const fetchChildVenue = async (venue: string): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const childVenues: Venue[] = await prisma.venue.findMany({
      where: { parentVenue: venue, isChildVenue: true },
    });
    result = { status: true, error: null, msg: childVenues };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
};

export const fetchAllVenue = async (
  limit: number,
  skip: number,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const locations: Venue[] = await prisma.venue.findMany({
      skip: skip * limit,
      take: limit,
    });
    result = { status: true, error: null, msg: locations };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
};

export const fetchVenue = async (): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const locations: Venue[] = await prisma.venue.findMany({
      where: { visible: true, isChildVenue: false },
    });

    result = { status: true, error: null, msg: locations };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
};

export const findVenueByID = async (id: string): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const locations: Venue = await prisma.venue.findFirst({
      where: { id: id },
    });

    result = { status: true, error: null, msg: locations };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
};

export const fetchOpeningHours = async (
  id: string,
): Promise<{ start: number | null; end: number | null }> => {
  try {
    const locations: Venue = await prisma.venue.findFirst({
      where: { id: id },
    });

    if (locations) {
      const opening: string = locations.openingHours;
      const hours: string[] = opening.split('-');
      const start: string | null = await findSlots(hours[0].trim(), true);
      const end: string | null = await findSlots(hours[1].trim(), false);

      if (start !== null && end != null) {
        return { start: Number(start), end: Number(end) };
      } else {
        return { start: null, end: null };
      }
    } else {
      return { start: null, end: null };
    }
  } catch (error) {
    console.error(error);
    return { start: null, end: null };
  }
};

export const splitHours = async (
  opening: string,
): Promise<{ start: number | null; end: number | null }> => {
  try {
    if (opening) {
      if (!opening.includes('-')) {
        return { start: null, end: null };
      }

      const hours: string[] = opening.split('-');
      if (hours.length === 2) {
        const startN = Number(hours[0].trim());
        const endN = Number(hours[1].trim());

        if (isNaN(startN) || startN === null || isNaN(endN) || endN === null) {
          return { start: null, end: null };
        } else {
          return { start: startN, end: endN };
        }
      } else {
        return { start: null, end: null };
      }
    } else {
      return { start: null, end: null };
    }
  } catch (error) {
    console.error(error);
    return { start: null, end: null };
  }
};

export const splitHoursISO = async (
  date: Date,
  timeSlot: string,
): Promise<{ start: string | null; end: string | null }> => {
  try {
    if (!isValidDate(date)) {
      return { start: null, end: null };
    }

    if (timeSlot) {
      if (!timeSlot.includes('-')) {
        return { start: null, end: null };
      }

      const hours: string[] = timeSlot.split('-');

      if (hours.length === 2) {
        const startHour: string = hours[0].trim();
        const endHour: string = hours[1].trim();

        const iso = dateISO(date);
        if (iso !== null) {
          const start: string =
            iso +
            'T' +
            startHour.toString().slice(0, 2) +
            ':' +
            startHour.slice(2) +
            ':00';
          const end: string =
            iso +
            'T' +
            endHour.toString().slice(0, 2) +
            ':' +
            endHour.slice(2) +
            ':00';

          return { start: start, end: end };
        } else {
          return { start: null, end: null };
        }
      } else {
        return { start: null, end: null };
      }
    } else {
      return { start: null, end: null };
    }
  } catch (error) {
    console.error(error);
    return { start: null, end: null };
  }
};

export const splitOpeningHours = async (
  opening: string,
): Promise<{ start: number | null; end: number | null }> => {
  try {
    if (opening) {
      const hours: string[] = opening.split('-');
      const start: string | null = await findSlots(hours[0].trim(), true);
      const end: string | null = await findSlots(hours[1].trim(), false);

      if (start !== null && end !== null) {
        return { start: Number(start), end: Number(end) };
      } else {
        return { start: null, end: null };
      }
    } else {
      return { start: null, end: null };
    }
  } catch (error) {
    console.error(error);
    return { start: null, end: null };
  }
};

export const isInstantBook = async (id: string): Promise<boolean> => {
  try {
    const locations: Venue = await prisma.venue.findFirst({
      where: { id: id },
    });

    if (locations) {
      return locations.isInstantBook;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const isVisible = async (id: string): Promise<boolean> => {
  try {
    const locations: Venue = await prisma.venue.findFirst({
      where: { id: id },
    });

    if (locations) {
      return locations.visible;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const createVenue = async (data: Venue): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const venue: Venue = await prisma.venue.create({
      data: data,
    });

    if (venue) {
      result = {
        status: true,
        error: '',
        msg: `Successfully created ${venue.name}`,
      };
    } else {
      result = { status: false, error: 'Failed to create venue', msg: '' };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
};

export const editVenue = async (data: Venue): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const venue: Venue = await prisma.venue.update({
      where: {
        id: data.id,
      },
      data: data,
    });

    if (venue) {
      result = {
        status: true,
        error: '',
        msg: `Successfully updated ${venue.name}`,
      };
    } else {
      result = { status: false, error: 'Failed to update venue', msg: '' };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
};
