import { prisma } from "@constants/db";
import {
  currentSession,
  convertSlotToArray,
  isInside,
} from "@constants/helper";

export const BOOKINGS = ["PENDING", "APPROVED", "REJECTED"];

export const isConflict = async (bookingRequest) => {
  const session = currentSession();

  if (session) {
    try {
      const timeSlots = convertSlotToArray(bookingRequest.timeSlots, true);
      for (let i in timeSlots) {
        const anyConflicting = await prisma.venueBooking.findFirst({
          where: {
            date: bookingRequest.date,
            timingSlot: timeSlots[i],
            venue: bookingRequest.venue,
          },
        });

        if (anyConflicting) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.log(error);
    }
  } else {
    return true;
  }
};

export const setApprove = async (bookingRequest) => {
  const session = currentSession();

  if (session) {
    if (bookingRequest) {
      const update = await prisma.venueBookingRequest.update({
        where: {
          id: bookingRequest.id,
        },
        data: {
          isApproved: true,
          isRejected: false,
          isCancelled: false,
        },
      });

      if (update) {
        return {
          status: true,
          error: null,
          msg: "Successfully updated request on approval",
        };
      } else {
        return { status: false, error: "Error in updating", msg: "" };
      }
    } else {
      return { status: false, error: "No booking ID found", msg: "" };
    }
  } else {
    return { status: false, error: "Unauthenticated request", msg: "" };
  }
};

export const setReject = async (bookingRequest) => {
  const session = currentSession();

  if (session) {
    if (bookingRequest) {
      const update = await prisma.venueBookingRequest.update({
        where: {
          id: bookingRequest.id,
        },
        data: {
          isApproved: false,
          isRejected: true,
          isCancelled: false,
        },
      });

      if (update) {
        return {
          status: true,
          error: null,
          msg: "Successfully updated request on reject",
        };
      } else {
        return { status: false, error: "Error in updating", msg: "" };
      }
    } else {
      return { status: false, error: "No booking ID found", msg: "" };
    }
  } else {
    return { status: false, error: "Unauthenticated request", msg: "" };
  }
};

export const setRejectConflicts = async (bookingRequest) => {
  const session = currentSession();
  let success = true;

  if (session) {
    if (bookingRequest) {
      const sameDayVenue = await prisma.venueBookingRequest.findMany({
        where: {
          date: bookingRequest.date,
          venue: bookingRequest.venue,
          id: {
            not: bookingRequest.id,
          },
          isApproved: false,
          isCancelled: false,
          isRejected: false,
        },
      });

      if (sameDayVenue) {
        console.log("SAME DAY");

        for (let key in sameDayVenue) {
          const request = sameDayVenue[key];
          if (isInside(bookingRequest.timeSlots, request.timeSlots)) {
            const reject = await setReject(request);
            if (!reject.status) {
              console.log(reject.error);
              success = false;
            }
          }
        }
      }

      if (success) {
        return {
          status: true,
          error: null,
          msg: "Successfully rejected conflicting timeslots",
        };
      } else {
        return {
          status: false,
          error: "Failed to reject conflicting timeslots",
          msg: "",
        };
      }
    } else {
      return { status: false, error: "No booking ID found", msg: "" };
    }
  } else {
    return { status: false, error: "Unauthenticated request", msg: "" };
  }
};
