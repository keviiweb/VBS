import { isConflict, setApprove, setRejectConflicts } from "@constants/booking";
import { prisma } from "@constants/db";
import {
  currentSession,
  convertSlotToArray,
  mapSlotToTiming,
  prettifyTiming,
  convertUnixToDate,
  prettifyDate,
} from "@constants/helper";
import { findVenueByID } from "@constants/venue";
import { sendMail } from "@constants/email/approve";

const handler = async (req, res) => {
  const session = currentSession();

  var result = "";
  const { id } = req.body;
  if (session) {
    if (id) {
      let isSuccessful = false;
      const bookingRequest = await prisma.venueBookingRequest.findFirst({
        where: {
          id: id,
        },
      });

      if (bookingRequest) {
        const isThereConflict = await isConflict(bookingRequest);
        const timeSlots = convertSlotToArray(bookingRequest.timeSlots, true);
        if (!isThereConflict) {
          try {
            for (let i in timeSlots) {
              const insertRequest = await prisma.venueBooking.create({
                data: {
                  email: bookingRequest.email,
                  venue: bookingRequest.venue,
                  date: bookingRequest.date,
                  timingSlot: timeSlots[i],
                  cca: bookingRequest.cca,
                  purpose: bookingRequest.purpose,
                },
              });

              if (!insertRequest) {
                console.log("Approve Request - Venue Booking creation failed!");
              }
            }
          } catch (error) {
            console.log(error);
          }
        } else {
          result = {
            status: false,
            error: "Conflicts found in booking",
            msg: "",
          };
          res.status(200).send(result);
          res.end();
          return;
        }

        const approve = await setApprove(bookingRequest);
        const cancel = await setRejectConflicts(bookingRequest);

        if (approve.status && cancel.status) {
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
            error: "Either failed to approve slot or cancel conflicting",
            msg: "",
          };
          res.status(200).send(result);
        }
      } else {
        result = { status: false, error: "No booking ID found", msg: "" };
        res.status(200).send(result);
      }

      try {
        if (isSuccessful) {
          let slotArray = convertSlotToArray(bookingRequest.timeSlots, true);
          slotArray = mapSlotToTiming(slotArray);
          const venueReq = await findVenueByID(bookingRequest.venue);
          let date = convertUnixToDate(bookingRequest.date);
          date = prettifyDate(date);

          let email = bookingRequest.email;
          if (venueReq && venueReq.status) {
            const data = {
              id: bookingRequest.id,
              email: bookingRequest.email,
              venue: venueReq.msg.name,
              date: date,
              timeSlots: prettifyTiming(slotArray),
              cca: bookingRequest.cca,
              purpose: bookingRequest.purpose,
              sessionEmail: session.user.email,
            };

            //await sendMail(email, data);
          }
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      result = { status: false, error: "No booking ID found", msg: "" };
      res.status(200).send(result);
    }
  } else {
    result = { status: false, error: "Unauthenticated request", msg: "" };
    res.status(200).send(result);
  }
  res.end();
};

export default handler;
