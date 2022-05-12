import { prisma } from "@constants/db";
import { timingSlotNumberToTimingMapping } from "@constants/slotNumberToTimingMapping";
import { currentSession } from "@constants/helper";

const convertDateToUnix = (date) => {
  return Math.floor(date / 1000);
};

const handler = async (req, res) => {
  const session = currentSession();

  let slots = [];
  const { venue, date } = req.body;

  if (session) {
    if (venue && date) {
      const parseDate = Date.parse(date);
      const convertedDate = convertDateToUnix(parseDate);

      try {
        const bookedTimeSlots = await prisma.VenueBooking.findMany({
          where: { venue: venue, date: convertedDate },
        });

        if (bookedTimeSlots != null) {
          for (let key in timingSlotNumberToTimingMapping) {
            if (timingSlotNumberToTimingMapping.hasOwnProperty(key)) {
              slots[key] = {
                id: Number(key),
                slot: timingSlotNumberToTimingMapping[key],
                booked: false,
              };
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
              slots[key] = {
                id: Number(key),
                slot: timingSlotNumberToTimingMapping[key],
                booked: false,
              };
            }
          }
        }

        res.status(200).send(slots);
      } catch (error) {
        console.log(error);
        res.status(200).send(slots);
      }
    } else {
      res.status(200).send(slots);
    }
  } else {
    res.status(200).send(slots);
  }

  res.end();
};

export default handler;
