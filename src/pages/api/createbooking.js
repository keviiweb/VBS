import { prisma } from "@constants/db";
import {
  mapSlotToTiming,
  currentSession,
  convertDateToUnix,
  convertSlotToArray,
} from "@constants/helper";
import { sendMail } from "@constants/inprogressemail";

const handler = async (req, res) => {
  const session = currentSession();

  var result = "";
  const { email, venue, venueName, date, timeSlots, type, purpose } = req.body;
  if (session) {
    if (email && venue && venueName && date && timeSlots && type && purpose) {
      const convertedDate = convertDateToUnix(date);
      const slots = convertSlotToArray(timeSlots, false);
      let isSuccessful = false;
      let bookingID = null;

      try {
        const bookedTimeSlots = await prisma.venueBookingRequest.create({
          data: {
            email: email,
            venue: venue,
            date: convertedDate,
            timeSlots: slots,
            cca: type,
            purpose: purpose,
            sessionEmail: session.user.email,
          },
        });

        if (bookedTimeSlots) {
          bookingID = bookedTimeSlots.id;
          isSuccessful = true;
          result = {
            status: true,
            error: null,
            msg: "Booking request created",
          };
          res.status(200).send(result);
        } else {
          result = {
            status: false,
            error: "Booking request not created",
            msg: "",
          };
          res.status(200).send(result);
        }
      } catch (error) {
        console.log(error);
        result = { status: false, error: error, msg: "" };
        res.status(200).send(result);
      }

      try {
        if (isSuccessful) {
          let slotArray = convertSlotToArray(slots, true);
          slotArray = mapSlotToTiming(slotArray);
          let str = "";
          for (let key in slotArray) {
            str += " " + slotArray[key];
          }

          const data = {
            id: bookingID,
            email: email,
            venue: venueName,
            date: date,
            timeSlots: str,
            cca: type,
            purpose: purpose,
            sessionEmail: session.user.email,
          };

          await sendMail(email, data);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      result = { status: false, error: "Booking request not created", msg: "" };
      res.status(200).send(result);
    }
  } else {
    result = { status: false, error: "Booking request not created", msg: "" };
    res.status(200).send(result);
  }
  res.end();
};

export default handler;
