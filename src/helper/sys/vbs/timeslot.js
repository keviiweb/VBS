import { prisma } from '@constants/sys/db';

const fetchBookedTimeSlots = async (venue, convertedDate) => {
  try {
    const bookedTimeSlots = await prisma.VenueBooking.findMany({
      where: { venue, date: convertedDate },
    });

    return { status: true, error: null, msg: bookedTimeSlots };
  } catch (error) {
    return { status: false, error, msg: '' };
  }
};

export default { fetchBookedTimeSlots };
