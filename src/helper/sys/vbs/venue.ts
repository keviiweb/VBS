import { prisma } from '@constants/sys/db';
import { checkerString, findSlots } from '@constants/sys/helper';
import { dateISO, isValidDate } from '@constants/sys/date';

import { Venue } from 'types/vbs/venue';
import { Result } from 'types/api';
import { Session } from 'next-auth/core/types';

import { logger } from '@helper/sys/misc/logger';
import { deleteAllByVenueID } from '@helper/sys/vbs/bookingReq';
import { deleteAllVenueBookingByVenueID } from '@helper/sys/vbs/booking';

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

    result = { status: true, error: null, msg: childVenues };
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch child venues', msg: [] };

    if (checkerString(venue)) {
      await logger(
        `fetchChildVenue - ${venue}`,
        session.user.email,
        error.message,
      );
    }
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

    result = { status: true, error: null, msg: locations };
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

    result = { status: true, error: null, msg: locations };
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
      where: { id },
    });

    if (locations !== null && locations !== undefined) {
      result = { status: true, error: null, msg: locations };
    } else {
      result = { status: false, error: 'Failed to fetch venues', msg: null };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch venues', msg: null };

    if (checkerString(id)) {
      await logger(`findVenueByID - ${id}`, session.user.email, error.message);
    }
  }

  return result;
};

/**
 * Find the specified venue filtered by its Name
 *
 * @param name Venue Name
 * @returns A Result containing the status wrapped in a Promise
 */
export const findVenueByName = async (
  name: string,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const locations: Venue = await prisma.venue.findUnique({
      where: { name },
    });

    result = { status: true, error: null, msg: locations };
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch venues', msg: null };

    if (checkerString(name)) {
      await logger(
        `findVenueByName - ${name}`,
        session.user.email,
        error.message,
      );
    }
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
): Promise<{ start: number | null; end: number | null; }> => {
  try {
    const locations: Venue = await prisma.venue.findFirst({
      where: { id },
    });

    if (locations !== null && locations !== undefined) {
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

    if (checkerString(id)) {
      await logger(
        `fetchOpeningHours - ${id}`,
        session.user.email,
        error.message,
      );
    }
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
): Promise<{ start: string | null; end: string | null; }> => {
  try {
    if (!isValidDate(date)) {
      return { start: null, end: null };
    }

    if (checkerString(timeSlot)) {
      if (!timeSlot.includes('-')) {
        return { start: null, end: null };
      }

      const hours: string[] = timeSlot.split('-');

      if (hours.length === 2) {
        const startHour: string = hours[0].trim();
        const endHour: string = hours[1].trim();

        const iso: string = dateISO(date);
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

          return { start, end };
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
): Promise<{ start: number | null; end: number | null; }> => {
  try {
    if (checkerString(opening)) {
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
      where: { id },
    });

    if (locations !== null && locations !== undefined) {
      return locations.isInstantBook;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    if (checkerString(id)) {
      await logger(`isInstantBook - ${id}`, session.user.email, error.message);
    }
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
      where: { id },
    });

    if (locations !== null && locations !== undefined) {
      return locations.visible;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    if (checkerString(id)) {
      await logger(`isVisible - ${id}`, session.user.email, error.message);
    }
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
      data,
    });

    if (venue !== null && venue !== undefined) {
      await logger(
        'createVenue',
        session.user.email,
        `Successfully created ${venue.name}`,
      );
      result = {
        status: true,
        error: '',
        msg: `Successfully created ${venue.name}`,
      };
    } else {
      if (checkerString(data.name)) {
        await logger(
          'createVenue',
          session.user.email,
          `Failed to create venue ${data.name}`,
        );
      }
      result = { status: false, error: 'Failed to create venue', msg: '' };
    }
  } catch (error) {
    console.error(error);
    if (checkerString(data.name)) {
      await logger(
        `createVenue - ${data.name}`,
        session.user.email,
        error.message,
      );
    }
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
      data,
    });

    if (venue !== null && venue !== undefined) {
      await logger(
        'editVenue',
        session.user.email,
        `Successfully updated ${venue.name}`,
      );
      result = {
        status: true,
        error: '',
        msg: `Successfully updated ${venue.name}`,
      };
    } else {
      if (checkerString(data.name)) {
        await logger(
          'editVenue',
          session.user.email,
          `Failed to update ${data.name}`,
        );
      }
      result = { status: false, error: 'Failed to update venue', msg: '' };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to update venue', msg: '' };
    await logger('editVenue', session.user.email, error.message);
  }

  return result;
};

/**
 * Deletes a Venue
 *
 * First it deletes the booking requests tagged with the venue
 * Next, it deletes the existing bookings tagged with the venue
 * Lastly, it deletes the venue
 *
 * @param id Venue id
 * @returns A Result containing the status wrapped in a Promise
 */
export const deleteVenue = async (
  id: string,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const deleteBookingReq: Result = await deleteAllByVenueID(id, session);
    if (deleteBookingReq.status) {
      const deleteBookingRes: Result = await deleteAllVenueBookingByVenueID(
        id,
        session,
      );
      if (deleteBookingRes.status) {
        const deleteVenueRes: Result = await deleteVenueByID(id, session);
        if (deleteVenueRes.status) {
          result = {
            status: true,
            error: '',
            msg: deleteVenueRes.msg,
          };
        } else {
          result = { status: false, error: deleteVenueRes.error, msg: '' };
        }
      } else {
        result = { status: false, error: deleteBookingRes.error, msg: '' };
      }
    } else {
      result = { status: false, error: deleteBookingReq.error, msg: '' };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to delete venue', msg: '' };
    await logger('deleteVenue', session.user.email, error.message);
  }

  return result;
};

/**
 * Deletes a Venue
 *
 * @param id Venue id
 * @returns A Result containing the status wrapped in a Promise
 */
export const deleteVenueByID = async (
  id: string,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const venue: Venue = await prisma.venue.delete({
      where: {
        id,
      },
    });

    if (venue !== null && venue !== undefined) {
      result = {
        status: true,
        error: '',
        msg: 'Successfully updated venue',
      };
    } else {
      if (checkerString(id)) {
        await logger(
          'deleteVenueByID',
          session.user.email,
          'Failed to delete venue',
        );
      }
      result = { status: false, error: 'Failed to delete venue', msg: '' };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to delete venue', msg: '' };
    await logger('deleteVenueByID', session.user.email, error.message);
  }

  return result;
};
