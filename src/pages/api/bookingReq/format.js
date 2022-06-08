import {
  mapSlotToTiming,
  convertSlotToArray,
  convertUnixToDate,
  prettifyTiming,
  prettifyDate,
} from '@constants/sys/helper';
import { currentSession } from '@helper/sys/session';
import { findVenueByID } from '@helper/sys/vbs/venue';
import { findCCAbyID } from '@helper/sys/vbs/cca';

const handler = async (req, res) => {
  const session = await currentSession(req);

  const { bookings } = req.body;

  let result = '';
  if (session && session.user.admin) {
    try {
      if (bookings) {
        const parsedBooking = [];

        for (const booking of bookings) {
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

              let status = null;

              if (!book.isApproved && !book.isCancelled && !book.isRejected) {
                status = 'Pending';
              } else if (
                book.isApproved
                && !book.isCancelled
                && !book.isRejected
              ) {
                status = 'Approved';
              } else if (
                !book.isApproved
                && book.isCancelled
                && !book.isRejected
              ) {
                status = 'Cancelled';
              } else if (
                !book.isApproved
                && !book.isCancelled
                && book.isRejected
              ) {
                status = 'Rejected';
              } else {
                status = 'Unknown';
              }

              const data = {
                id: book.id,
                email: book.email,
                venue,
                date: prettifyDate(date),
                timeSlots: prettifyTiming(timeSlots),
                isApproved: book.isApproved,
                isRejected: book.isRejected,
                isCancelled: book.isCancelled,
                purpose: book.purpose,
                cca,
                status,
              };

              parsedBooking.push(data);
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
        return;
      }
      result = {
        status: false,
        error: 'Cannot get all bookings',
        msg: '',
      };
      res.status(200).send(result);
      res.end();
      return;
    } catch (error) {
      console.log(error);
      result = { status: false, error, msg: '' };
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
