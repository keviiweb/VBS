import { prisma } from '@constants/sys/db';

import { BookingRequest } from 'types/vbs/bookingReq';
import { Result } from 'types/api';
import { Booking } from 'types/vbs/booking';
import { Session } from 'next-auth/core/types';

export const findAllBookingByVenueID = async (
  id: string,
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
    return [];
  }
};

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
  }

  return result;
};

export const deleteVenueBooking = async (
  bookingRequest: BookingRequest,
  timeSlots: number[],
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
  }

  return result;
};
