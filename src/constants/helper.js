import { prisma } from "./db";
import { timingSlotNumberToTimingMapping } from "@constants/slotNumberToTimingMapping";

const convertDateToUnix = (date) => {
  return Math.floor(date.getTime() / 1000);
};

/*
export const retrieveAllLocation = async (session) => {
  if (session) {
    const locations = await prisma.venue.findMany({
      where: { visible: true },
    });

    if (locations != null) {
      return { status: true, error: null, msg: locations };
    } else {
      return { status: true, error: null, msg: "" };
    }
  } else {
    return { status: false, error: "User must be authenticated", msg: "" };
  }
};*/

export const retrieveTimeSlots = async (session, venueData, date) => {
  // Sample: 0900 - 2200
  if (session) {
    const convertedDate = convertDateToUnix(date);
    var slots = [];
    const bookedTimeSlots = await prisma.venuebooking.findMany({
      where: {venue: venueData.id, date: convertedDate}
    });

    if (bookedTimeSlots != null) {
      timingSlotNumberToTimingMapping.map((val, i) => {
        slots[i] = {id: i, slot: val, booked: false};
      })

      bookedTimeSlots.forEach((item) => {
        slots[item.timingSlot] = {id: item.timingSlot, slot: timingSlotNumberToTimingMapping[item.timingSlot], booked: true};
      });
    } else {
      timingSlotNumberToTimingMapping.map((val, i) => {
        slots[i] = {id: i, slot: val, booked: false};
      })
    }
    return slots;
  } else {
    return [];
  }
};
