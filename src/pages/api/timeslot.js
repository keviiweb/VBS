import { timingSlotNumberToTimingMapping } from "@constants/timeslot";
import { convertDateToUnix } from "@constants/helper";
import { currentSession } from "@helper/session";
import { fetchOpeningHours } from "@helper/venue";
import { fetchBookedTimeSlots } from "@helper/timeslot";

const handler = async (req, res) => {
  const session = await currentSession(req);

  let slots = [];
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
          convertedDate
        );

        if (bookedTimeSlots && bookedTimeSlots.status) {
          for (let key in timingSlotNumberToTimingMapping) {
            if (timingSlotNumberToTimingMapping.hasOwnProperty(key)) {
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
          for (let key in timingSlotNumberToTimingMapping) {
            if (timingSlotNumberToTimingMapping.hasOwnProperty(key)) {
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
        return;
      } else {
        for (let key in timingSlotNumberToTimingMapping) {
          if (timingSlotNumberToTimingMapping.hasOwnProperty(key)) {
            slots[key] = {
              id: Number(key),
              slot: timingSlotNumberToTimingMapping[key],
              booked: false,
            };
          }
        }

        res.status(200).send(slots);
        res.end();
        return;
      }
    } else {
      res.status(200).send(slots);
      res.end();
      return;
    }
  } else {
    res.status(200).send(slots);
    res.end();
    return;
  }
};

export default handler;
