import { Booking } from 'types/vbs/booking';
import { Result } from 'types/api';
import { Session } from 'next-auth/core/types';

import { prisma } from '@constants/sys/db';
import { checkerString } from '@constants/sys/helper';

import { logger } from '@helper/sys/misc/logger';

/**
 * Find all booked timeslots filtered by the date and the venue ID
 *
 * @param venue Venue ID
 * @param convertedDate Date in Unix Timestamp (in seconds)
 * @returns A Result containing the list of timeslots wrapped in a Promise
 */
export const fetchBookedTimeSlots = async (
  venue: string,
  convertedDate: number,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const bookedTimeSlots: Booking[] = await prisma.venueBooking.findMany({
      where: { venue, date: convertedDate },
    });

    result = { status: true, error: null, msg: bookedTimeSlots };
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch timeslots', msg: [] };

    if (checkerString(venue)) {
      await logger(
        `fetchBookedTimeSlots - ${venue}`,
        session.user.email,
        error.message,
      );
    }
  }

  return result;
};
