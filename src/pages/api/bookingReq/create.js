import {
  mapSlotToTiming,
  convertDateToUnix,
  convertSlotToArray,
  prettifyTiming,
} from "@constants/sys/helper";
import { currentSession } from "@helper/sys/session";
import { findCCAbyID, isLeader } from "@helper/sys/vbs/cca";
import {
  isConflict,
  createVenueBookingRequest,
  isApproved,
  isCancelled,
  isRejected,
  setApprove,
  setRejectConflicts,
} from "@helper/sys/vbs/bookingReq";
import { isInstantBook, isVisible } from "@helper/sys/vbs/venue";
import { sendProgressMail } from "@helper/sys/vbs/email/progress";
import { createVenueBooking } from "@helper/sys/vbs/booking";

const handler = async (req, res) => {
  const session = await currentSession(req);

  var result = "";
  const { email, venue, venueName, date, timeSlots, type, purpose } = req.body;
  if (session) {
    if (email && venue && venueName && date && timeSlots && type && purpose) {
      const convertedDate = convertDateToUnix(date);
      const slots = convertSlotToArray(timeSlots, false);
      let isSuccessful = false;
      let bookingID = null;
      let cca = undefined;

      if (type !== "PERSONAL") {
        const dbSearch = await findCCAbyID(type);
        const checkLdr = await isLeader(type, session);
        if (checkLdr.status && checkLdr.msg) {
          if (dbSearch && dbSearch.status) {
            cca = dbSearch.msg.name;
          } else {
            cca = "PERSONAL";
          }
        } else {
          result = {
            status: false,
            error: `You are not a leader for ${dbSearch.msg.name}`,
            msg: "",
          };
          res.status(200).send(result);
          res.end();
          return;
        }
      } else {
        cca = "PERSONAL";
      }

      const dataDB = {
        email: email,
        venue: venue,
        date: convertedDate,
        timeSlots: slots,
        cca: type,
        purpose: purpose,
        sessionEmail: session.user.email,
      };

      try {
        const isThereConflict = await isConflict(dataDB);
        if (isThereConflict) {
          result = {
            status: false,
            error: "Selected slots have already been booked",
            msg: "",
          };
          res.status(200).send(result);
          res.end();
          return;
        }
      } catch (error) {
        console.log(error);
        result = { status: false, error: error, msg: "" };
        res.status(200).send(result);
        res.end();
        return;
      }

      const visible = await isVisible(venue);
      if (!visible) {
        result = {
          status: false,
          error: "Venue is not available for booking",
          msg: "",
        };
        res.status(200).send(result);
        res.end();
        return;
      }

      const bookingRequest = await createVenueBookingRequest(dataDB);

      if (bookingRequest) {
        bookingID = bookingRequest.id;
      } else {
        result = {
          status: false,
          error: "Booking request not created",
          msg: "",
        };
        res.status(200).send(result);
        res.end();
        return;
      }

      // Instant Book
      const isInstantBooked = await isInstantBook(venue);
      if (isInstantBooked) {
        const isRequestApproved = await isApproved(bookingRequest);
        if (isRequestApproved) {
          result = {
            status: false,
            error: "Request already approved!",
            msg: "",
          };
          res.status(200).send(result);
          res.end();
          return;
        }

        const isRequestCancelled = await isCancelled(bookingRequest);
        if (isRequestCancelled) {
          result = {
            status: false,
            error: "Request already cancelled!",
            msg: "",
          };
          res.status(200).send(result);
          res.end();
          return;
        }

        const isRequestRejected = await isRejected(bookingRequest);
        if (isRequestRejected) {
          result = {
            status: false,
            error: "Request already rejected!",
            msg: "",
          };
          res.status(200).send(result);
          res.end();
          return;
        }

        const timeSlots = convertSlotToArray(bookingRequest.timeSlots, true);
        const createBooking = await createVenueBooking(
          bookingRequest,
          timeSlots,
          session
        );

        if (!createBooking.status) {
          result = {
            status: false,
            error: createBooking.error,
            msg: "",
          };
          res.status(200).send(result);
          res.end();
          return;
        }

        const approve = await setApprove(bookingRequest, session);
        const cancel = await setRejectConflicts(bookingRequest, session);

        if (approve.status && cancel.status) {
          isSuccessful = true;
          result = {
            status: true,
            error: null,
            msg: "Booking request created",
          };
          res.status(200).send(result);
          res.end();
        } else {
          result = {
            status: false,
            error: "Either failed to approve slot or cancel conflicting",
            msg: "",
          };
          res.status(200).send(result);
          res.end();
          return;
        }
      } else {
        isSuccessful = true;
        result = {
          status: true,
          error: null,
          msg: "Booking request created",
        };

        res.status(200).send(result);
        res.end();
      }

      if (isSuccessful && !isInstantBooked) {
        let slotArray = convertSlotToArray(slots, true);
        slotArray = mapSlotToTiming(slotArray);

        const data = {
          id: bookingID,
          email: email,
          venue: venueName,
          date: date,
          timeSlots: prettifyTiming(slotArray),
          cca: cca,
          purpose: purpose,
          sessionEmail: session.user.email,
        };

        try {
          await sendProgressMail(email, data);
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      result = { status: false, error: "Booking request not created", msg: "" };
      res.status(200).send(result);
      res.end();
      return;
    }
  } else {
    result = { status: false, error: "Booking request not created", msg: "" };
    res.status(200).send(result);
    res.end();
    return;
  }
};

export default handler;
