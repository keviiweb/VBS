import { prisma } from '@constants/sys/db';

import { BookingRequest } from 'types/vbs/bookingReq';
import { Result } from 'types/api';
import { Booking } from 'types/vbs/booking';
import { Session } from 'next-auth/core/types';
import { Venue } from 'types/vbs/venue';

import { logger } from '@helper/sys/misc/logger';
import { checkerString, PERSONAL } from '@root/src/constants/sys/helper';
import { findVenueByName } from '@helper/sys/vbs/venue';
import { findCCAbyName } from '@helper/sys/cca/cca';

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
        await logger(
          'createVenueBooking',
          session.user.email,
          'Approve Request - Venue Booking creation failed!',
        );
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
      await logger(
        `createVenueBooking`,
        session.user.email,
        'Successfully created bookings',
      );

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
        await logger(
          'deleteVenueBooking',
          session.user.email,
          'Cancel Request - Venue Booking deletion failed!',
        );
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
      await logger(
        'deleteVenueBooking',
        session.user.email,
        'Successfully deleted bookings',
      );
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

/**
 * Populates the list of bookings read from a CSV file
 *
 * 1. The specific Booking record is fetched
 * 2. If the record is available, throw Error
 * 3. If the record cannot be found, a new record is created.
 *
 * @param dataField File content
 * @returns A Result containing the status wrapped in a Promise
 */
export const createRecurringBooking = async (
  dataField: any[],
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  let count = 0;

  try {
    for (let key = 0; key < dataField.length; key += 1) {
      if (dataField[key]) {
        const data = dataField[key];

        const email: string = data.email !== undefined ? data.email : '';
        const venueName: string =
          data.venueName !== undefined ? data.venueName : '';
        const dateStr: string = data.date !== undefined ? data.date : '';
        const cca: string = data.cca !== undefined ? data.cca : PERSONAL;
        const timeSlot: string =
          data.timeSlot !== undefined ? data.timeSlot : '';
        const purpose: string = data.purpose !== undefined ? data.purpose : '';

        if (
          checkerString(email) &&
          checkerString(venueName) &&
          checkerString(dateStr) &&
          checkerString(cca) &&
          checkerString(timeSlot) &&
          checkerString(purpose)
        ) {
          const venueDetailsRes: Result = await findVenueByName(
            venueName,
            session,
          );
          if (venueDetailsRes.status && venueDetailsRes.msg !== null) {
            const venueDetails: Venue = venueDetailsRes.msg;

            if (cca !== PERSONAL) {
              const ccaDetailsRes: Result = await findCCAbyName(cca, session);
              if (ccaDetailsRes.status && ccaDetailsRes.msg !== null) {
              } else {
                // scold
              }
            }
          } else {
            // scold
          }
        }

        count += 1;
      }
    }

    await logger(
      'createRecurringBooking',
      session.user.email,
      `Successfully created ${count} bookings`,
    );
    result = {
      status: true,
      error: null,
      msg: `Successfully created ${count} bookings`,
    };
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to create bookings', msg: '' };
    await logger('createRecurringBooking', session.user.email, error.message);
  }
  return result;
};
