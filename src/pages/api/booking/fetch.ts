import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Venue } from 'types/venue';
import { Booking } from 'types/booking';

import {
  mapSlotToTiming,
  findSlotsByID,
  checkerString,
} from '@constants/sys/helper';
import { convertUnixToDate, prettifyDate } from '@constants/sys/date';

import { currentSession } from '@helper/sys/session';
import {
  findVenueByID,
  splitHours,
  splitOpeningHours,
  splitHoursISO,
} from '@helper/sys/vbs/venue';
import { findCCAbyID } from '@helper/sys/vbs/cca';
import { findAllBookingByVenueID } from '@helper/sys/vbs/booking';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req);
  const { id } = req.body;

  let result: Result = { status: false, error: '', msg: '' };
  if (session !== undefined && session !== null) {
    if (checkerString(id)) {
      let bookings: Booking[] = null;
      if (session.user.admin) {
        bookings = await findAllBookingByVenueID(id);

        if (bookings !== [] && bookings !== undefined && bookings !== null) {
          const parsedBooking: Booking[] = [];
          for (let booking = 0; booking < bookings.length; booking += 1) {
            if (bookings[booking]) {
              const book: Booking = bookings[booking];
              const date: Date = convertUnixToDate(book.date);
              const prettifiedDate: string = prettifyDate(date);

              let cca: string = null;
              if (book.cca === 'PERSONAL') {
                cca = 'PERSONAL';
              } else {
                const ccaReq: Result = await findCCAbyID(book.cca);
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

                  if (
                    parsed.email === book.email &&
                    parsed.dateStr === prettifiedDate &&
                    parsed.purpose === book.purpose &&
                    parsed.cca === cca
                  ) {
                    const bookTimeSlots: string = mapSlotToTiming(
                      book.timingSlot,
                    ) as string;
                    const timeSplit = await splitHours(bookTimeSlots);

                    const parsedtimeSlots: string = parsed.timeSlots;
                    const parsedtimeSlotsSplit = await splitHours(
                      parsedtimeSlots,
                    );

                    if (timeSplit.start === parsedtimeSlotsSplit.end) {
                      duplicate = true;
                      parsed.timeSlots = `${parsedtimeSlotsSplit.start
                        .toString()
                        .padStart(4, '0')} - ${timeSplit.end
                        .toString()
                        .padStart(4, '0')}`;

                      const bookedTimeSlotsISO = await splitHoursISO(
                        date,
                        parsed.timeSlots,
                      );
                      const { start, end } = bookedTimeSlotsISO;

                      parsed.start = start;
                      parsed.end = end;
                    } else if (timeSplit.end === parsedtimeSlotsSplit.start) {
                      duplicate = true;
                      parsed.timeSlots = `${timeSplit.start
                        .toString()
                        .padStart(4, '0')} - ${parsedtimeSlotsSplit.end
                        .toString()
                        .padStart(4, '0')}`;

                      const bookedTimeSlotsISO = await splitHoursISO(
                        date,
                        parsed.timeSlots,
                      );
                      const { start, end } = bookedTimeSlotsISO;

                      parsed.start = start;
                      parsed.end = end;
                    }
                  }
                }
              }

              if (!duplicate) {
                const venueReq: Result = await findVenueByID(book.venue);
                if (venueReq.status) {
                  const venueReqMsg: Venue = venueReq.msg;
                  const venue: string = venueReqMsg.name;

                  const openingHours = await splitOpeningHours(
                    venueReqMsg.openingHours,
                  );
                  const startHour: string = await findSlotsByID(
                    openingHours.start,
                  );
                  const endHour: string = await findSlotsByID(openingHours.end);

                  const startH: string = `${startHour
                    .toString()
                    .slice(0, 2)}:${startHour.slice(2)}:00`;
                  const endH: string = `${endHour
                    .toString()
                    .slice(0, 2)}:${endHour.slice(2)}:00`;

                  const bookedTimeSlots: string = mapSlotToTiming(
                    book.timingSlot,
                  ) as string;
                  const bookedTimeSlotsISO = await splitHoursISO(
                    date,
                    bookedTimeSlots,
                  );
                  const { start, end } = bookedTimeSlotsISO;

                  const data: Booking = {
                    id: book.id,
                    email: book.email,
                    venue: venue,
                    date: book.date,
                    dateStr: prettifiedDate,
                    timeSlots: bookedTimeSlots,
                    purpose: book.purpose,
                    cca: cca,
                    startHour: startH,
                    endHour: endH,
                    title: book.purpose,
                    start: start,
                    end: end,
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
            msg: '',
          };
          res.status(200).send(result);
          res.end();
        }
      } else {
        result = { status: false, error: 'Unauthorized access', msg: '' };
        res.status(200).send(result);
        res.end();
      }
    } else {
      result = { status: false, error: 'No booking ID found', msg: '' };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = { status: false, error: 'Unauthenticated', msg: '' };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
