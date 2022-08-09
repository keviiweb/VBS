import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { BookingRequest } from 'types/vbs/bookingReq';
import { CCA } from 'types/cca/cca';
import { User } from 'types/misc/user';

import {
  mapSlotToTiming,
  convertSlotToArray,
  prettifyTiming,
  checkerString,
  PERSONAL,
} from '@constants/sys/helper';
import {
  convertUnixToDate,
  compareDate,
  prettifyDate,
} from '@constants/sys/date';
import { levels } from '@constants/sys/admin';

import { currentSession } from '@helper/sys/sessionServer';
import { findVenueByID } from '@helper/sys/vbs/venue';
import { findCCAbyID } from '@helper/sys/cca/cca';
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
import { fetchUserByEmail } from '@helper/sys/misc/user';

/**
 * Fetches the list of booking request made by the user themselves
 * together with pagination and skip
 *
 * Used in:
 * /pages/sys/manage/bookings
 * /pages/sys/manage/admin/bookings
 *
 * @param req NextJS API Request
 * @param res NextJS API Response
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null);
  let query: string | undefined;

  if (req.query.q !== undefined) {
    query = (req.query.q as string).trim();
  }

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

    const limit: number =
      limitQuery !== undefined ? Number(limitQuery) : 100000;
    const skip: number = skipQuery !== undefined ? Number(skipQuery) : 0;
    let successBooking: boolean = false;
    let sessionPresent: boolean = true;

    if (query !== undefined && checkerString(query) && query === 'USER') {
      count = await countBookingByUser(session);
      bookings = await findBookingByUser(session, limit, skip);

      successBooking = true;
    } else if (
      session.user.admin === levels.ADMIN ||
      session.user.admin === levels.OWNER
    ) {
      if (query !== undefined) {
        if (typeof query === 'string') {
          if (BOOKINGS.includes(query)) {
            switch (query) {
              case 'APPROVED':
                count = await countApprovedBooking(session);
                bookings = await findApprovedBooking(limit, skip, session);
                break;
              case 'PENDING':
                count = await countPendingBooking(session);
                bookings = await findPendingBooking(limit, skip, session);
                break;
              case 'REJECTED':
                count = await countRejectedBooking(session);
                bookings = await findRejectedBooking(limit, skip, session);
                break;
              default:
                count = await countPendingBooking(session);
                bookings = await findPendingBooking(limit, skip, session);
                break;
            }

            successBooking = true;
          } else {
            successBooking = false;
          }
        } else {
          count = await countAllBooking(session);
          bookings = await findAllBooking(limit, skip, session);

          successBooking = true;
        }
      } else {
        count = await countAllBooking(session);
        bookings = await findAllBooking(limit, skip, session);

        successBooking = true;
      }
    } else {
      successBooking = false;
      sessionPresent = false;

      result = {
        status: false,
        error: 'Unauthorized access',
        msg: { count: 0, res: [] },
      };
      res.status(200).send(result);
      res.end();
    }

    const parsedBooking: BookingRequest[] = [];
    if (successBooking && sessionPresent) {
      const minDayApproval: number =
        process.env.APPROVE_MIN_DAY !== undefined
          ? Number(process.env.APPROVE_MIN_DAY)
          : 0;

      if (count > 0 && bookings !== null && bookings.length > 0) {
        for (let booking = 0; booking < bookings.length; booking += 1) {
          if (bookings[booking]) {
            const book: BookingRequest = bookings[booking];
            const venueReq: Result = await findVenueByID(book.venue, session);
            const date = convertUnixToDate(book.date as number);
            const slotArr: number[] = convertSlotToArray(
              book.timeSlots,
              true,
            ) as number[];
            const timeSlots: string[] = mapSlotToTiming(slotArr) as string[];

            if (venueReq.status) {
              const venue = venueReq.msg.name;

              let cca: string = '';
              if (book.cca === PERSONAL) {
                cca = PERSONAL;
              } else {
                const ccaReq: Result = await findCCAbyID(book.cca, session);
                if (ccaReq.status) {
                  const ccaReqMsg: CCA = ccaReq.msg;
                  cca = ccaReqMsg.name;
                } else {
                  console.error(ccaReq.error);
                }
              }

              const conflictsRequest: Result = await getConflictingRequest(
                book,
                session,
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
              const editable: boolean = compareDate(
                bookingDate,
                minDayApproval,
              );

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
                const userRes: Result = await fetchUserByEmail(
                  book.email,
                  session,
                );
                const user: User = userRes.msg;
                let username: string = '';
                if (user && checkerString(user.name)) {
                  username = user.name;
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
                  conflictRequestObj: conflicts,
                  status: status,
                  reason: book.reason,
                  userName: username,
                  editable: editable,
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
    } else if (sessionPresent) {
      result = {
        status: false,
        error: 'Cannot get all bookings',
        msg: { count: 0, res: [] },
      };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = {
      status: false,
      error: 'Unauthenticated',
      msg: { count: 0, res: [] },
    };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
