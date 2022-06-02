import { prisma } from "@constants/db";

export const findAllBookingByVenueID = async (id) => {
  try {
    const bookings = await prisma.venueBooking.findMany({
      orderBy: [
        {
          date: "desc",
        },
        {
          timingSlot: "asc",
        },
      ],
      where: {
        venue: id,
      },
    });

    return bookings;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const createVenueBooking = async (
  bookingRequest,
  timeSlots,
  session
) => {
  try {
    for (let i in timeSlots) {
      const insertRequest = await prisma.venueBooking.create({
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
        console.log("Approve Request - Venue Booking creation failed!");
        return {
          status: false,
          error: "Error in creating venue booking",
          msg: "",
        };
      }
    }

    return { status: true, error: "", msg: "Successfully created bookings" };
  } catch (error) {
    console.log(error);
    return { status: false, error: "Error in creating venue booking", msg: "" };
  }
};
