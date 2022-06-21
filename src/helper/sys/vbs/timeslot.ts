import { Booking } from 'types/booking';
import { Result } from 'types/api';

import { prisma } from '@constants/sys/db';

export const fetchBookedTimeSlots = async (
  venue: string,
  convertedDate: number,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    const bookedTimeSlots: Booking[] = await prisma.venueBooking.findMany({
      where: { venue: venue, date: convertedDate },
    });

    result = { status: true, error: null, msg: bookedTimeSlots };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error, msg: '' };
  }

  return result;
};
