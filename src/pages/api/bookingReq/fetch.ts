import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';

import {
  mapSlotToTiming,
  convertSlotToArray,
  convertUnixToDate,
  prettifyTiming,
  prettifyDate,
  compareDate,
} from '@constants/sys/helper';
import { currentSession } from '@helper/sys/session';
import { findVenueByID } from '@helper/sys/vbs/venue';
import { findCCAbyID } from '@helper/sys/vbs/cca';
import {
  BOOKINGS,
  countAllBooking,
  countApprovedBooking,
  countRejectedBooking,
  countPendingBooking,
  countBookingByUser,
  getConflictingRequest,
  findBookingByUser,
  findApprovedBooking,
  findRejectedBooking,
  findPendingBooking,
  findAllBooking,
} from '@helper/sys/vbs/bookingReq';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req);
  const query = req.query.q;

  const limitQuery = req.query.limit;
  const skipQuery = req.query.skip;

  let result: Result = null;
  if (session) {
    let bookings = null;
    let count = 0;

    const limit = limitQuery !== undefined ? Number(limitQuery) : 10;
    const skip = skipQuery !== undefined ? Number(skipQuery) : 0;

    if (query && query === 'USER') {
      count = await countBookingByUser(session);
      bookings = await findBookingByUser(session, limit, skip);
    } else if (session.user.admin) {
      try {
        if (query) {
          if (typeof query === 'string') {
            if (BOOKINGS.includes(query)) {
              switch (query) {
                case 'APPROVED':
                  count = await countApprovedBooking();
                  bookings = await findApprovedBooking(limit, skip);
                  break;
                case 'PENDING':
                  count = await countPendingBooking();
                  bookings = await findPendingBooking(limit, skip);
                  break;
                case 'REJECTED':
                  count = await countRejectedBooking();
                  bookings = await findRejectedBooking(limit, skip);
                  break;
                default:
                  count = await countPendingBooking();
                  bookings = await findPendingBooking(limit, skip);
                  break;
              }
            }
          } else {
            count = await countAllBooking();
            bookings = await findAllBooking(limit, skip);
          }
        } else {
          count = await countAllBooking();
          bookings = await findAllBooking(limit, skip);
        }
      } catch (error) {
        console.log(error);
        result = { status: false, error: error, msg: '' };
        res.status(200).send(result);
        res.end();
        return;
      }
    } else {
      result = { status: false, error: 'Unauthorized access', msg: '' };
      res.status(200).send(result);
      res.end();
      return;
    }

    if (bookings) {
      const parsedBooking = [];
      for (let booking = 0; booking < bookings.length; booking += 1) {
        if (bookings[booking]) {
          const book = bookings[booking];
          const venueReq = await findVenueByID(book.venue);
          const date = convertUnixToDate(book.date);
          const timeSlots = mapSlotToTiming(
            convertSlotToArray(book.timeSlots, true),
          ) as string[];

          if (venueReq.status) {
            const venue = venueReq.msg.name;

            let cca;
            if (book.cca === 'PERSONAL') {
              cca = 'PERSONAL';
            } else {
              const ccaReq = await findCCAbyID(book.cca);
              cca = ccaReq.msg.name;
            }

            const conflictsRequest = await getConflictingRequest(book);
            let conflicts = [];
            if (conflictsRequest.status) {
              conflicts = conflictsRequest.msg;
            }

            let status = null;
            const bookingDate = book.date;
            const minDay = process.env.CANCEL_MIN_DAY
              ? Number(process.env.CANCEL_MIN_DAY)
              : 3;

            let success = true;

            if (!book.isApproved && !book.isCancelled && !book.isRejected) {
              status = 'PENDING';
              if (!compareDate(bookingDate, minDay)) {
                if (query && query === 'USER') {
                  status = 'EXPIRED';
                } else {
                  success = false;
                }
              }
            } else if (
              book.isApproved &&
              !book.isCancelled &&
              !book.isRejected
            ) {
              status = 'APPROVED';
            } else if (
              !book.isApproved &&
              book.isCancelled &&
              !book.isRejected
            ) {
              status = 'CANCELLED';
            } else if (
              !book.isApproved &&
              !book.isCancelled &&
              book.isRejected
            ) {
              status = 'REJECTED';
            } else {
              status = 'UNKNOWN';
            }

            if (success) {
              const data = {
                id: book.id,
                email: book.email,
                venue: venue,
                date: prettifyDate(date),
                timeSlots: prettifyTiming(timeSlots),
                isApproved: book.isApproved,
                isRejected: book.isRejected,
                isCancelled: book.isCancelled,
                purpose: book.purpose,
                cca: cca,
                conflictRequest: conflicts,
                status: status,
              };

              parsedBooking.push(data);
            }
          }
        }
      }

      result = {
        status: true,
        error: null,
        msg: { count: count, res: parsedBooking },
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
