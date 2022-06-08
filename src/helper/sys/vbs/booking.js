import { prisma } from '@constants/sys/db';

export const findAllBookingByVenueID = async (id) => {
  try {
    const bookings = await prisma.venueBooking.findMany({
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
    return null;
  }
};

export const createVenueBooking = async (
  bookingRequest,
  timeSlots,
  session,
) => {
  try {
    const results = [];

    Object.keys(timeSlots).forEach((i) => {
      if (timeSlots[i]) {
        results.push(
          prisma.venueBooking.create({
            data: {
              email: bookingRequest.email,
              venue: bookingRequest.venue,
              date: bookingRequest.date,
              timingSlot: timeSlots[i],
              cca: bookingRequest.cca,
              purpose: bookingRequest.purpose,
              sessionEmail: session.user.email,
            },
          }),
        );
      }
    });

    const insertRequest = await Promise.all(results);
    if (!insertRequest) {
      return { status: true, error: 'Error occured', msg: '' };
    }
    return { status: true, error: '', msg: 'Successfully created bookings' };
  } catch (error) {
    return {
      status: false,
      error: 'Error in creating venue booking',
      msg: '',
    };
  }
};
