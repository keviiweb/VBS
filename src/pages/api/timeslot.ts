import type { NextApiRequest, NextApiResponse } from 'next';
import { type Result } from 'types/api';
import { type Booking } from 'types/vbs/booking';
import { type TimeSlot } from 'types/vbs/timeslot';

import { checkerNumber, checkerString } from '@constants/sys/helper';
import { timingSlotNumberToTimingMapping } from '@constants/sys/timeslot';
import { convertDateToUnix } from '@constants/sys/date';

import { currentSession } from '@helper/sys/sessionServer';
import { fetchOpeningHours } from '@helper/sys/vbs/venue';
import { fetchBookedTimeSlots } from '@helper/sys/vbs/timeslot';

/**
 * Fetches the list of timeslots for a particular venue and date
 *
 * This includes booked timeslots as well
 *
 * Used in:
 * @components/sys/vbs/VenueBookingModal
 *
 * @param req NextJS API Request
 * @param res NextJS API Response
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null);

  const slots: TimeSlot[] = [];
  const { venue, date } = req.body;
  let result: Result = {
    status: false,
    error: null,
    msg: '',
  };

  if (session !== undefined && session !== null) {
    if (checkerString(venue) && checkerString(date)) {
      const venueID: string = (venue as string).trim();
      const dateID: string = (date as string).trim();

      const convertedDate: number = convertDateToUnix(dateID);
      const openingHours = await fetchOpeningHours(venueID, session);
      const startHour: number | null = openingHours.start;
      const endHour: number | null = openingHours.end;

      if (
        startHour !== null &&
        endHour !== null &&
        checkerNumber(startHour) &&
        checkerNumber(endHour)
      ) {
        const bookedTimeSlots: Result = await fetchBookedTimeSlots(
          venue,
          convertedDate,
          session,
        );

        if (bookedTimeSlots.status) {
          for (
            let key = 0;
            key < Object.keys(timingSlotNumberToTimingMapping).length;
            key += 1
          ) {
            if (
              timingSlotNumberToTimingMapping !== null &&
              timingSlotNumberToTimingMapping !== undefined &&
              (Object.prototype.hasOwnProperty.call(
                timingSlotNumberToTimingMapping,
                key,
              ) as boolean)
            ) {
              if (Number(key) >= startHour && Number(key) <= endHour) {
                slots[key] = {
                  id: Number(key),
                  slot: timingSlotNumberToTimingMapping[key],
                  booked: false,
                };
              }
            }
          }

          const timeslot = bookedTimeSlots.msg;
          timeslot.forEach((item: Booking) => {
            if (item.timingSlot !== undefined) {
              slots[item.timingSlot] = {
                id: Number(item.timingSlot),
                slot: timingSlotNumberToTimingMapping[item.timingSlot],
                booked: true,
              };
            }
          });
        } else {
          for (
            let key = 0;
            key < Object.keys(timingSlotNumberToTimingMapping).length;
            key += 1
          ) {
            if (
              timingSlotNumberToTimingMapping !== null &&
              timingSlotNumberToTimingMapping !== undefined &&
              (Object.prototype.hasOwnProperty.call(
                timingSlotNumberToTimingMapping,
                key,
              ) as boolean)
            ) {
              if (Number(key) >= startHour && Number(key) <= endHour) {
                slots[key] = {
                  id: Number(key),
                  slot: timingSlotNumberToTimingMapping[key],
                  booked: false,
                };
              }
            }
          }
        }

        result = {
          status: true,
          error: null,
          msg: slots,
        };
      } else {
        for (
          let key = 0;
          key < Object.keys(timingSlotNumberToTimingMapping).length;
          key += 1
        ) {
          if (
            timingSlotNumberToTimingMapping !== null &&
            timingSlotNumberToTimingMapping !== undefined &&
            (Object.prototype.hasOwnProperty.call(
              timingSlotNumberToTimingMapping,
              key,
            ) as boolean)
          ) {
            slots[key] = {
              id: Number(key),
              slot: timingSlotNumberToTimingMapping[key],
              booked: false,
            };
          }
        }
      }

      result = {
        status: true,
        error: null,
        msg: slots,
      };
      res.status(200).send(result);
      res.end();
    } else {
      result = {
        status: false,
        error: 'Missing information',
        msg: [],
      };

      res.status(200).send(result);
      res.end();
    }
  } else {
    result = {
      status: false,
      error: 'Unauthenticated',
      msg: [],
    };

    res.status(200).send(result);
    res.end();
  }
};

export default handler;
