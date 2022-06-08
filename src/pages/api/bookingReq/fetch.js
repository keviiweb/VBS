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
  getConflictingRequest,
  findBookingByUser,
  findApprovedBooking,
  findRejectedBooking,
  findPendingBooking,
  findAllBooking,
} from '@helper/sys/vbs/bookingReq';

const handler = async (req, res) => {
  const session = await currentSession(req);
  const query = req.query.q;

  let result = '';
  if (session) {
    let bookings = null;
    if (query && query === 'USER') {
      bookings = await findBookingByUser(session);
    } else if (session.user.admin) {
      try {
        if (query) {
          if (BOOKINGS.includes(query)) {
            switch (query) {
              case 'APPROVED':
                bookings = await findApprovedBooking();
                break;
              case 'PENDING':
                bookings = await findPendingBooking();
                break;
              case 'REJECTED':
                bookings = await findRejectedBooking();
                break;
              default:
                bookings = await findPendingBooking();
                break;
            }
          }
        } else {
          bookings = await findAllBooking();
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
          );

          if (venueReq.status) {
            const venue = venueReq.msg.name;

            let cca;
            if (book.cca === 'PERSONAL') {
              cca = 'PERSONAL';
            } else {
              const ccaReq = await findCCAbyID(book.cca);
              cca = ccaReq.msg.name;
            }

            let conflicts = await getConflictingRequest(book);
            if (conflicts.status) {
              conflicts = conflicts.msg;
            } else {
              conflicts = [];
            }

            let status = null;
            const bookingDate = book.date;
            const minDay = process.env.CANCEL_MIN_DAY
              ? process.env.CANCEL_MIN_DAY
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
