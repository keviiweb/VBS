import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Booking } from 'types/booking';
import { TimeSlot } from 'types/timeslot';

import { timingSlotNumberToTimingMapping } from '@constants/sys/timeslot';
import { convertDateToUnix } from '@constants/sys/date';
import { currentSession } from '@helper/sys/session';
import { fetchOpeningHours } from '@helper/sys/vbs/venue';
import { fetchBookedTimeSlots } from '@helper/sys/vbs/timeslot';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req);

  const slots: TimeSlot[] = [];
  const { venue, date } = req.body;

  if (session !== undefined && session !== null) {
    if (
      venue !== null &&
      venue !== undefined &&
      date !== null &&
      date !== undefined
    ) {
      const convertedDate: number = convertDateToUnix(date);
      const openingHours = await fetchOpeningHours(venue);
      const startHour: number = openingHours.start;
      const endHour: number = openingHours.end;

      if (startHour !== null && endHour !== null) {
        const bookedTimeSlots: Result = await fetchBookedTimeSlots(
          venue,
          convertedDate,
        );

        if (bookedTimeSlots.status) {
          for (
            let key = 0;
            key < Object.keys(timingSlotNumberToTimingMapping).length;
            key += 1
          ) {
            if (
              Object.prototype.hasOwnProperty.call(
                timingSlotNumberToTimingMapping,
                key,
              )
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
            slots[item.timingSlot] = {
              id: Number(item.timingSlot),
              slot: timingSlotNumberToTimingMapping[item.timingSlot],
              booked: true,
            };
          });
        } else {
          for (
            let key = 0;
            key < Object.keys(timingSlotNumberToTimingMapping).length;
            key += 1
          ) {
            if (
              Object.prototype.hasOwnProperty.call(
                timingSlotNumberToTimingMapping,
                key,
              )
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

        res.status(200).send(slots);
        res.end();
      } else {
        for (
          let key = 0;
          key < Object.keys(timingSlotNumberToTimingMapping).length;
          key += 1
        ) {
          if (
            Object.prototype.hasOwnProperty.call(
              timingSlotNumberToTimingMapping,
              key,
            )
          ) {
            slots[key] = {
              id: Number(key),
              slot: timingSlotNumberToTimingMapping[key],
              booked: false,
            };
          }
        }

        res.status(200).send(slots);
        res.end();
      }
    } else {
      res.status(200).send(slots);
      res.end();
    }
  } else {
    res.status(200).send(slots);
    res.end();
  }
};

export default handler;
