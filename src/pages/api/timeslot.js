import { prisma } from "@constants/db";
import { timingSlotNumberToTimingMapping } from "@constants/timeslot";
import { currentSession, convertDateToUnix } from "@constants/helper";
import { fetchOpeningHours } from "@constants/venue";

const handler = async (req, res) => {
  const session = currentSession();

  let slots = [];
  const { venue, date } = req.body;

  if (session) {
    if (venue && date) {
      const convertedDate = convertDateToUnix(date);
      const openingHours = await fetchOpeningHours(venue);
      const startHour = openingHours.start;
      const endHour = openingHours.end;

      try {
        const bookedTimeSlots = await prisma.VenueBooking.findMany({
          where: { venue: venue, date: convertedDate },
        });

        if (bookedTimeSlots != null) {
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

          bookedTimeSlots.forEach((item) => {
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
      } catch (error) {
        console.log(error);
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
