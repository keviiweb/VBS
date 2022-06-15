import { Result } from 'types/api';
import { prisma } from '@constants/sys/db';
import {
  convertSlotToArray,
  isInside,
  mapSlotToTiming,
  prettifyTiming,
  convertUnixToDate,
  prettifyDate,
} from '@constants/sys/helper';
import { findVenueByID } from '@helper/sys/vbs/venue';
import { findCCAbyID } from '@helper/sys/vbs/cca';
import { sendApproveMail } from '@helper/sys/vbs/email/approve';
import { sendCancelMail } from '@helper/sys/vbs/email/cancel';
import { sendRejectMail } from '@helper/sys/vbs/email/reject';
import { sendNotifyMail } from '@helper/sys/vbs/email/notify';
import {
  approvalBookingRequestMessageBuilder,
  rejectBookingRequestMessageBuilder,
  sendMessageToChannel,
} from '@helper/sys/vbs/telegram';
import { Session } from 'next-auth/core/types';
import { BookingRequest } from '@root/src/types/bookingReq';

export const BOOKINGS = ['PENDING', 'APPROVED', 'REJECTED'];

export const countBookingByUser = async (session: Session): Promise<number> => {
  let count = 0;
  try {
    count = await prisma.venueBookingRequest.count({
      where: {
        sessionEmail: session.user.email,
      },
    });
  } catch (error) {
    console.error(error);
  }

  return count;
};

export const countAllBooking = async (): Promise<number> => {
  let count = 0;
  try {
    count = await prisma.venueBookingRequest.count();
  } catch (error) {
    console.error(error);
  }

  return count;
};

export const countApprovedBooking = async (): Promise<number> => {
  let count = 0;
  try {
    count = await prisma.venueBookingRequest.count({
      where: {
        isApproved: true,
        isCancelled: false,
        isRejected: false,
      },
    });
  } catch (error) {
    console.error(error);
  }

  return count;
};

export const countPendingBooking = async (): Promise<number> => {
  let count = 0;
  try {
    count = await prisma.venueBookingRequest.count({
      where: {
        isApproved: false,
        isCancelled: false,
        isRejected: false,
      },
    });
  } catch (error) {
    console.error(error);
  }

  return count;
};

export const countRejectedBooking = async (): Promise<number> => {
  let count = 0;
  try {
    count = await prisma.venueBookingRequest.count({
      where: {
        isApproved: false,
        isCancelled: false,
        isRejected: true,
      },
    });
  } catch (error) {
    console.error(error);
  }

  return count;
};

