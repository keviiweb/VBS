import { type Result } from 'types/api';
import { type BookingRequest } from 'types/vbs/bookingReq';
import { type Session } from 'next-auth/core/types';

import { prisma } from '@constants/sys/db';
import {
  checkerString,
  convertSlotToArray,
  isInside,
  mapSlotToTiming,
  PERSONAL,
  prettifyTiming,
} from '@constants/sys/helper';
import { convertUnixToDate, prettifyDate } from '@constants/sys/date';

import { findVenueByID } from '@helper/sys/vbs/venue';
import { findCCAbyID } from '@helper/sys/cca/cca';
import { sendApproveMail } from '@helper/sys/vbs/email/approve';
import { sendCancelMail } from '@helper/sys/vbs/email/cancel';
import { sendRejectMail } from '@helper/sys/vbs/email/reject';
import { sendNotifyMail } from '@helper/sys/vbs/email/notify';
import {
  approvalBookingRequestMessageBuilder,
  rejectBookingRequestMessageBuilder,
  sendMessageToChannel,
} from '@helper/sys/vbs/telegram';

import { logger } from '@helper/sys/misc/logger';
/**
 * Three possible states for Booking requests
 */
export const BOOKINGS = ['PENDING', 'APPROVED', 'REJECTED'];

/**
 * Count the number of booking request created by the user
 *
 * @param session Next-Auth Session
 * @returns The total number of booking requests by the user wrapped in a Promise
 */
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
    await logger('countBookingByUser', session.user.email, error.message);
  }

  return count;
};

/**
 * Counts the total number of booking requests available
 *
 * @returns The total number of booking requests wrapped in a Promise
 */
export const countAllBooking = async (session: Session): Promise<number> => {
  let count = 0;
  try {
    count = await prisma.venueBookingRequest.count();
  } catch (error) {
    console.error(error);
    await logger('countAllBooking', session.user.email, error.message);
  }

  return count;
};

/**
 * Counts the total number of booking requests available that are approved
 *
 * @returns The total number of booking requests approved wrapped in a Promise
 */
export const countApprovedBooking = async (
  session: Session,
): Promise<number> => {
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
    await logger('countApprovedBooking', session.user.email, error.message);
  }

  return count;
};

/**
 * Counts the total number of booking requests pending
 *
 * @returns The total number of booking requests pending wrapped in a Promise
 */
export const countPendingBooking = async (
  session: Session,
): Promise<number> => {
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
    await logger('countPendingBooking', session.user.email, error.message);
  }

  return count;
};

/**
 * Counts the total number of booking requests rejected
 *
 * @returns The total number of booking requests rejected wrapped in a Promise
 */
export const countRejectedBooking = async (
  session: Session,
): Promise<number> => {
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
    await logger('countRejectedBooking', session.user.email, error.message);
  }

  return count;
};

/**
 * Find all booking requests filtered by the User
 *
 * @param session Next-Auth Session
 * @param limit Number of total records to fetch. Defaults to 100000
 * @param skip Number of records to skip. Defaults to 0
 * @returns A list of Booking Requests wrapped in a Promise
 */
export const findBookingByUser = async (
  session: Session,
  limit: number = 100000,
  skip: number = 0,
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
    await logger('findBookingByUser', session.user.email, error.message);
    return [];
  }
};

/**
 * Find all approved booking requests
 *
 * @param limit Number of total records to fetch. Defaults to 100000
 * @param skip Number of records to skip. Defaults to 0
 * @returns A list of approved booking requests wrapped in a Promise
 */
export const findApprovedBooking = async (
  limit: number = 100000,
  skip: number = 0,
  session: Session,
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
    await logger('findApprovedBooking', session.user.email, error.message);
    return [];
  }
};

/**
 * Find all rejected booking requests
 *
 * @param limit Number of total records to fetch. Defaults to 100000
 * @param skip Number of records to skip. Defaults to 0
 * @returns A list of rejected booking requests wrapped in a Promise
 */
export const findRejectedBooking = async (
  limit: number = 100000,
  skip: number = 0,
  session: Session,
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
    await logger('findRejectedBooking', session.user.email, error.message);
    return [];
  }
};

/**
 * Find all pending booking requests
 *
 * @param limit Number of total records to fetch. Defaults to 100000
 * @param skip Number of records to skip. Defaults to 0
 * @returns A list of pending booking requests wrapped in a Promise
 */
