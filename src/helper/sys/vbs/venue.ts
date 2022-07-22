import { prisma } from '@constants/sys/db';
import { findSlots } from '@constants/sys/helper';
import { dateISO, isValidDate } from '@constants/sys/date';

import { Venue } from 'types/vbs/venue';
import { Result } from 'types/api';
import { Session } from 'next-auth/core/types';

import { logger } from '@helper/sys/misc/logger';
/**
 * Count the total of venues
 *
 * @returns The total number of venues wrapped in a Promise
 */
export const countVenue = async (session: Session): Promise<number> => {
  let count: number = 0;
  try {
    count = await prisma.venue.count();
  } catch (error) {
    console.error(error);
    await logger('countVenue', session.user.email, error.message);
  }

  return count;
};

/**
 * Finds all child venue tagged under the parent venue filtered by parent venue ID
 *
 * @param venue Parent venue ID
 * @returns A Result containing the child venues wrapped in a Promise
 */
export const fetchChildVenue = async (
  venue: string,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const childVenues: Venue[] = await prisma.venue.findMany({
      where: { parentVenue: venue, isChildVenue: true },
    });

    if (childVenues) {
      result = { status: true, error: null, msg: childVenues };
    } else {
      result = {
        status: false,
        error: 'Failed to fetch child venues',
        msg: [],
      };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch child venues', msg: [] };
    await logger('fetchChildVenue', session.user.email, error.message);
  }

  return result;
};

/**
 * Find all venues
 *
 * @param limit Number of total records to fetch. Defaults to 100000
 * @param skip Number of records to skip. Defaults to 0
 * @returns A Result containing the list of venues wrapped in a Promise
 */
export const fetchAllVenue = async (
  limit: number = 100000,
  skip: number = 0,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const locations: Venue[] = await prisma.venue.findMany({
      skip: skip * limit,
      take: limit,
    });

    if (locations) {
      result = { status: true, error: null, msg: locations };
    } else {
      result = { status: false, error: 'Failed to fetch venues', msg: [] };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch venues', msg: [] };
    await logger('fetchAllVenue', session.user.email, error.message);
  }

  return result;
};

/**
 * Fetches all venues that are set to Visible and is a parent venue
 *
 * @returns A Result containing the list of venues wrapped in a Promise
 */
export const fetchVenue = async (session: Session): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const locations: Venue[] = await prisma.venue.findMany({
      where: { visible: true, isChildVenue: false },
    });

    if (locations) {
      result = { status: true, error: null, msg: locations };
    } else {
      result = { status: false, error: 'Failed to fetch venues', msg: [] };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch venues', msg: [] };
    await logger('fetchVenue', session.user.email, error.message);
  }

  return result;
};

/**
 * Find the specified venue filtered by its ID
 *
 * @param id Venue ID
 * @returns A Result containing the status wrapped in a Promise
 */
export const findVenueByID = async (
  id: string,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const locations: Venue = await prisma.venue.findFirst({
      where: { id: id },
    });

    if (locations) {
      result = { status: true, error: null, msg: locations };
    } else {
      result = { status: false, error: 'Failed to fetch venues', msg: null };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch venues', msg: null };
    await logger('findVenueByID', session.user.email, error.message);
  }

  return result;
};

/**
 * Finds the opening hours of the venue filtered by the venue ID
 *
 * @param id Venue ID
 * @returns A Promise containing the start and end time
 */
export const fetchOpeningHours = async (
  id: string,
  session: Session,
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
    await logger('fetchOpeningHours', session.user.email, error.message);
    return { start: null, end: null };
  }
};

/**
 * Combines a date and a timeslot to form a Date ISO String
 *
 * eg. Date = new Date('2022-06-16')
 *
 * eg. Timeslot: '0700 - 2300'
 *
 * Result:
 * 1. start: '2022-06-16T07:00:00'
 * 2. end: '2022-06-16T23:00:00'
 * @param date Date object
 * @param timeSlot Timeslot
 * @returns A Promise containing the start and end time in ISOString format
 */
export const splitHoursISO = async (
  date: Date,
  timeSlot: string,
  session: Session,
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
    await logger('splitHoursISO', session.user.email, error.message);
    return { start: null, end: null };
  }
};

/**
 * Split a timeslot string into their respective timeslots after validating
 *
 * eg. 0700 - 0730 is split into 1 and 2
 *
 * @param opening Opening Hours
 * @returns Start and End timeslot IDs wrapped in a Promise
 */
export const splitOpeningHours = async (
  opening: string,
  session: Session,
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
    await logger('splitOpeningHours', session.user.email, error.message);
    return { start: null, end: null };
  }
};

/**
 * Checks whether the specified ID is an instant-book venue
 *
 * @param id Venue ID
 * @returns A boolean stating if it is an instant-book venue wrapped in a Promise
 */
export const isInstantBook = async (
  id: string,
  session: Session,
): Promise<boolean> => {
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
    await logger('isInstantBook', session.user.email, error.message);
    return false;
  }
};

/**
 * Check whether the specified ID is a visble venue (book-able)
 *
 * @param id Venue ID
 * @returns A boolean stating if it is a bookable venue wrapped in a Promise
 */
export const isVisible = async (
  id: string,
  session: Session,
): Promise<boolean> => {
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
    await logger('isVisible', session.user.email, error.message);
    return false;
  }
};

/**
 * Creates a Venue
 *
 * @param data Venue Object
 * @returns A Result containing the status wrapped in a Promise
 */
export const createVenue = async (
  data: Venue,
  session: Session,
): Promise<Result> => {
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
    await logger('createVenue', session.user.email, error.message);
    result = { status: false, error: 'Failed to create venue', msg: '' };
  }

  return result;
};

/**
 * Edits a Venue
 *
 * @param data Venue Object
 * @returns A Result containing the status wrapped in a Promise
 */
export const editVenue = async (
  data: Venue,
  session: Session,
): Promise<Result> => {
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
    result = { status: false, error: 'Failed to update venue', msg: '' };
    await logger('editVenue', session.user.email, error.message);
  }

  return result;
};
