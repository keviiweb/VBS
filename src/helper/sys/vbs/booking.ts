import { prisma } from '@constants/sys/db';

import { BookingRequest } from 'types/vbs/bookingReq';
import { Result } from 'types/api';
import { Booking } from 'types/vbs/booking';
import { Session } from 'next-auth/core/types';

import { logger } from '@helper/sys/misc/logger';
/**
 * Finds all bookings filtered by the venue ID
 *
 * @param id Venue ID
 * @returns A list of bookings filtered by venue ID wrapped in a Promise
 */
export const findAllBookingByVenueID = async (
  id: string,
  session: Session,
): Promise<Booking[]> => {
  try {
    const bookings: Booking[] = await prisma.venueBooking.findMany({
      orderBy: [
        {
          date: 'desc',
        },
        {
          timingSlot: 'asc',
        },
      ],
      where: {
        venue: id,
      },
    });

    return bookings;
  } catch (error) {
    console.error(error);
    await logger('findAllBookingByVenueID', session.user.email, error.message);
    return [];
  }
};

/**
 * Create a Venue Booking
 *
 * @param bookingRequest BookingRequest Object
 * @param timeSlots An array of numbers containing the timeslots
 * @param session Next-Auth Session object
 * @returns A Result containing the status wrapped in a Promise
 */
export const createVenueBooking = async (
  bookingRequest: BookingRequest,
  timeSlots: number[],
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  let success = true;
  try {
    for (let i in timeSlots) {
      const insertRequest: Booking = await prisma.venueBooking.create({
        data: {
          email: bookingRequest.email,
          venue: bookingRequest.venue,
          date: bookingRequest.date,
          timingSlot: timeSlots[i],
          cca: bookingRequest.cca,
          purpose: bookingRequest.purpose,
          sessionEmail: session.user.email,
        },
      });

      if (!insertRequest) {
        await logger('createVenueBooking', session.user.email, 'Approve Request - Venue Booking creation failed!');
        console.error('Approve Request - Venue Booking creation failed!');
        success = false;
        result = {
          status: false,
          error: 'Error in creating venue booking',
          msg: '',
        };
      }
    }

    if (success) {
      await logger('createVenueBooking', session.user.email, 'Successfully created bookings');
      result = {
        status: true,
        error: '',
        msg: 'Successfully created bookings',
      };
    }
  } catch (error) {
    console.error(error);
    result = {
      status: false,
      error: 'Error in creating venue booking',
      msg: '',
    };
    await logger('createVenueBooking', session.user.email, error.message);
  }

  return result;
};

/**
 * Deletes a Venue Booking filtered by the bookingRequest details and timeSlots
 *
 * @param bookingRequest BookingRequest Object
 * @param timeSlots An array of numbers containing the timeslots
 * @returns A Result containing the status wrapped in a Promise
 */
export const deleteVenueBooking = async (
  bookingRequest: BookingRequest,
  timeSlots: number[],
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  let success = true;
  try {
    for (let i in timeSlots) {
      const deleteRequest: Booking = await prisma.venueBooking.deleteMany({
        where: {
          email: bookingRequest.email,
          venue: bookingRequest.venue,
          date: bookingRequest.date,
          timingSlot: timeSlots[i],
          cca: bookingRequest.cca,
          purpose: bookingRequest.purpose,
        },
      });

      if (!deleteRequest) {
        await logger('deleteVenueBooking', session.user.email, 'Cancel Request - Venue Booking deletion failed!');
        console.error('Cancel Request - Venue Booking deletion failed!');
        success = false;
        result = {
          status: false,
          error: 'Error in deleting venue booking',
          msg: '',
        };
      }
    }

    if (success) {
      await logger('deleteVenueBooking', session.user.email, 'Successfully deleted bookings');
      result = {
        status: true,
        error: '',
        msg: 'Successfully deleted bookings',
      };
    }
  } catch (error) {
    console.error(error);
    result = {
      status: false,
      error: 'Error in creating venue booking',
      msg: '',
    };
    await logger('deleteVenueBooking', session.user.email, error.message);
  }

  return result;
};
