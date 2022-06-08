import {
  mapSlotToTiming,
  convertUnixToDate,
  prettifyDate,
  findSlotsByID,
} from '@constants/sys/helper';
import { currentSession } from '@helper/sys/session';
import {
  findVenueByID,
  splitHours,
  splitOpeningHours,
  splitHoursISO,
} from '@helper/sys/vbs/venue';
import { findCCAbyID } from '@helper/sys/vbs/cca';
import { findAllBookingByVenueID } from '@helper/sys/vbs/booking';

const handler = async (req, res) => {
  const session = await currentSession(req);
  const { id } = req.body;

  let result = '';
  if (session) {
    if (id) {
      let bookings = null;
      if (session.user.admin) {
        try {
          bookings = await findAllBookingByVenueID(id);
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
        for (let booking in bookings) {
          if (bookings[booking]) {
            const book = bookings[booking];
            const date = convertUnixToDate(book.date);
            const prettifiedDate = prettifyDate(date);

            let cca = undefined;
            if (book.cca === 'PERSONAL') {
              cca = 'PERSONAL';
            } else {
              const ccaReq = await findCCAbyID(book.cca);
              cca = ccaReq.msg.name;
            }

            let duplicate = false;
            for (let pB in parsedBooking) {
              if (parsedBooking[pB]) {
                const parsed = parsedBooking[pB];

                if (
                  parsed.email === book.email &&
                  parsed.date === prettifiedDate &&
                  parsed.purpose === book.purpose &&
                  parsed.cca === cca
                ) {
                  const bookTimeSlots = mapSlotToTiming(book.timingSlot);
                  const timeSplit = await splitHours(bookTimeSlots);

                  const parsedtimeSlots = parsed.timingSlot;
                  const parsedtimeSlotsSplit = await splitHours(
                    parsedtimeSlots,
                  );

                  if (timeSplit.start == parsedtimeSlotsSplit.end) {
                    duplicate = true;
                    parsed.timingSlot =
                      parsedtimeSlotsSplit.start.toString().padStart(4, '0') +
                      ' - ' +
                      timeSplit.end.toString().padStart(4, '0');

                    const bookedTimeSlotsISO = await splitHoursISO(
                      date,
                      parsed.timingSlot,
                    );
                    const start = bookedTimeSlotsISO.start;
                    const end = bookedTimeSlotsISO.end;

                    parsed.start = start;
                    parsed.end = end;
                  } else if (timeSplit.end == parsedtimeSlotsSplit.start) {
                    duplicate = true;
                    parsed.timingSlot =
                      timeSplit.start.toString().padStart(4, '0') +
                      ' - ' +
                      parsedtimeSlotsSplit.end.toString().padStart(4, '0');

                    const bookedTimeSlotsISO = await splitHoursISO(
                      date,
                      parsed.timingSlot,
                    );
                    const start = bookedTimeSlotsISO.start;
                    const end = bookedTimeSlotsISO.end;

                    parsed.start = start;
                    parsed.end = end;
                  }
                }
              }
            }

            if (!duplicate) {
              const venueReq = await findVenueByID(book.venue);
              if (venueReq.status) {
                const venue = venueReq.msg.name;

                const openingHours = await splitOpeningHours(
                  venueReq.msg.openingHours,
                );
                const startHour = await findSlotsByID(openingHours.start);
                const endHour = await findSlotsByID(openingHours.end);

                const startH =
                  startHour.toString().slice(0, 2) +
                  ':' +
                  startHour.slice(2) +
                  ':00';
                const endH =
                  endHour.toString().slice(0, 2) +
                  ':' +
                  endHour.slice(2) +
                  ':00';

                const bookedTimeSlots = mapSlotToTiming(book.timingSlot);
                const bookedTimeSlotsISO = await splitHoursISO(
                  date,
                  bookedTimeSlots,
                );
                const start = bookedTimeSlotsISO.start;
                const end = bookedTimeSlotsISO.end;

                const data = {
                  id: book.id,
                  email: book.email,
                  venue: venue,
                  date: prettifiedDate,
                  timingSlot: bookedTimeSlots,
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
        return;
      } else {
        result = {
          status: false,
          error: 'Cannot get all bookings',
          msg: '',
        };
        res.status(200).send(result);
        res.end();
        return;
      }
    } else {
      result = { status: false, error: 'No booking ID found', msg: '' };
      res.status(200).send(result);
      res.end();
      return;
    }
  } else {
    result = { status: false, error: 'Unauthenticated', msg: '' };
    res.status(200).send(result);
    res.end();
    return;
  }
};

export default handler;
