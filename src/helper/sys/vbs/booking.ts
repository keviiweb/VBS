import { prisma } from '@constants/sys/db';
import {
  checkerNumber,
  checkerString,
  convertSlotToArray,
  findSlots,
  PERSONAL,
  splitHours,
} from '@constants/sys/helper';
import {
  addDays,
  convertDateToUnix,
  dateISO,
  fetchCurrentDate,
  locale,
} from '@constants/sys/date';

import { BookingRequest } from 'types/vbs/bookingReq';
import { Result } from 'types/api';
import { Booking } from 'types/vbs/booking';
import { Session } from 'next-auth/core/types';
import { Venue } from 'types/vbs/venue';
import { CCA } from 'types/cca/cca';

import { findVenueByName } from '@helper/sys/vbs/venue';
import { findCCAbyName } from '@helper/sys/cca/cca';

import {
  createVenueBookingRequest,
  isConflict,
  setApprove,
  setRejectConflicts,
} from '@helper/sys/vbs/bookingReq';

import { logger } from '@helper/sys/misc/logger';

/**
 * Finds all bookings filtered by the venue ID
 *
 * @param id Venue ID
 * @returns A list of bookings filtered by venue ID wrapped in a Promise
 */
export const findAllBookingByVenueID = async (
  id: string,
  session: Session,
): Promise<Booking[]> => {
  try {
    const viewingDate: number =
      process.env.VIEW_BOOKING_CALENDAR_DAY !== undefined
        ? Number(process.env.VIEW_BOOKING_CALENDAR_DAY)
        : 0;
    let bookings: Booking[] = [];

    if (checkerNumber(viewingDate)) {
      const currentDate: Date = fetchCurrentDate();

      const newStart: Date = addDays(currentDate, locale, -Number(viewingDate));
      const newEnd: Date = addDays(currentDate, locale, Number(viewingDate));

      const newStartTime: number = convertDateToUnix(dateISO(newStart));
      const newEndTime: number = convertDateToUnix(dateISO(newEnd));

      bookings = await prisma.venueBooking.findMany({
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
          AND: [
            {
              date: {
                lte: newEndTime,
              },
            },
            {
              date: {
                gte: newStartTime,
              },
            },
          ],
        },
      });
    } else {
      bookings = await prisma.venueBooking.findMany({
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
    }

    return bookings;
  } catch (error) {
    console.error(error);
    await logger('findAllBookingByVenueID', session.user.email, error.message);
    return [];
  }
};

/**
 * Create a Venue Booking
 *
 * @param bookingRequest BookingRequest Object
 * @param timeSlots An array of numbers containing the timeslots
 * @param session Next-Auth Session object
 * @returns A Result containing the status wrapped in a Promise
 */
export const createVenueBooking = async (
  bookingRequest: BookingRequest,
  timeSlots: number[],
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  let success = true;
  try {
    for (const i in timeSlots) {
      const insertRequest: Booking = await prisma.venueBooking.create({
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

      if (insertRequest === null || insertRequest === undefined) {
        await logger(
          'createVenueBooking',
          session.user.email,
          'Approve Request - Venue Booking creation failed!',
        );
        console.error('Approve Request - Venue Booking creation failed!');
        success = false;
        result = {
          status: false,
          error: 'Error in creating venue booking',
          msg: '',
        };
      }
    }

    if (success) {
      await logger(
        'createVenueBooking',
        session.user.email,
        'Successfully created bookings',
      );

      result = {
        status: true,
        error: '',
        msg: 'Successfully created bookings',
      };
    }
  } catch (error) {
    console.error(error);
    result = {
      status: false,
      error: 'Error in creating venue booking',
      msg: '',
    };
    await logger('createVenueBooking', session.user.email, error.message);
  }

  return result;
};

/**
 * Deletes a Venue Booking filtered by the bookingRequest details and timeSlots
 *
 * @param bookingRequest BookingRequest Object
 * @param timeSlots An array of numbers containing the timeslots
 * @returns A Result containing the status wrapped in a Promise
 */
export const deleteVenueBooking = async (
  bookingRequest: BookingRequest,
  timeSlots: number[],
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  let success = true;
  try {
    for (const i in timeSlots) {
      const deleteRequest: Booking = await prisma.venueBooking.deleteMany({
        where: {
          email: bookingRequest.email,
          venue: bookingRequest.venue,
          date: bookingRequest.date,
          timingSlot: timeSlots[i],
          cca: bookingRequest.cca,
          purpose: bookingRequest.purpose,
        },
      });

      if (deleteRequest === null || deleteRequest === undefined) {
        await logger(
          'deleteVenueBooking',
          session.user.email,
          'Cancel Request - Venue Booking deletion failed!',
        );
        console.error('Cancel Request - Venue Booking deletion failed!');
        success = false;
        result = {
          status: false,
          error: 'Error in deleting venue booking',
          msg: '',
        };
      }
    }

    if (success) {
      await logger(
        'deleteVenueBooking',
        session.user.email,
        'Successfully deleted bookings',
      );
      result = {
        status: true,
        error: '',
        msg: 'Successfully deleted bookings',
      };
    }
  } catch (error) {
    console.error(error);
    result = {
      status: false,
      error: 'Error in creating venue booking',
      msg: '',
    };
    await logger('deleteVenueBooking', session.user.email, error.message);
  }

  return result;
};

/**
 * Populates the list of bookings read from a CSV file
 *
 * 1. The specific Booking record is fetched
 * 2. If the record is available, throw Error
 * 3. If the record cannot be found, a new record is created.
 *
 * @param dataField File content
 * @returns A Result containing the status wrapped in a Promise
 */
export const createRecurringBooking = async (
  dataField: any[],
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  let totalCount: number = 0;
  let count: number = 0;
  let success: boolean = true;
  let errorMsg: string = '';

  try {
    for (let key = 0; key < dataField.length; key += 1) {
      const data = dataField[key];
      totalCount += 1;

      const email: string = data.email !== undefined ? data.email : '';
      const venueName: string =
        data.venueName !== undefined ? data.venueName : '';
      const dateStr: string = data.date !== undefined ? data.date : '';
      const cca: string = data.cca !== undefined ? data.cca : PERSONAL;
      const timeSlot: string = data.timeSlot !== undefined ? data.timeSlot : '';
      const purpose: string = data.purpose !== undefined ? data.purpose : '';

      if (
        checkerString(email) &&
        checkerString(venueName) &&
        checkerString(dateStr) &&
        checkerString(cca) &&
        checkerString(timeSlot) &&
        checkerString(purpose)
      ) {
        const venueDetailsRes: Result = await findVenueByName(
          venueName,
          session,
        );
        if (venueDetailsRes.status && venueDetailsRes.msg !== null) {
          const venueDetails: Venue = venueDetailsRes.msg;
          let successCCA: boolean = true;

          if (venueDetails.id !== undefined) {
            const venueID: string = venueDetails.id;
            let ccaID: string = '';

            if (cca !== PERSONAL) {
              const ccaDetailsRes: Result = await findCCAbyName(cca, session);
              if (!ccaDetailsRes.status || ccaDetailsRes.msg === null) {
                success = false;
                successCCA = false;
                errorMsg += `Invalid CCA detected for ${email} ${venueName} ${dateStr} ${cca} ${timeSlot} ${purpose} \n\n`;
              } else {
                const ccaDetails: CCA = ccaDetailsRes.msg;
                if (ccaDetails.id !== undefined) {
                  ccaID = ccaDetails.id;
                }
              }
            } else {
              ccaID = PERSONAL;
            }

            const { start, end } = await splitHours(timeSlot);
            if (start !== null && end !== null) {
              const startTiming: string = start.toString().padStart(4, '0');
              const timeSlotID: string | null = await findSlots(
                startTiming,
                true,
              );

              const endTiming: string = end.toString().padStart(4, '0');
              const timeSlotIDEnd: string | null = await findSlots(
                endTiming,
                false,
              );

              if (
                timeSlotID !== null &&
                timeSlotIDEnd !== null &&
                timeSlotID === timeSlotIDEnd
              ) {
                const dateTiming: number = convertDateToUnix(dateStr);

                if (timeSlotID !== null && dateTiming !== 0) {
                  if (successCCA) {
                    const dataDB: BookingRequest = {
                      email: email.trim(),
                      venue: venueID.trim(),
                      date: dateTiming,
                      cca: ccaID.trim(),
                      timeSlots: timeSlotID.trim(),
                      purpose: purpose.trim(),
                      sessionEmail: session.user.email,
                    };

                    const isThereConflict: boolean = await isConflict(
                      dataDB,
                      session,
                    );
                    if (!isThereConflict) {
                      const bookingRequest: BookingRequest | null =
                        await createVenueBookingRequest(dataDB, session);
                      if (
                        bookingRequest !== null &&
                        bookingRequest !== undefined
                      ) {
                        if (bookingRequest.id !== undefined) {
                          const timeSlotsNum: number[] = convertSlotToArray(
                            bookingRequest.timeSlots,
                            true,
                          ) as number[];

                          const createBooking: Result =
                            await createVenueBooking(
                              bookingRequest,
                              timeSlotsNum,
                              session,
                            );

                          if (!createBooking.status) {
                            errorMsg += `Creating booking error detected for ${email} ${venueName} ${dateStr} ${cca} ${timeSlot} ${purpose} \n\n`;
                            success = false;
                          } else {
                            const approve: Result = await setApprove(
                              bookingRequest,
                              session,
                            );

                            const cancel: Result = await setRejectConflicts(
                              bookingRequest,
                              session,
                            );

                            if (!approve.status || !cancel.status) {
                              errorMsg += `Approval/ Cancellation booking error detected for ${email} ${venueName} ${dateStr} ${cca} ${timeSlot} ${purpose} \n\n`;
                              success = false;
                            } else {
                              count += 1;
                            }
                          }
                        }
                      } else {
                        errorMsg += `Booking request not created for ${email} ${venueName} ${dateStr} ${cca} ${timeSlot} ${purpose} \n\n`;
                        success = false;
                      }
                    } else {
                      errorMsg += `Conflict booking detected for ${email} ${venueName} ${dateStr} ${cca} ${timeSlot} ${purpose} \n\n`;
                      success = false;
                    }
                  }
                } else {
                  errorMsg += `Invalid date format for ${email} ${venueName} ${dateStr} ${cca} ${timeSlot} ${purpose} \n\n`;
                  success = false;
                }
              } else {
                errorMsg += `Please ensure you book 1 slot at a time for ${email} ${venueName} ${dateStr} ${cca} ${timeSlot} ${purpose} \n\n`;
                success = false;
              }
            } else {
              errorMsg += `Invalid timeslot detected for ${email} ${venueName} ${dateStr} ${cca} ${timeSlot} ${purpose} \n\n`;
              success = false;
            }
          }
        } else {
          errorMsg += `Invalid venue name detected for ${email} ${venueName} ${dateStr} ${cca} ${timeSlot} ${purpose} \n\n`;
          success = false;
        }
      } else {
        errorMsg += `Incomplete information detected for ${email} ${venueName} ${dateStr} ${cca} ${timeSlot} ${purpose} \n\n`;
        success = false;
      }
    }

    if (success) {
      await logger(
        'createRecurringBooking',
        session.user.email,
        `Successfully created ${count} bookings out of total ${totalCount}`,
      );
      result = {
        status: true,
        error: null,
        msg: `Successfully created ${count} bookings out of total ${totalCount}`,
      };
    } else {
      await logger('createRecurringBooking', session.user.email, errorMsg);
      result = {
        status: false,
        error: errorMsg,
        msg: null,
      };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to create bookings', msg: '' };
    await logger('createRecurringBooking', session.user.email, error.message);
  }
  return result;
};

/**
 * Deletes all Bookings
 *
 * @param session Next-Auth Session object
 * @returns A Result containing the status wrapped in a Promise
 */
export const deleteAllVenueBooking = async (
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    await prisma.venueBooking.deleteMany({});
    await logger(
      'deleteAllVenueBooking',
      session.user.email,
      'Successfully deleted all booking!',
    );
    result = {
      status: true,
      error: '',
      msg: 'Successfully deleted all booking!',
    };
  } catch (error) {
    console.error(error);
    result = {
      status: false,
      error: 'Error in deleting all venue booking',
      msg: '',
    };
    await logger('deleteAllVenueBooking', session.user.email, error.message);
  }

  return result;
};

/**
 * Deletes all Bookings by Venue ID
 *
 * @param session Next-Auth Session object
 * @returns A Result containing the status wrapped in a Promise
 */
export const deleteAllVenueBookingByVenueID = async (
  id: string,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    await prisma.venueBooking.deleteMany({
      where: {
        venue: id,
      },
    });
    await logger(
      'deleteAllVenueBookingByVenueID',
      session.user.email,
      'Successfully deleted all booking!',
    );
    result = {
      status: true,
      error: '',
      msg: 'Successfully deleted all booking!',
    };
  } catch (error) {
    console.error(error);
    result = {
      status: false,
      error: 'Error in deleting all venue booking',
      msg: '',
    };
    await logger(
      'deleteAllVenueBookingByVenueID',
      session.user.email,
      error.message,
    );
  }

  return result;
};
