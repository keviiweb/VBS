import { timingSlotNumberToTimingMapping } from '@constants/sys/timeslot';
import { convertDateToUnix } from '@constants/sys/helper';
import { currentSession } from '@helper/sys/session';
import { fetchOpeningHours } from '@helper/sys/vbs/venue';
import { fetchBookedTimeSlots } from '@helper/sys/vbs/timeslot';

const handler = async (req, res) => {
  const session = await currentSession(req);

  const slots = [];
  const { venue, date } = req.body;

  if (session) {
    if (venue && date) {
      const convertedDate = convertDateToUnix(date);
      const openingHours = await fetchOpeningHours(venue);
      const startHour = openingHours.start;
      const endHour = openingHours.end;

      if (startHour && endHour) {
        const bookedTimeSlots = await fetchBookedTimeSlots(
          venue,
          convertedDate,
        );

        if (bookedTimeSlots && bookedTimeSlots.status) {
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
          timeslot.forEach((item) => {
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
