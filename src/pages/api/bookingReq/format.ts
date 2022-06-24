import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { BookingRequest } from 'types/bookingReq';
import { CCA } from 'types/cca';
import { Venue } from 'types/venue';

import {
  mapSlotToTiming,
  convertSlotToArray,
  prettifyTiming,
  checkerArray,
  PERSONAL,
} from '@constants/sys/helper';
import { convertUnixToDate, prettifyDate } from '@constants/sys/date';

import { currentSession } from '@helper/sys/session';
import { findVenueByID } from '@helper/sys/vbs/venue';
import { findCCAbyID } from '@helper/sys/vbs/cca';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req);

  const { bookings } = req.body;

  let result: Result = {
    status: false,
    error: null,
    msg: '',
  };

  if (session !== undefined && session !== null && session.user.admin) {
    const parsedBooking: BookingRequest[] = [];
    const bookingsRes: BookingRequest[] = bookings as BookingRequest[];

    if (checkerArray(bookingsRes)) {
      if (bookingsRes.length > 0) {
        for (let booking = 0; booking < bookingsRes.length; booking += 1) {
          if (bookingsRes[booking]) {
            const book: BookingRequest = bookingsRes[booking];
            const venueReq: Result = await findVenueByID(book.venue);

            let date: Date | null = null;
            let timeSlots: string[] = [];

            if (book.date !== undefined) {
              date = convertUnixToDate(book.date);
              const converted = convertSlotToArray(book.timeSlots, true);
              if (converted !== null) {
                timeSlots = mapSlotToTiming(converted) as string[];
              }
            }

            if (venueReq.status) {
              const venueReqMsg: Venue = venueReq.msg;
              const venue = venueReqMsg.name;

              let cca: string = '';
              if (book.cca === PERSONAL) {
                cca = PERSONAL;
              } else {
                const ccaReq: Result = await findCCAbyID(book.cca);
                if (ccaReq.status) {
                  const ccaReqMsg: CCA = ccaReq.msg;
                  cca = ccaReqMsg.name;
                } else {
                  console.error(ccaReq.error);
                }
              }

              let status: string = '';

              if (!book.isApproved && !book.isCancelled && !book.isRejected) {
                status = 'Pending';
              } else if (
                book.isApproved &&
                !book.isCancelled &&
                !book.isRejected
              ) {
                status = 'Approved';
              } else if (
                !book.isApproved &&
                book.isCancelled &&
                !book.isRejected
              ) {
                status = 'Cancelled';
              } else if (
                !book.isApproved &&
                !book.isCancelled &&
                book.isRejected
              ) {
                status = 'Rejected';
              } else {
                status = 'Unknown';
              }

              let prettified: string = '';
              if (date !== null) {
                prettified = prettifyDate(date);
              }

              const data: BookingRequest = {
                id: book.id,
                email: book.email,
                venue: venue,
                dateStr: prettified,
                timeSlots: prettifyTiming(timeSlots),
                isApproved: book.isApproved,
                isRejected: book.isRejected,
                isCancelled: book.isCancelled,
                purpose: book.purpose,
                cca: cca,
                status: status,
              };

              parsedBooking.push(data);
            } else {
              console.error(venueReq.error);
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
    result = { status: false, error: 'Unauthenticated', msg: '' };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
