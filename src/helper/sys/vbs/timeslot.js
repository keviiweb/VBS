import { prisma } from "@constants/sys/db";

export const fetchBookedTimeSlots = async (venue, convertedDate) => {
  try {
    const bookedTimeSlots = await prisma.VenueBooking.findMany({
      where: { venue: venue, date: convertedDate },
    });

    return { status: true, error: null, msg: bookedTimeSlots };
  } catch (error) {
    console.log(error);
    return { status: false, error: error, msg: "" };
  }
};