export const findPendingBooking = async (
  limit: number = 100000,
  skip: number = 0,
  session: Session,
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
    await logger('findPendingBooking', session.user.email, error.message);
    return [];
  }
};

/**
 * Find all booking requests
 *
 * @param limit Number of total records to fetch. Defaults to 100000
 * @param skip Number of records to skip. Defaults to 0
 * @returns A list of booking requests wrapped in a Promise
 */
export const findAllBooking = async (
  limit: number = 100000,
  skip: number = 0,
  session: Session,
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
    await logger('findAllBooking', session.user.email, error.message);
    return [];
  }
};

/**
 * Find all pending booking requests by others in same date, time and venue
 *
 * @returns A list of pending booking requests wrapped in a Promise
 */
export const findPendingBookingWDetails = async (
  venueField: string,
  dateField: number,
  timeSlotsField: string,
  session: Session,
): Promise<BookingRequest[]> => {
  try {
    const parsedBookings: BookingRequest[] = [];

    const bookings: BookingRequest[] =
      await prisma.venueBookingRequest.findMany({
        where: {
          isApproved: false,
          isCancelled: false,
          isRejected: false,
          venue: venueField,
          date: dateField,
        },
      });

    if (bookings.length > 0) {
      for (let key = 0; key < bookings.length; key += 1) {
        const book: BookingRequest = bookings[key];
        if (isInside(timeSlotsField, book.timeSlots)) {
          parsedBookings.push(book);
        }
      }
    }

    return parsedBookings;
  } catch (error) {
    console.error(error);
    await logger(
      'findPendingBookingWDetails',
      session.user.email,
      error.message,
    );
    return [];
  }
};

/**
 * Find the specific booking request by its ID
 *
 * @param id BookingRequest ID
 * @returns A BookingRequest or null wrapped in a Promise
 */
export const findBookingByID = async (
  id: string,
  session: Session,
): Promise<BookingRequest | null> => {
  try {
    const bookingRequest: BookingRequest =
      await prisma.venueBookingRequest.findFirst({
        where: {
          id,
        },
      });

    return bookingRequest;
  } catch (error) {
    console.error(error);
    if (checkerString(id)) {
      await logger(
        `findBookingByID - ${id}`,
        session.user.email,
        error.message,
      );
    }
    return null;
  }
};

/**
 * Returns whether the request has been approved
 *
 * @param bookingRequest BookingRequest Object
 * @returns A boolean stating whether request is approved wrapped in a Promise
 */
export const isApproved = async (
  bookingRequest: BookingRequest,
  session: Session,
): Promise<boolean> => {
  try {
    if (bookingRequest.isApproved !== undefined) {
      return bookingRequest.isApproved;
    } else {
      return true;
    }
  } catch (error) {
    console.error(error);
    if (bookingRequest.id !== undefined && checkerString(bookingRequest.id)) {
      await logger(
        `isApproved - ${bookingRequest.id}`,
        session.user.email,
        error.message,
      );
    }
    return true;
  }
};

/**
 * Returns whether the request has been cancelled
 *
 * @param bookingRequest BookingRequest Object
 * @returns A boolean stating whether request is cancelled wrapped in a Promise
 */
export const isCancelled = async (
  bookingRequest: BookingRequest,
  session: Session,
): Promise<boolean> => {
  try {
    if (bookingRequest.isCancelled !== undefined) {
      return bookingRequest.isCancelled;
    } else {
      return true;
    }
  } catch (error) {
    console.error(error);
    if (bookingRequest.id !== undefined && checkerString(bookingRequest.id)) {
      await logger(
        `isCancelled - ${bookingRequest.id}`,
        session.user.email,
        error.message,
      );
    }
    return true;
  }
};

/**
 * Returns whether the request has been rejected
 *
 * @param bookingRequest BookingRequest Object
 * @returns A boolean stating whether request is rejected wrapped in a Promise
 */
export const isRejected = async (
  bookingRequest: BookingRequest,
  session: Session,
): Promise<boolean> => {
  try {
    if (bookingRequest.isRejected !== undefined) {
      return bookingRequest.isRejected;
    } else {
      return true;
    }
  } catch (error) {
    console.error(error);
    if (bookingRequest.id !== undefined && checkerString(bookingRequest.id)) {
      await logger(
        `isRejected - ${bookingRequest.id}`,
        session.user.email,
        error.message,
      );
    }
    return true;
  }
};