export const findBookingByUser = async (
  session: Session,
  limit: number,
  skip: number,
): Promise<BookingRequest[]> => {
  try {
    const bookings: BookingRequest[] =
      await prisma.venueBookingRequest.findMany({
        orderBy: [
          {
            created_at: 'desc',
          },
        ],
        where: {
          sessionEmail: session.user.email,
        },
        skip: skip * limit,
        take: limit,
      });

    return bookings;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const findApprovedBooking = async (
  limit: number,
  skip: number,
): Promise<BookingRequest[]> => {
  try {
    const bookings: BookingRequest[] =
      await prisma.venueBookingRequest.findMany({
        orderBy: [
          {
            created_at: 'desc',
          },
        ],
        where: {
          isApproved: true,
          isCancelled: false,
          isRejected: false,
        },
        skip: skip * limit,
        take: limit,
      });

    return bookings;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const findRejectedBooking = async (
  limit: number,
  skip: number,
): Promise<BookingRequest[]> => {
  try {
    const bookings: BookingRequest[] =
      await prisma.venueBookingRequest.findMany({
        orderBy: [
          {
            created_at: 'desc',
          },
        ],
        where: {
          isApproved: false,
          isCancelled: false,
          isRejected: true,
        },
        skip: skip * limit,
        take: limit,
      });

    return bookings;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const findPendingBooking = async (
  limit: number,
  skip: number,
): Promise<BookingRequest[]> => {
  try {
    const bookings: BookingRequest[] =
      await prisma.venueBookingRequest.findMany({
        orderBy: [
          {
            created_at: 'desc',
          },
        ],
        where: {
          isApproved: false,
          isCancelled: false,
          isRejected: false,
        },
        skip: skip * limit,
        take: limit,
      });

    return bookings;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const findAllBooking = async (
  limit: number,
  skip: number,
): Promise<BookingRequest[]> => {
  try {
    const bookings: BookingRequest[] =
      await prisma.venueBookingRequest.findMany({
        orderBy: [
          {
            created_at: 'desc',
          },
        ],
        skip: skip * limit,
        take: limit,
      });

    return bookings;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const findBookingByID = async (id: string): Promise<BookingRequest> => {
  try {
    const bookingRequest: BookingRequest =
      await prisma.venueBookingRequest.findFirst({
        where: {
          id: id,
        },
      });

    return bookingRequest;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const isApproved = async (
  bookingRequest: BookingRequest,
): Promise<Boolean> => {
  try {
    return bookingRequest.isApproved;
  } catch (error) {
    console.error(error);
    return true;
  }
};

export const isCancelled = async (
  bookingRequest: BookingRequest,
): Promise<Boolean> => {
  try {
    return bookingRequest.isCancelled;
  } catch (error) {
    console.error(error);
    return true;
  }
};

export const isRejected = async (
  bookingRequest: BookingRequest,
): Promise<Boolean> => {
  try {
    return bookingRequest.isRejected;
  } catch (error) {
    console.error(error);
    return true;
  }
};

export const isConflict = async (
  bookingRequest: BookingRequest,
): Promise<Boolean> => {
  try {
    const timeSlots: string | number[] = convertSlotToArray(
      bookingRequest.timeSlots,
      true,
    ) as number[];
    for (let i in timeSlots) {
      const anyConflicting: BookingRequest =
        await prisma.venueBooking.findFirst({
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
    console.error(error);
    return true;
  }
};

export const setApprove = async (
  bookingRequest: BookingRequest,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  if (bookingRequest) {
    const update: BookingRequest = await prisma.venueBookingRequest.update({
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
      let slotArray: string | number[] | string[] = convertSlotToArray(
        bookingRequest.timeSlots,
        true,
      ) as number[];
      slotArray = mapSlotToTiming(slotArray);
      const venueReq: Result = await findVenueByID(bookingRequest.venue);
      let date: Date = convertUnixToDate(bookingRequest.date as number);
      let prettifiedDate: string = prettifyDate(date);

      if (venueReq && venueReq.status) {
        let cca: string = undefined;
        if (bookingRequest.cca === 'PERSONAL') {
          cca = 'PERSONAL';
        } else {
          const ccaReq: Result = await findCCAbyID(bookingRequest.cca);
          cca = ccaReq.msg.name;
        }

        const data: BookingRequest = {
          id: bookingRequest.id,
          email: bookingRequest.email,
          venue: venueReq.msg.name,
          date: prettifiedDate,
          timeSlots: prettifyTiming(slotArray as string[]),
          cca: cca,
          purpose: bookingRequest.purpose,
          sessionEmail: session.user.email,
        };

        try {
          await sendApproveMail(bookingRequest.email, data);
        } catch (error) {
          console.error(error);
        }

        try {
          const teleMSG: string = approvalBookingRequestMessageBuilder(data);
          await sendMessageToChannel(teleMSG);
        } catch (error) {
          console.error(error);
        }
      }
      result = {
        status: true,
        error: null,
        msg: 'Successfully updated request on approval',
      };
    } else {
      result = { status: false, error: 'Error in updating', msg: '' };
    }
  } else {
    result = { status: false, error: 'No booking ID found', msg: '' };
  }

  return result;
};

export const setReject = async (
  bookingRequest: BookingRequest,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  if (bookingRequest) {
    const update: BookingRequest = await prisma.venueBookingRequest.update({
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
      let slotArray: string | number[] | string[] = convertSlotToArray(
        bookingRequest.timeSlots,
        true,
      ) as number[];
      slotArray = mapSlotToTiming(slotArray);
      const venueReq: Result = await findVenueByID(bookingRequest.venue);
      let date: Date = convertUnixToDate(bookingRequest.date as number);
      let prettifiedDate: string = prettifyDate(date);

      if (venueReq && venueReq.status) {
        let cca: string = undefined;
        if (bookingRequest.cca === 'PERSONAL') {
          cca = 'PERSONAL';
        } else {
          const ccaReq: Result = await findCCAbyID(bookingRequest.cca);
          cca = ccaReq.msg.name;
        }

        const data: BookingRequest = {
          id: bookingRequest.id,
          email: bookingRequest.email,
          venue: venueReq.msg.name,
          date: prettifiedDate,
          timeSlots: prettifyTiming(slotArray as string[]),
          cca: cca,
          purpose: bookingRequest.purpose,
          sessionEmail: session.user.email,
        };

        try {
          await sendRejectMail(bookingRequest.email, data);
        } catch (error) {
          console.error(error);
        }

        try {
          const teleMSG: string = rejectBookingRequestMessageBuilder(data);
          await sendMessageToChannel(teleMSG);
        } catch (error) {
          console.error(error);
        }
      }

      result = {
        status: true,
        error: null,
        msg: 'Successfully updated request on reject',
      };
    } else {
      result = { status: false, error: 'Error in updating', msg: '' };
    }
  } else {
    result = { status: false, error: 'No booking ID found', msg: '' };
  }

  return result;
};

export const setCancel = async (
  bookingRequest: BookingRequest,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  if (bookingRequest) {
    const update: BookingRequest = await prisma.venueBookingRequest.update({
      where: {
        id: bookingRequest.id,
      },
      data: {
        isApproved: false,
        isRejected: false,
        isCancelled: true,
      },
    });

    if (update) {
      let slotArray: string | number[] | string[] = convertSlotToArray(
        bookingRequest.timeSlots,
        true,
      ) as number[];
      slotArray = mapSlotToTiming(slotArray);
      const venueReq: Result = await findVenueByID(bookingRequest.venue);
      let date: Date = convertUnixToDate(bookingRequest.date as number);
      let prettifiedDate: string = prettifyDate(date);

      let cca: string = undefined;
      if (bookingRequest.cca === 'PERSONAL') {
        cca = 'PERSONAL';
      } else {
        const ccaReq: Result = await findCCAbyID(bookingRequest.cca);
        cca = ccaReq.msg.name;
      }

      if (venueReq && venueReq.status) {
        const data: BookingRequest = {
          id: bookingRequest.id,
          email: bookingRequest.email,
          venue: venueReq.msg.name,
          date: prettifiedDate,
          timeSlots: prettifyTiming(slotArray as string[]),
          cca: cca,
          purpose: bookingRequest.purpose,
          sessionEmail: session.user.email,
        };
        try {
          await sendCancelMail(bookingRequest.email, data);
        } catch (error) {
          console.error(error);
        }
      }

      result = {
        status: true,
        error: null,
        msg: 'Successfully updated request on cancel',
      };
    } else {
      result = { status: false, error: 'Error in updating', msg: '' };
    }
  } else {
    result = { status: false, error: 'No booking ID found', msg: '' };
  }

  return result;
};

export const getConflictingRequest = async (
  bookingRequest: BookingRequest,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  let success = true;

  if (bookingRequest) {
    let conflicting: BookingRequest[] = [];
    const sameDayVenue: BookingRequest[] =
      await prisma.venueBookingRequest.findMany({
        where: {
          date: bookingRequest.date,
          venue: bookingRequest.venue,
          id: {
            not: bookingRequest.id,
          },
        },
      });

    if (sameDayVenue) {
      for (let key in sameDayVenue) {
        const request: BookingRequest = sameDayVenue[key];
        if (isInside(bookingRequest.timeSlots, request.timeSlots)) {
          conflicting.push(request);
        }
      }
    } else {
      conflicting = [];
    }

    if (success) {
      result = {
        status: true,
        error: null,
        msg: conflicting,
      };
    } else {
      result = {
        status: false,
        error: 'Failed to get conflicting timeslots',
        msg: '',
      };
    }
  } else {
    result = { status: false, error: 'No booking ID found', msg: '' };
  }

  return result;
};

export const setRejectConflicts = async (
  bookingRequest: BookingRequest,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  let success = true;

  if (bookingRequest) {
    const sameDayVenue: BookingRequest[] =
      await prisma.venueBookingRequest.findMany({
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
      let conflicting: string[] = [];

      for (let key in sameDayVenue) {
        const request: BookingRequest = sameDayVenue[key];
        if (isInside(bookingRequest.timeSlots, request.timeSlots)) {
          conflicting.push(request.id);
          const reject: Result = await setReject(request, session);
          if (!reject.status) {
            console.error(reject.error);
            success = false;
          }
        }
      }

      await updateConflictingIDs(bookingRequest, conflicting);
    }

    if (success) {
      result = {
        status: true,
        error: null,
        msg: 'Successfully rejected conflicting timeslots',
      };
    } else {
      result = {
        status: false,
        error: 'Failed to reject conflicting timeslots',
        msg: '',
      };
    }
  } else {
    result = { status: false, error: 'No booking ID found', msg: '' };
  }

  return result;
};

export const updateConflictingIDs = async (
  bookingRequest: BookingRequest,
  conflict: string[],
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  if (bookingRequest) {
    const update: BookingRequest = await prisma.venueBookingRequest.update({
      where: {
        id: bookingRequest.id,
      },
      data: {
        conflictRequest: conflict.toString(),
      },
    });

    if (update) {
      result = {
        status: true,
        error: null,
        msg: 'Successfully updated request on reject',
      };
    } else {
      result = { status: false, error: 'Error in updating', msg: '' };
    }
  } else {
    result = { status: false, error: 'No booking ID found', msg: '' };
  }

  return result;
};

export const createVenueBookingRequest = async (
  data: BookingRequest,
): Promise<BookingRequest> => {
  try {
    const bookedTimeSlots = await prisma.venueBookingRequest.create({
      data: data,
    });

    return bookedTimeSlots;
  } catch (error) {
    return null;
  }
};

export const notifyConflicts = async (
  bookingRequest: BookingRequest,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  let success = true;

  if (bookingRequest) {
    if (bookingRequest.conflictRequest) {
      let sameDayVenue: string[] = bookingRequest.conflictRequest.split(',');
      for (let key in sameDayVenue) {
        const request: string = sameDayVenue[key];
        const booking: BookingRequest = await findBookingByID(request);

        const email: Result = await notifyConflictsEmail(booking, session);
        if (!email.status) {
          console.error(email.error);
          success = false;
        }
      }
    } else {
      success = false;
    }

    if (success) {
      result = {
        status: true,
        error: null,
        msg: 'Successfully notified conflicting bookings',
      };
    } else {
      result = {
        status: false,
        error: 'Failed to notify conflicting bookings',
        msg: '',
      };
    }
  } else {
    result = { status: false, error: 'No booking ID found', msg: '' };
  }

  return result;
};

export const notifyConflictsEmail = async (
  bookingRequest: BookingRequest,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  if (bookingRequest) {
    let slotArray: string | number[] | string[] = convertSlotToArray(
      bookingRequest.timeSlots,
      true,
    ) as number[];
    slotArray = mapSlotToTiming(slotArray);
    const venueReq: Result = await findVenueByID(bookingRequest.venue);
    let date: Date = convertUnixToDate(bookingRequest.date as number);
    let prettifiedDate: string = prettifyDate(date);

    if (venueReq && venueReq.status) {
      let cca: string = undefined;
      if (bookingRequest.cca === 'PERSONAL') {
        cca = 'PERSONAL';
      } else {
        const ccaReq: Result = await findCCAbyID(bookingRequest.cca);
        cca = ccaReq.msg.name;
      }

      const data: BookingRequest = {
        id: bookingRequest.id,
        email: bookingRequest.email,
        venue: venueReq.msg.name,
        date: prettifiedDate,
        timeSlots: prettifyTiming(slotArray as string[]),
        cca: cca,
        purpose: bookingRequest.purpose,
        sessionEmail: session.user.email,
      };

      try {
        await sendNotifyMail(bookingRequest.email, data);
        result = { status: true, error: null, msg: 'Successfully notified!' };
      } catch (error) {
        console.error(error);
        result = { status: false, error: error.toString(), msg: '' };
      }
    }
  } else {
    result = { status: false, error: 'No booking provided', msg: '' };
  }

  return result;
};
