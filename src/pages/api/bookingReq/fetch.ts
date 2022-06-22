import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { BookingRequest } from 'types/bookingReq';
import { CCA } from 'types/cca';

import {
  mapSlotToTiming,
  convertSlotToArray,
  prettifyTiming,
  checkerString,
} from '@constants/sys/helper';
import {
  convertUnixToDate,
  compareDate,
  prettifyDate,
} from '@constants/sys/date';

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
  const query = req.query.q as string;

  const limitQuery = req.query.limit;
  const skipQuery = req.query.skip;

  let result: Result = {
    status: false,
    error: null,
    msg: '',
  };

  if (session !== undefined && session !== null) {
    let bookings: BookingRequest[] = [];
    let count: number = 0;

    const limit: number = limitQuery !== undefined ? Number(limitQuery) : 10;
    const skip: number = skipQuery !== undefined ? Number(skipQuery) : 0;
    let successBooking: boolean = false;

    if (checkerString(query) && query === 'USER') {
      count = await countBookingByUser(session);
      bookings = await findBookingByUser(session, limit, skip);

      successBooking = true;
    } else if (session.user.admin) {
      if (query !== undefined) {
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

            successBooking = true;
          }
        } else {
          count = await countAllBooking();
          bookings = await findAllBooking(limit, skip);

          successBooking = true;
        }
      } else {
        count = await countAllBooking();
        bookings = await findAllBooking(limit, skip);

        successBooking = true;
      }
    } else {
      result = { status: false, error: 'Unauthorized access', msg: '' };
      res.status(200).send(result);
      res.end();
    }

    const parsedBooking: BookingRequest[] = [];
    if (successBooking) {
      if (count > 0 && bookings !== null && bookings.length > 0) {
        for (let booking = 0; booking < bookings.length; booking += 1) {
          if (bookings[booking]) {
            const book: BookingRequest = bookings[booking];
            const venueReq: Result = await findVenueByID(book.venue);
            const date = convertUnixToDate(book.date as number);
            const slotArr: number[] = convertSlotToArray(
              book.timeSlots,
              true,
            ) as number[];
            const timeSlots: string[] = mapSlotToTiming(slotArr) as string[];

            if (venueReq.status) {
              const venue = venueReq.msg.name;

              let cca: string = '';
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

              const conflictsRequest: Result = await getConflictingRequest(
                book,
              );

              let conflicts: BookingRequest[] = [];
              if (conflictsRequest.status) {
                conflicts = conflictsRequest.msg;
              }

              let status: string = '';
              const bookingDate: number = book.date as number;
              const minDay: number = process.env.CANCEL_MIN_DAY
                ? Number(process.env.CANCEL_MIN_DAY)
                : 3;

              let success: boolean = true;

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

              let prettified: string = '';
              if (date !== null) {
                prettified = prettifyDate(date);
              }

              if (success) {
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
                  conflictRequestObj: conflicts,
                  status: status,
                  reason: book.reason,
                };

                parsedBooking.push(data);
              }
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
