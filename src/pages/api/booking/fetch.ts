import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Venue } from 'types/vbs/venue';
import { Booking } from 'types/vbs/booking';
import { User } from 'types/misc/user';

import {
  mapSlotToTiming,
  findSlotsByID,
  checkerString,
  PERSONAL,
  splitHours,
} from '@constants/sys/helper';
import { convertUnixToDate, prettifyDate } from '@constants/sys/date';
import { actions } from '@constants/sys/admin';
import hasPermission from '@constants/sys/permission';

import { currentSession } from '@helper/sys/sessionServer';
import {
  findVenueByID,
  splitOpeningHours,
  splitHoursISO,
} from '@helper/sys/vbs/venue';
import { findCCAbyID } from '@helper/sys/cca/cca';
import { findAllBookingByVenueID } from '@helper/sys/vbs/booking';
import { fetchUserByEmail } from '@helper/sys/misc/user';

/**
 * Fetches all booking made filtered by venue ID
 *
 * This is an JCRC level or KEWEB level request only.
 *
 * Used in:
 * /pages/sys/vbs
 *
 * @param req NextJS API Request
 * @param res NextJS API Response
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null);
  const { id } = req.body;

  let result: Result = { status: false, error: '', msg: '' };
  if (session !== undefined && session !== null) {
    if (checkerString(id)) {
      const venueID: string = (id as string).trim();
      let bookings: Booking[] = [];
      if (hasPermission(session.user.admin, actions.FETCH_BOOKING)) {
        bookings = await findAllBookingByVenueID(venueID, session);

        if (
          bookings.length > 0 &&
          bookings !== undefined &&
          bookings !== null
        ) {
          const parsedBooking: Booking[] = [];
          for (let booking = 0; booking < bookings.length; booking += 1) {
            if (bookings[booking]) {
              const book: Booking = bookings[booking];
              const date: Date | null = convertUnixToDate(book.date);
              let prettifiedDate: string = '';
              if (date !== null) {
                prettifiedDate = prettifyDate(date);
              }

              let cca: string = '';
              if (book.cca === PERSONAL) {
                cca = PERSONAL;
              } else {
                const ccaReq: Result = await findCCAbyID(book.cca, session);
                if (ccaReq.status) {
                  const ccaReqMsg = ccaReq.msg;
                  cca = ccaReqMsg.name;
                } else {
                  console.error(ccaReq.error);
                }
              }

              let duplicate: boolean = false;
              for (let pB = 0; pB < parsedBooking.length; pB += 1) {
                if (parsedBooking[pB]) {
                  const parsed: Booking = parsedBooking[pB];

                  let bookedTimeSlotsISO: {
                    start: string | null;
                    end: string | null;
                  } = { start: null, end: null };

                  if (
                    parsed.email === book.email &&
                    parsed.dateStr === prettifiedDate &&
                    parsed.purpose === book.purpose &&
                    parsed.cca === cca
                  ) {
                    let bookTimeSlots: string = '';
                    let timeSplit: {
                      start: number | null;
                      end: number | null;
                    } = { start: null, end: null };

                    if (book.timingSlot !== undefined) {
                      bookTimeSlots = mapSlotToTiming(
                        book.timingSlot,
                      ) as string;
                      timeSplit = await splitHours(bookTimeSlots);
                    }

                    let parsedtimeSlots: string = '';
                    let parsedtimeSlotsSplit: {
                      start: number | null;
                      end: number | null;
                    } = { start: null, end: null };

                    if (parsed.timeSlots !== undefined) {
                      parsedtimeSlots = parsed.timeSlots;
                      parsedtimeSlotsSplit = await splitHours(parsedtimeSlots);
                    }

                    if (
                      timeSplit.start !== null &&
                      timeSplit.end !== null &&
                      parsedtimeSlotsSplit.start !== null &&
                      parsedtimeSlotsSplit.end !== null
                    ) {
                      if (timeSplit.start === parsedtimeSlotsSplit.end) {
                        duplicate = true;
                        parsed.timeSlots = `${parsedtimeSlotsSplit.start
                          .toString()
                          .padStart(4, '0')} - ${timeSplit.end
                          .toString()
                          .padStart(4, '0')}`;

                        if (date !== null) {
                          bookedTimeSlotsISO = await splitHoursISO(
                            date,
                            parsed.timeSlots,
                            session,
                          );
                        }

                        const { start, end } = bookedTimeSlotsISO;
                        if (start !== null && end !== null) {
                          parsed.start = start;
                          parsed.end = end;
                        }
                      } else if (timeSplit.end === parsedtimeSlotsSplit.start) {
                        duplicate = true;
                        parsed.timeSlots = `${timeSplit.start
                          .toString()
                          .padStart(4, '0')} - ${parsedtimeSlotsSplit.end
                          .toString()
                          .padStart(4, '0')}`;

                        if (date !== null) {
                          bookedTimeSlotsISO = await splitHoursISO(
                            date,
                            parsed.timeSlots,
                            session,
                          );
                        }

                        const { start, end } = bookedTimeSlotsISO;

                        if (start !== null && end !== null) {
                          parsed.start = start;
                          parsed.end = end;
                        }
                      }
                    }
                  }
                }
              }

              if (!duplicate) {
                const venueReq: Result = await findVenueByID(
                  book.venue,
                  session,
                );
                if (venueReq.status) {
                  const venueReqMsg: Venue = venueReq.msg;
                  const venue: string = venueReqMsg.name;

                  const openingHours = await splitOpeningHours(
                    venueReqMsg.openingHours,
                    session,
                  );

                  let startHour: string | null = '';
                  let endHour: string | null = '';
                  if (
                    openingHours.start !== null &&
                    openingHours.end !== null
                  ) {
                    startHour = await findSlotsByID(openingHours.start);
                    endHour = await findSlotsByID(openingHours.end);
                  }

                  let startH: string = '';
                  let endH: string = '';

                  if (startHour !== null && endHour !== null) {
                    startH = `${startHour
                      .toString()
                      .slice(0, 2)}:${startHour.slice(2)}:00`;
                    endH = `${endHour.toString().slice(0, 2)}:${endHour.slice(
                      2,
                    )}:00`;
                  }

                  let bookedTimeSlots: string = '';
                  if (book.timingSlot !== undefined) {
                    bookedTimeSlots = mapSlotToTiming(
                      book.timingSlot,
                    ) as string;
                  }

                  let bookedTimeSlotsISO: {
                    start: string | null;
                    end: string | null;
                  } = { start: null, end: null };

                  if (date !== null) {
                    bookedTimeSlotsISO = await splitHoursISO(
                      date,
                      bookedTimeSlots,
                      session,
                    );
                  }

                  const { start, end } = bookedTimeSlotsISO;
                  let s: string = '';
                  let e: string = '';

                  if (start !== null && end !== null) {
                    s = start;
                    e = end;
                  }

                  const userRes: Result = await fetchUserByEmail(
                    book.email,
                    session,
                  );
                  const user: User = userRes.msg;
                  let username: string = '';
                  if (user && checkerString(user.name)) {
                    username = user.name;
                  }

                  const data: Booking = {
                    id: book.id,
                    email: book.email,
                    venue,
                    date: book.date,
                    dateStr: prettifiedDate,
                    timeSlots: bookedTimeSlots,
                    purpose: book.purpose,
                    cca,
                    startHour: startH,
                    endHour: endH,
                    title: book.purpose,
                    start: s,
                    end: e,
                    userName: username,
                  };

                  parsedBooking.push(data);
                }
              }
            }
          }

          result = {
            status: true,
            error: null,
            msg: parsedBooking,
          };
          res.status(200).send(result);
          res.end();
        } else {
          result = {
            status: false,
            error: 'Cannot get all bookings',
            msg: [],
          };
          res.status(200).send(result);
          res.end();
        }
      } else {
        result = { status: false, error: 'Unauthorized access', msg: [] };
        res.status(200).send(result);
        res.end();
      }
    } else {
      result = { status: false, error: 'No booking ID found', msg: [] };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = { status: false, error: 'Unauthenticated', msg: [] };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
