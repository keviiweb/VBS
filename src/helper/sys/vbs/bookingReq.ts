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

export const BOOKINGS = ['PENDING', 'APPROVED', 'REJECTED'];

export const countBookingByUser = async (session) => {
  try {
    const count = await prisma.venueBookingRequest.count({
      where: {
        sessionEmail: session.user.email,
      },
    });
    return count;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

export const countAllBooking = async () => {
  try {
    const count = await prisma.venueBookingRequest.count();
    return count;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

export const countApprovedBooking = async () => {
  try {
    const count = await prisma.venueBookingRequest.count({
      where: {
        isApproved: true,
        isCancelled: false,
        isRejected: false,
      },
    });
    return count;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

export const countPendingBooking = async () => {
  try {
    const count = await prisma.venueBookingRequest.count({
      where: {
        isApproved: false,
        isCancelled: false,
        isRejected: false,
      },
    });
    return count;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

export const countRejectedBooking = async () => {
  try {
    const count = await prisma.venueBookingRequest.count({
      where: {
        isApproved: false,
        isCancelled: false,
        isRejected: true,
      },
    });
    return count;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

export const findBookingByUser = async (session, limit, skip) => {
  try {
    const bookings = await prisma.venueBookingRequest.findMany({
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

export const findApprovedBooking = async (limit, skip) => {
  try {
    const bookings = await prisma.venueBookingRequest.findMany({
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

export const findRejectedBooking = async (limit, skip) => {
  try {
    const bookings = await prisma.venueBookingRequest.findMany({
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

export const findPendingBooking = async (limit, skip) => {
  try {
    const bookings = await prisma.venueBookingRequest.findMany({
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

export const findAllBooking = async (limit, skip) => {
  try {
    const bookings = await prisma.venueBookingRequest.findMany({
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

export const findBookingByID = async (id) => {
  try {
    const bookingRequest = await prisma.venueBookingRequest.findFirst({
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

export const isApproved = async (bookingRequest) => {
  try {
    return bookingRequest.isApproved;
  } catch (error) {
    console.error(error);
    return true;
  }
};

export const isCancelled = async (bookingRequest) => {
  try {
    return bookingRequest.isCancelled;
  } catch (error) {
    console.error(error);
    return true;
  }
};

export const isRejected = async (bookingRequest) => {
  try {
    return bookingRequest.isRejected;
  } catch (error) {
    console.error(error);
    return true;
  }
};

export const isConflict = async (bookingRequest) => {
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
    console.error(error);
    return true;
  }
};

export const setApprove = async (bookingRequest, session) => {
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
      let slotArray = convertSlotToArray(bookingRequest.timeSlots, true);
      slotArray = mapSlotToTiming(slotArray);
      const venueReq = await findVenueByID(bookingRequest.venue);
      let date = convertUnixToDate(bookingRequest.date);
      let prettifiedDate = prettifyDate(date);

      if (venueReq && venueReq.status) {
        let cca = undefined;
        if (bookingRequest.cca === 'PERSONAL') {
          cca = 'PERSONAL';
        } else {
          const ccaReq = await findCCAbyID(bookingRequest.cca);
          cca = ccaReq.msg.name;
        }

        const data = {
          id: bookingRequest.id,
          email: bookingRequest.email,
          venue: venueReq.msg.name,
          date: prettifiedDate,
          timeSlots: prettifyTiming(slotArray),
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
          const teleMSG = approvalBookingRequestMessageBuilder(data);
          await sendMessageToChannel(teleMSG);
        } catch (error) {
          console.error(error);
        }
      }
      return {
        status: true,
        error: null,
        msg: 'Successfully updated request on approval',
      };
    } else {
      return { status: false, error: 'Error in updating', msg: '' };
    }
  } else {
    return { status: false, error: 'No booking ID found', msg: '' };
  }
};

export const setReject = async (bookingRequest, session) => {
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
      let slotArray = convertSlotToArray(bookingRequest.timeSlots, true);
      slotArray = mapSlotToTiming(slotArray);
      const venueReq = await findVenueByID(bookingRequest.venue);
      let date = convertUnixToDate(bookingRequest.date);
      let prettifiedDate = prettifyDate(date);

      if (venueReq && venueReq.status) {
        let cca = undefined;
        if (bookingRequest.cca === 'PERSONAL') {
          cca = 'PERSONAL';
        } else {
          const ccaReq = await findCCAbyID(bookingRequest.cca);
          cca = ccaReq.msg.name;
        }

        const data = {
          id: bookingRequest.id,
          email: bookingRequest.email,
          venue: venueReq.msg.name,
          date: prettifiedDate,
          timeSlots: prettifyTiming(slotArray),
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
          const teleMSG = rejectBookingRequestMessageBuilder(data);
          await sendMessageToChannel(teleMSG);
        } catch (error) {
          console.error(error);
        }
      }

      return {
        status: true,
        error: null,
        msg: 'Successfully updated request on reject',
      };
    } else {
      return { status: false, error: 'Error in updating', msg: '' };
    }
  } else {
    return { status: false, error: 'No booking ID found', msg: '' };
  }
};

export const setCancel = async (bookingRequest, session) => {
  if (bookingRequest) {
    const update = await prisma.venueBookingRequest.update({
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
      let slotArray = convertSlotToArray(bookingRequest.timeSlots, true);
      slotArray = mapSlotToTiming(slotArray);
      const venueReq = await findVenueByID(bookingRequest.venue);
      let date = convertUnixToDate(bookingRequest.date);
      let prettifiedDate = prettifyDate(date);

      let cca = undefined;
      if (bookingRequest.cca === 'PERSONAL') {
        cca = 'PERSONAL';
      } else {
        const ccaReq = await findCCAbyID(bookingRequest.cca);
        cca = ccaReq.msg.name;
      }

      if (venueReq && venueReq.status) {
        const data = {
          id: bookingRequest.id,
          email: bookingRequest.email,
          venue: venueReq.msg.name,
          date: prettifiedDate,
          timeSlots: prettifyTiming(slotArray),
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

      return {
        status: true,
        error: null,
        msg: 'Successfully updated request on cancel',
      };
    } else {
      return { status: false, error: 'Error in updating', msg: '' };
    }
  } else {
    return { status: false, error: 'No booking ID found', msg: '' };
  }
};

export const getConflictingRequest = async (bookingRequest) => {
  let result: Result = null;
  let success = true;

  if (bookingRequest) {
    let conflicting = [];
    const sameDayVenue = await prisma.venueBookingRequest.findMany({
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
        const request = sameDayVenue[key];
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

export const setRejectConflicts = async (bookingRequest, session) => {
  let success = true;

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
      let conflicting = [];

      for (let key in sameDayVenue) {
        const request = sameDayVenue[key];
        if (isInside(bookingRequest.timeSlots, request.timeSlots)) {
          conflicting.push(request.id);
          const reject = await setReject(request, session);
          if (!reject.status) {
            console.error(reject.error);
            success = false;
          }
        }
      }

      await updateConflictingIDs(bookingRequest, conflicting);
    }

    if (success) {
      return {
        status: true,
        error: null,
        msg: 'Successfully rejected conflicting timeslots',
      };
    } else {
      return {
        status: false,
        error: 'Failed to reject conflicting timeslots',
        msg: '',
      };
    }
  } else {
    return { status: false, error: 'No booking ID found', msg: '' };
  }
};

export const updateConflictingIDs = async (bookingRequest, conflict) => {
  if (bookingRequest) {
    const update = await prisma.venueBookingRequest.update({
      where: {
        id: bookingRequest.id,
      },
      data: {
        conflictRequest: conflict.toString(),
      },
    });

    if (update) {
      return {
        status: true,
        error: null,
        msg: 'Successfully updated request on reject',
      };
    } else {
      return { status: false, error: 'Error in updating', msg: '' };
    }
  } else {
    return { status: false, error: 'No booking ID found', msg: '' };
  }
};

export const createVenueBookingRequest = async (data) => {
  try {
    const bookedTimeSlots = await prisma.venueBookingRequest.create({
      data: data,
    });

    return bookedTimeSlots;
  } catch (error) {
    return null;
  }
};

export const notifyConflicts = async (bookingRequest, session) => {
  let success = true;

  if (bookingRequest) {
    if (bookingRequest.conflictRequest) {
      let sameDayVenue = bookingRequest.conflictRequest.split(',');
      for (let key in sameDayVenue) {
        const request = sameDayVenue[key];
        const booking = await findBookingByID(request);

        const email = await notifyConflictsEmail(booking, session);
        if (!email.status) {
          console.error(email.error);
          success = false;
        }
      }
    } else {
      success = false;
    }

    if (success) {
      return {
        status: true,
        error: null,
        msg: 'Successfully notified conflicting bookings',
      };
    } else {
      return {
        status: false,
        error: 'Failed to notify conflicting bookings',
        msg: '',
      };
    }
  } else {
    return { status: false, error: 'No booking ID found', msg: '' };
  }
};

export const notifyConflictsEmail = async (bookingRequest, session) => {
  let result: Result = null;

  if (bookingRequest) {
    let slotArray = convertSlotToArray(bookingRequest.timeSlots, true);
    slotArray = mapSlotToTiming(slotArray);
    const venueReq = await findVenueByID(bookingRequest.venue);
    let date = convertUnixToDate(bookingRequest.date);
    let prettifiedDate = prettifyDate(date);

    if (venueReq && venueReq.status) {
      let cca = undefined;
      if (bookingRequest.cca === 'PERSONAL') {
        cca = 'PERSONAL';
      } else {
        const ccaReq = await findCCAbyID(bookingRequest.cca);
        cca = ccaReq.msg.name;
      }

      const data = {
        id: bookingRequest.id,
        email: bookingRequest.email,
        venue: venueReq.msg.name,
        date: prettifiedDate,
        timeSlots: prettifyTiming(slotArray),
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
