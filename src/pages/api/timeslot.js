import { prisma } from "@constants/db";
import { timingSlotNumberToTimingMapping } from "@constants/slotNumberToTimingMapping";
import { currentSession, convertDateToUnix } from "@constants/helper";

const handler = async (req, res) => {
  const session = currentSession();

  let slots = [];
  const { venue, date } = req.body;

  if (session) {
    if (venue && date) {
      const convertedDate = convertDateToUnix(date);

      try {
        const bookedTimeSlots = await prisma.VenueBooking.findMany({
          where: { venue: venue, date: convertedDate },
        });

        if (bookedTimeSlots != null) {
          //TODO: add in logic for booked timeslots, disable the buttons

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
