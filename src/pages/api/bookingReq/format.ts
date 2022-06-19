import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { BookingRequest } from 'types/bookingReq';
import { CCA } from 'types/cca';
import { Venue } from 'types/venue';

import {
  mapSlotToTiming,
  convertSlotToArray,
  prettifyTiming,
} from '@constants/sys/helper';
import { convertUnixToDate, prettifyDate } from '@constants/sys/date';
import { currentSession } from '@helper/sys/session';
import { findVenueByID } from '@helper/sys/vbs/venue';
import { findCCAbyID } from '@helper/sys/vbs/cca';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req);

  const { bookings } = req.body;

  let result: Result = null;
  if (session !== undefined && session !== null && session.user.admin) {
    if (bookings !== null && bookings !== undefined) {
      const parsedBooking: BookingRequest[] = [];
      for (let booking = 0; booking < bookings.length; booking += 1) {
        if (bookings[booking]) {
          const book: BookingRequest = bookings[booking];
          const venueReq: Result = await findVenueByID(book.venue);
          const date = convertUnixToDate(book.date as number);
          const timeSlots: string[] = mapSlotToTiming(
            convertSlotToArray(book.timeSlots, true),
          ) as string[];

          if (venueReq.status) {
            const venueReqMsg: Venue = venueReq.msg;
            const venue = venueReqMsg.name;

            let cca: string = null;
            if (book.cca === 'PERSONAL') {
              cca = 'PERSONAL';
            } else {
              const ccaReq: Result = await findCCAbyID(book.cca);
              if (ccaReq.status) {
                const ccaReqMsg: CCA = ccaReq.msg;
                cca = ccaReqMsg.name;
              } else {
                console.error(ccaReq.error);
              }
            }

            let status: string = null;

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

            const data: BookingRequest = {
              id: book.id,
              email: book.email,
              venue: venue,
              dateStr: prettifyDate(date),
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

      result = {
        status: true,
        error: null,
        msg: parsedBooking,
      };
      res.status(200).send(result);
      res.end();
    }
    result = {
      status: false,
      error: 'Cannot get all bookings',
      msg: '',
    };
    res.status(200).send(result);
    res.end();
  } else {
    result = { status: false, error: 'Unauthenticated', msg: '' };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
