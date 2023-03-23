import type { NextApiRequest, NextApiResponse } from 'next';
import { type Result } from 'types/api';
import { type BookingRequest } from 'types/vbs/bookingReq';
import { type CCA } from 'types/cca/cca';
import { type Venue } from 'types/vbs/venue';
import { type User } from 'types/misc/user';

import {
  mapSlotToTiming,
  convertSlotToArray,
  prettifyTiming,
  checkerArray,
  PERSONAL,
  checkerString,
} from '@constants/sys/helper';
import { convertUnixToDate, prettifyDate } from '@constants/sys/date';
import { actions } from '@constants/sys/admin';
import hasPermission from '@constants/sys/permission';

import { currentSession } from '@helper/sys/sessionServer';
import { findVenueByID } from '@helper/sys/vbs/venue';
import { findCCAbyID } from '@helper/sys/cca/cca';
import { fetchUserByEmail } from '@helper/sys/misc/user';
import { getConflictingRequest } from '@helper/sys/vbs/bookingReq';

/**
 * Formats the list of Booking Request to specific format
 *
 * This is an JCRC level or KEWEB level request only.
 *
 * Used in:
 * @components/sys/vbs/BookingModal
 *
 * @param req NextJS API Request
 * @param res NextJS API Response
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null);

  const { bookings } = req.body;

  let result: Result = {
    status: false,
    error: null,
    msg: '',
  };

  if (
    session !== undefined &&
    session !== null &&
    hasPermission(session.user.admin, actions.FETCH_BOOKING_REQUEST)
  ) {
    const parsedBooking: BookingRequest[] = [];
    const bookingsRes: BookingRequest[] = bookings as BookingRequest[];

    if (checkerArray(bookingsRes)) {
      if (bookingsRes.length > 0) {
        for (let booking = 0; booking < bookingsRes.length; booking += 1) {
          const book: BookingRequest = bookingsRes[booking];
          const venueReq: Result = await findVenueByID(book.venue, session);

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
              const ccaReq: Result = await findCCAbyID(book.cca, session);
              if (ccaReq.status) {
                const ccaReqMsg: CCA = ccaReq.msg;
                cca = ccaReqMsg.name;
              } else {
                console.error(ccaReq.error);
              }
            }

            let status: string = '';

            const isApproved: boolean =
              book.isApproved !== undefined && book.isApproved;
            const isCancelled: boolean =
              book.isCancelled !== undefined && book.isCancelled;
            const isRejected: boolean =
              book.isRejected !== undefined && book.isRejected;

            if (!isApproved && !isCancelled && !isRejected) {
              status = 'Pending';
            } else if (isApproved && !isCancelled && !isRejected) {
              status = 'Approved';
            } else if (!isApproved && isCancelled && !isRejected) {
              status = 'Cancelled';
            } else if (!isApproved && !isCancelled && isRejected) {
              status = 'Rejected';
            } else {
              status = 'Unknown';
            }

            let prettified: string = '';
            if (date !== null) {
              prettified = prettifyDate(date);
            }

            const userRes: Result = await fetchUserByEmail(book.email, session);
            const user: User = userRes.msg;
            let username: string = '';
            if (checkerString(user.name)) {
              username = user.name;
            }

            const conflictsRequest: Result = await getConflictingRequest(
              book,
              session,
            );

            let conflicts: BookingRequest[] = [];
            if (conflictsRequest.status) {
              conflicts = conflictsRequest.msg;
            }

            const data: BookingRequest = {
              id: book.id,
              email: book.email,
              venue,
              dateStr: prettified,
              timeSlots: prettifyTiming(timeSlots),
              isApproved: book.isApproved,
              isRejected: book.isRejected,
              isCancelled: book.isCancelled,
              purpose: book.purpose,
              cca,
              status,
              conflictRequestObj: conflicts,
              reason: book.reason,
              userName: username,
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
    result = { status: false, error: 'Unauthenticated', msg: [] };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