/**
 * Returns whether the request is created by the user
 *
 * @param bookingRequest BookingRequest Object
 * @param session Next-Auth Session
 * @returns A boolean stating whether request is created by user wrapped in a Promise
 */
export const isOwner = async (
  bookingRequest: BookingRequest,
  session: Session,
): Promise<boolean> => {
  try {
    if (
      bookingRequest.sessionEmail !== undefined &&
      session.user.email !== undefined
    ) {
      return bookingRequest.sessionEmail === session.user.email;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    if (bookingRequest.id !== undefined && checkerString(bookingRequest.id)) {
      await logger(
        `isOwner - ${bookingRequest.id}`,
        session.user.email,
        error.message,
      );
    }
    return false;
  }
};

/**
 * Returns whether there is a conflict in request
 *
 * A conflict is defined as:
 * 1. There is an existing approved Booking within the same date, venue and timeslot
 *
 * @param bookingRequest BookingRequest Object
 * @returns A boolean stating whether there is a conflict wrapped in a Promise
 */
export const isConflict = async (
  bookingRequest: BookingRequest,
  session: Session,
): Promise<boolean> => {
  try {
    const timeSlots: number[] = convertSlotToArray(
      bookingRequest.timeSlots,
      true,
    ) as number[];
    for (const i in timeSlots) {
      const anyConflicting: BookingRequest =
        await prisma.venueBooking.findFirst({
          where: {
            date: bookingRequest.date,
            timingSlot: timeSlots[i],
            venue: bookingRequest.venue,
          },
        });

      if (anyConflicting !== null && anyConflicting !== undefined) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(error);
    if (bookingRequest.id !== undefined && checkerString(bookingRequest.id)) {
      await logger(
        `isConflict - ${bookingRequest.id}`,
        session.user.email,
        error.message,
      );
    } else {
      await logger('isConflict', session.user.email, error.message);
    }
    return true;
  }
};

/**
 * Returns whether there is an existing venue booking requests
 *
 * The criteria for checking is as follows:
 * 1. If it is a PERSONAL request, check whether there is a same timeslot booking in the same date and venue
 * 2. If it is for a CCA, check whether there is a same timeslot booking for the CCA
 *
 * @param bookingRequest BookingRequest Object
 * @param session Next-Auth Session
 * @returns A boolean stating whether there is an existing request wrapped in a Promise
 */
export const isThereExisting = async (
  bookingRequest: BookingRequest,
  session: Session,
): Promise<boolean> => {
  try {
    let anyExisting: BookingRequest[] | null = null;

    if (bookingRequest.cca !== PERSONAL) {
      anyExisting = await prisma.venueBookingRequest.findMany({
        where: {
          date: bookingRequest.date,
          venue: bookingRequest.venue,
          cca: bookingRequest.cca,
          isApproved: false,
          isRejected: false,
          isCancelled: false,
        },
      });
    } else {
      anyExisting = await prisma.venueBookingRequest.findMany({
        where: {
          date: bookingRequest.date,
          venue: bookingRequest.venue,
          isApproved: false,
          isRejected: false,
          isCancelled: false,
          sessionEmail: session.user.email,
        },
      });
    }

    if (anyExisting !== null && anyExisting.length > 0) {
      for (let key = 0; key < anyExisting.length; key += 1) {
        const book: BookingRequest = anyExisting[key];
        if (isInside(bookingRequest.timeSlots, book.timeSlots)) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error(error);
    await logger('isThereExisting', session.user.email, error.message);
    return true;
  }
};

/**
 * Approve the venue booking request
 *
 * The approval process is as such:
 * 1. Update the request to APPROVED
 * 2. Send an email to the user
 * 3. Send a message to the Telegram group
 *
 * @param bookingRequest BookingRequest Object
 * @param session Next-Auth Session
 * @returns A Result containing the status wrapped in a Promise
 */
export const setApprove = async (
  bookingRequest: BookingRequest,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    if (bookingRequest !== null && bookingRequest !== undefined) {
      const update: BookingRequest = await prisma.venueBookingRequest.update({
        where: {
          id: bookingRequest.id,
        },
        data: {
          isApproved: true,
          isRejected: false,
          isCancelled: false,
          updated_at: new Date().toISOString(),
        },
      });

      if (update !== null && update !== undefined) {
        const slotArrayMsg: number[] = convertSlotToArray(
          bookingRequest.timeSlots,
          true,
        ) as number[];
        const slotArray: string[] = mapSlotToTiming(slotArrayMsg) as string[];
        const venueReq: Result = await findVenueByID(
          bookingRequest.venue,
          session,
        );
        let date: Date | null = null;
        if (bookingRequest.date !== undefined) {
          date = convertUnixToDate(bookingRequest.date);
        }

        let prettifiedDate: string = '';
        if (date !== null) {
          prettifiedDate = prettifyDate(date);
        }

        if (venueReq.status) {
          let cca: string = '';
          if (bookingRequest.cca === PERSONAL) {
            cca = PERSONAL;
          } else {
            const ccaReq: Result = await findCCAbyID(
              bookingRequest.cca,
              session,
            );
            cca = ccaReq.msg.name;
          }

          const data: BookingRequest = {
            id: bookingRequest.id,
            email: bookingRequest.email,
            venue: venueReq.msg.name,
            dateStr: prettifiedDate,
            timeSlots: prettifyTiming(slotArray),
            cca,
            purpose: bookingRequest.purpose,
            sessionEmail: session.user.email,
          };

          try {
            await sendApproveMail(bookingRequest.email, data);
          } catch (error) {
            console.error(error);
          }

          try {
            const teleMSG: string = await approvalBookingRequestMessageBuilder(
              data,
              session,
            );
            await sendMessageToChannel(teleMSG, session);
          } catch (error) {
            console.error(error);
          }
        }

        if (
          bookingRequest.id !== undefined &&
          checkerString(bookingRequest.id)
        ) {
          await logger(
            `setApprove - ${bookingRequest.id}`,
            session.user.email,
            'Successfully updated request on approval',
          );
        }
        result = {
          status: true,
          error: null,
          msg: 'Successfully updated request on approval',
        };
      } else {
        if (
          bookingRequest.id !== undefined &&
          checkerString(bookingRequest.id)
        ) {
          await logger(
            `setApprove - ${bookingRequest.id}`,
            session.user.email,
            'Error in updating',
          );
        }
        result = { status: false, error: 'Error in updating', msg: '' };
      }
    } else {
      result = { status: false, error: 'No booking ID found', msg: '' };
    }
  } catch (error) {
    console.error(error);
    if (bookingRequest.id !== undefined && checkerString(bookingRequest.id)) {
      await logger(
        `setApprove - ${bookingRequest.id}`,
        session.user.email,
        error.message,
      );
    }
  }

  return result;
};

/**
 * Reject the venue booking request
 *
 * The rejection process is as such:
 * 1. Update the request to REJECTED
 * 2. Send an email to the user
 * 3. Send a message to the Telegram group
 *
 * @param bookingRequest BookingRequest Object
 * @param reason Reason for rejection
 * @returns A Result containing the status wrapped in a Promise
 */
export const setReject = async (
  bookingRequest: BookingRequest,
  reason: string,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    if (
      bookingRequest !== null &&
      bookingRequest !== undefined &&
      checkerString(reason)
    ) {
      const update: BookingRequest = await prisma.venueBookingRequest.update({
        where: {
          id: bookingRequest.id,
        },
        data: {
          isApproved: false,
          isRejected: true,
          isCancelled: false,
          reason,
          updated_at: new Date().toISOString(),
        },
      });

      if (update !== null && update !== undefined) {
        let slotArray: string | number[] | string[] = convertSlotToArray(
          bookingRequest.timeSlots,
          true,
        ) as number[];
        slotArray = mapSlotToTiming(slotArray);
        const venueReq: Result = await findVenueByID(
          bookingRequest.venue,
          session,
        );
        const date: Date | null = convertUnixToDate(
          bookingRequest.date as number,
        );

        let prettifiedDate: string = '';
        if (date !== null) {
          prettifiedDate = prettifyDate(date);
        }

        if (venueReq.status) {
          let cca: string = '';
          if (bookingRequest.cca === PERSONAL) {
            cca = PERSONAL;
          } else {
            const ccaReq: Result = await findCCAbyID(
              bookingRequest.cca,
              session,
            );
            cca = ccaReq.msg.name;
          }

          const data: BookingRequest = {
            id: bookingRequest.id,
            email: bookingRequest.email,
            venue: venueReq.msg.name,
            dateStr: prettifiedDate,
            timeSlots: prettifyTiming(slotArray as string[]),
            cca,
            purpose: bookingRequest.purpose,
            reason,
          };

          try {
            await sendRejectMail(bookingRequest.email, data);
          } catch (error) {
            console.error(error);
          }

          try {
            const teleMSG: string = await rejectBookingRequestMessageBuilder(
              data,
              session,
            );
            await sendMessageToChannel(teleMSG, session);
          } catch (error) {
            console.error(error);
          }
        }

        if (
          bookingRequest.id !== undefined &&
          checkerString(bookingRequest.id)
        ) {
          await logger(
            `setReject - ${bookingRequest.id}`,
            session.user.email,
            'Successfully updated request on reject',
          );
        }
        result = {
          status: true,
          error: null,
          msg: 'Successfully updated request on reject',
        };
      } else {
        if (
          bookingRequest.id !== undefined &&
          checkerString(bookingRequest.id)
        ) {
          await logger(
            `setReject - ${bookingRequest.id}`,
            session.user.email,
            'Error in updating',
          );
        }
        result = { status: false, error: 'Error in updating', msg: '' };
      }
    } else if (bookingRequest !== null && bookingRequest !== undefined) {
      if (bookingRequest.id !== undefined && checkerString(bookingRequest.id)) {
        await logger(
          `setReject - ${bookingRequest.id}`,
          session.user.email,
          'No reason found',
        );
      }
      result = { status: false, error: 'No reason found', msg: '' };
    } else {
      result = { status: false, error: 'No booking ID found', msg: '' };
    }
  } catch (error) {
    console.error(error);
    if (bookingRequest.id !== undefined && checkerString(bookingRequest.id)) {
      await logger(
        `setReject - ${bookingRequest.id}`,
        session.user.email,
        error.message,
      );
    }
  }

  return result;
};

/**
 * Cancel the venue booking request
 *
 * The cancellation process is as such:
 * 1. Update the request to CANCELLED
 * 2. Send an email to the user
 *
 * @param bookingRequest BookingRequest Object
 * @param session Next-Auth Session
 * @returns A Result containing the status wrapped in a Promise
 */
export const setCancel = async (
  bookingRequest: BookingRequest,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    if (bookingRequest !== null && bookingRequest !== undefined) {
      const update: BookingRequest = await prisma.venueBookingRequest.update({
        where: {
          id: bookingRequest.id,
        },
        data: {
          isApproved: false,
          isRejected: false,
          isCancelled: true,
          updated_at: new Date().toISOString(),
        },
      });

      if (update !== null && update !== undefined) {
        let slotArray: string | number[] | string[] = convertSlotToArray(
          bookingRequest.timeSlots,
          true,
        ) as number[];
        slotArray = mapSlotToTiming(slotArray);
        const venueReq: Result = await findVenueByID(
          bookingRequest.venue,
          session,
        );
        const date: Date | null = convertUnixToDate(
          bookingRequest.date as number,
        );

        let prettifiedDate: string = '';
        if (date !== null) {
          prettifiedDate = prettifyDate(date);
        }

        let cca: string = '';
        if (bookingRequest.cca === PERSONAL) {
          cca = PERSONAL;
        } else {
          const ccaReq: Result = await findCCAbyID(bookingRequest.cca, session);
          cca = ccaReq.msg.name;
        }

        if (venueReq.status) {
          const data: BookingRequest = {
            id: bookingRequest.id,
            email: bookingRequest.email,
            venue: venueReq.msg.name,
            dateStr: prettifiedDate,
            timeSlots: prettifyTiming(slotArray as string[]),
            cca,
            purpose: bookingRequest.purpose,
            sessionEmail: session.user.email,
          };
          try {
            await sendCancelMail(bookingRequest.email, data);
          } catch (error) {
            console.error(error);
          }
        }

        if (
          bookingRequest.id !== undefined &&
          checkerString(bookingRequest.id)
        ) {
          await logger(
            `setCancel - ${bookingRequest.id}`,
            session.user.email,
            'Successfully updated request on cancel',
          );
        }
        result = {
          status: true,
          error: null,
          msg: 'Successfully updated request on cancel',
        };
      } else {
        if (
          bookingRequest.id !== undefined &&
          checkerString(bookingRequest.id)
        ) {
          await logger(
            `setCancel - ${bookingRequest.id}`,
            session.user.email,
            'Error in updating',
          );
        }
        result = { status: false, error: 'Error in updating', msg: '' };
      }
    } else {
      result = { status: false, error: 'No booking ID found', msg: '' };
    }
  } catch (error) {
    console.error(error);
    if (bookingRequest.id !== undefined && checkerString(bookingRequest.id)) {
      await logger(
        `setCancel - ${bookingRequest.id}`,
        session.user.email,
        error.message,
      );
    }
  }

  return result;
};

/**
 * Finds all other conflicting requests filtered by the BookingRequest object
 *
 * @param bookingRequest BookingRequest Object
 * @returns A Result containing the status wrapped in a Promise
 */
export const getConflictingRequest = async (
  bookingRequest: BookingRequest,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  const success = true;

  try {
    if (bookingRequest !== null && bookingRequest !== undefined) {
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

      if (sameDayVenue !== null && sameDayVenue !== undefined) {
        for (let key = 0; key < sameDayVenue.length; key += 1) {
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
  } catch (error) {
    console.error(error);
    if (bookingRequest.id !== undefined && checkerString(bookingRequest.id)) {
      await logger(
        `getConflictingRequest - ${bookingRequest.id}`,
        session.user.email,
        error.message,
      );
    }
  }

  return result;
};

/**
 * Find all other conflicting requests and reject them
 *
 * @param bookingRequest BookingRequest Object
 * @returns A Result containing the status wrapped in a Promise
 */
export const setRejectConflicts = async (
  bookingRequest: BookingRequest,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  let success = true;

  try {
    if (bookingRequest !== null && bookingRequest !== undefined) {
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

      if (sameDayVenue !== null && sameDayVenue !== undefined) {
        const conflicting: string[] = [];
        const reason: string =
          'Conflicting timeslot with another booking request';

        for (let key = 0; key < sameDayVenue.length; key += 1) {
          const request: BookingRequest = sameDayVenue[key];
          if (isInside(bookingRequest.timeSlots, request.timeSlots)) {
            if (request.id !== undefined) {
              conflicting.push(request.id);
              const reject: Result = await setReject(request, reason, session);
              if (!reject.status) {
                console.error(reject.error);
                success = false;
              }
            }
          }
        }

        await updateConflictingIDs(bookingRequest, conflicting, session);
      }

      if (success) {
        if (
          bookingRequest.id !== undefined &&
          checkerString(bookingRequest.id)
        ) {
          await logger(
            `setRejectConflicts - ${bookingRequest.id}`,
            session.user.email,
            'Successfully rejected conflicting timeslots',
          );
        }
        result = {
          status: true,
          error: null,
          msg: 'Successfully rejected conflicting timeslots',
        };
      } else {
        if (
          bookingRequest.id !== undefined &&
          checkerString(bookingRequest.id)
        ) {
          await logger(
            `setRejectConflicts - ${bookingRequest.id}`,
            session.user.email,
            'Failed to reject conflicting timeslots',
          );
        }
        result = {
          status: false,
          error: 'Failed to reject conflicting timeslots',
          msg: '',
        };
      }
    } else {
      result = { status: false, error: 'No booking ID found', msg: '' };
    }
  } catch (error) {
    console.error(error);
    if (bookingRequest.id !== undefined && checkerString(bookingRequest.id)) {
      await logger(
        `setRejectConflicts - ${bookingRequest.id}`,
        session.user.email,
        error.message,
      );
    }
  }

  return result;
};

/**
 * Update the current booking request with the list of conflicting request IDs
 *
 * @param bookingRequest BookingRequest
 * @param conflict String array containing all conflicting IDs
 * @returns A Result containing the status wrapped in a Promise
 */
export const updateConflictingIDs = async (
  bookingRequest: BookingRequest,
  conflict: string[],
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    if (bookingRequest !== null && bookingRequest !== undefined) {
      const update: BookingRequest = await prisma.venueBookingRequest.update({
        where: {
          id: bookingRequest.id,
        },
        data: {
          conflictRequest: conflict.toString(),
          updated_at: new Date().toISOString(),
        },
      });

      if (update !== null && update !== undefined) {
        if (
          bookingRequest.id !== undefined &&
          checkerString(bookingRequest.id)
        ) {
          await logger(
            `updateConflictingIDs - ${bookingRequest.id}`,
            session.user.email,
            'Successfully updated request on reject',
          );
        }
        result = {
          status: true,
          error: null,
          msg: 'Successfully updated request on reject',
        };
      } else {
        if (
          bookingRequest.id !== undefined &&
          checkerString(bookingRequest.id)
        ) {
          await logger(
            `updateConflictingIDs - ${bookingRequest.id}`,
            session.user.email,
            'Error in updating',
          );
        }
        result = { status: false, error: 'Error in updating', msg: '' };
      }
    } else {
      result = { status: false, error: 'No booking ID found', msg: '' };
    }
  } catch (error) {
    console.error(error);
    if (bookingRequest.id !== undefined && checkerString(bookingRequest.id)) {
      await logger(
        `updateConflictingIDs - ${bookingRequest.id}`,
        session.user.email,
        error.message,
      );
    }
  }

  return result;
};

/**
 * Create a new venue booking request
 *
 * @param data BookingRequest Object
 * @returns A BookingRequest or null wrapped in a Promise
 */
export const createVenueBookingRequest = async (
  data: BookingRequest,
  session: Session,
): Promise<BookingRequest | null> => {
  try {
    const bookedTimeSlots: BookingRequest =
      await prisma.venueBookingRequest.create({
        data,
      });

    if (bookedTimeSlots !== null && bookedTimeSlots !== undefined) {
      if (
        bookedTimeSlots.id !== undefined &&
        checkerString(bookedTimeSlots.id)
      ) {
        await logger(
          'createVenueBookingRequest',
          session.user.email,
          'Successfully created venue booking request',
        );
      }
    }
    return bookedTimeSlots;
  } catch (error) {
    console.error(error);
    await logger(
      'createVenueBookingRequest',
      session.user.email,
      error.message,
    );
    return null;
  }
};

/**
 * Notify other users that timeslot is available
 *
 * @param bookingRequest BookingRequest Object
 * @returns A Result containing the status wrapped in a Promise
 */
export const notifyConflicts = async (
  bookingRequest: BookingRequest,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  let success: boolean = true;

  try {
    if (bookingRequest !== null && bookingRequest !== undefined) {
      if (
        bookingRequest.conflictRequest !== undefined &&
        checkerString(bookingRequest.conflictRequest)
      ) {
        const conflicts: string[] = bookingRequest.conflictRequest.split(',');
        if (conflicts.length > 0) {
          for (let key = 0; key < conflicts.length; key += 1) {
            const conflictID: string = conflicts[key];
            const sameDayVenue: BookingRequest | null = await findBookingByID(
              conflictID,
              session,
            );

            if (sameDayVenue !== null) {
              const email: Result = await notifyConflictsEmail(
                sameDayVenue,
                session,
              );
              if (!email.status) {
                console.error(email.error);
                success = false;
              }
            } else {
              success = false;
            }
          }
        }
      }

      if (success) {
        if (
          bookingRequest.id !== undefined &&
          checkerString(bookingRequest.id)
        ) {
          await logger(
            `notifyConflicts - ${bookingRequest.id}`,
            session.user.email,
            'Successfully notified conflicting bookings',
          );
        }
        result = {
          status: true,
          error: null,
          msg: 'Successfully notified conflicting bookings',
        };
      } else {
        if (
          bookingRequest.id !== undefined &&
          checkerString(bookingRequest.id)
        ) {
          await logger(
            `notifyConflicts - ${bookingRequest.id}`,
            session.user.email,
            'Failed to notify conflicting bookings',
          );
        }
        result = {
          status: false,
          error: 'Failed to notify conflicting bookings',
          msg: '',
        };
      }
    } else {
      result = { status: false, error: 'No booking ID found', msg: '' };
    }
  } catch (error) {
    console.error(error);
    if (bookingRequest.id !== undefined && checkerString(bookingRequest.id)) {
      await logger(
        `notifyConflicts - ${bookingRequest.id}`,
        session.user.email,
        error.message,
      );
    }
  }

  return result;
};

/**
 * Send an email to notify other users that the timeslot is available for booking
 *
 * @param bookingRequest BookingRequest Object
 * @returns A Result containing the status wrapped in a Promise
 */
export const notifyConflictsEmail = async (
  bookingRequest: BookingRequest,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  try {
    if (bookingRequest !== null && bookingRequest !== undefined) {
      const slotArr: number[] = convertSlotToArray(
        bookingRequest.timeSlots,
        true,
      ) as number[];
      const slotArray: string[] = mapSlotToTiming(slotArr) as string[];
      const venueReq: Result = await findVenueByID(
        bookingRequest.venue,
        session,
      );
      const date: Date | null = convertUnixToDate(
        bookingRequest.date as number,
      );

      let prettifiedDate: string = '';
      if (date !== null) {
        prettifiedDate = prettifyDate(date);
      }

      if (venueReq.status) {
        let cca: string = '';
        if (bookingRequest.cca === PERSONAL) {
          cca = PERSONAL;
        } else {
          const ccaReq: Result = await findCCAbyID(bookingRequest.cca, session);

          if (ccaReq.status) {
            const ccaReqMsg = ccaReq.msg;
            cca = ccaReqMsg.name;
          } else {
            console.error(ccaReq.error);
          }
        }

        const data: BookingRequest = {
          id: bookingRequest.id,
          email: bookingRequest.email,
          venue: venueReq.msg.name,
          dateStr: prettifiedDate,
          timeSlots: prettifyTiming(slotArray),
          cca,
          purpose: bookingRequest.purpose,
        };

        try {
          await sendNotifyMail(bookingRequest.email, data);
          result = { status: true, error: null, msg: 'Successfully notified!' };
          if (
            bookingRequest.id !== undefined &&
            checkerString(bookingRequest.id)
          ) {
            await logger(
              `notifyConflictsEmail - ${bookingRequest.id}`,
              session.user.email,
              'Successfully notified!',
            );
          }
        } catch (error) {
          console.error(error);
          if (
            bookingRequest.id !== undefined &&
            checkerString(bookingRequest.id)
          ) {
            await logger(
              `notifyConflictsEmail - ${bookingRequest.id}`,
              session.user.email,
              error.message,
            );
          }
          result = { status: false, error: 'Failed to notify users', msg: '' };
        }
      }
    } else {
      result = { status: false, error: 'No booking provided', msg: '' };
    }
  } catch (error) {
    console.error(error);
    if (bookingRequest.id !== undefined && checkerString(bookingRequest.id)) {
      await logger(
        `notifyConflictsEmail - ${bookingRequest.id}`,
        session.user.email,
        error.message,
      );
    }
  }

  return result;
};

/**
 * Delete all Venue Booking Requests
 *
 * @param session Next-Auth Session
 * @returns A Result containing the status wrapped in a Promise
 */
export const deleteAllVenueBookingRequest = async (
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    await prisma.venueBookingRequest.deleteMany({});
    await logger(
      'deleteAllVenueBookingRequest',
      session.user.email,
      'Successfully deleted all booking requests!',
    );
    result = {
      status: true,
      error: null,
      msg: 'Successfully deleted all booking requests!',
    };
  } catch (error) {
    console.error(error);
    await logger(
      'deleteAllVenueBookingRequest',
      session.user.email,
      error.message,
    );
    result = {
      status: false,
      error: 'Error in deleting all booking requests!',
      msg: '',
    };
  }
  return result;
};

/**
 * Delete all Venue Booking Requests by Venue ID
 *
 * @param id Venue ID
 * @param session Next-Auth Session
 * @returns A Result containing the status wrapped in a Promise
 */
export const deleteAllByVenueID = async (
  id: string,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    await prisma.venueBookingRequest.deleteMany({
      where: {
        venue: id,
      },
    });
    await logger(
      'deleteAllByVenueID',
      session.user.email,
      'Successfully deleted all booking requests!',
    );
    result = {
      status: true,
      error: null,
      msg: 'Successfully deleted all booking requests!',
    };
  } catch (error) {
    console.error(error);
    await logger('deleteAllByVenueID', session.user.email, error.message);
    result = {
      status: false,
      error: 'Error in deleting all booking requests!',
      msg: '',
    };
  }
  return result;
};
