import {
  findBookingByID,
  isConflict,
  isApproved,
  isCancelled,
  isRejected,
  setApprove,
  setRejectConflicts,
} from "@helper/sys/vbs/bookingReq";
import { convertSlotToArray } from "@constants/sys/helper";
import { currentSession } from "@helper/sys/session";
import { createVenueBooking } from "@helper/sys/vbs/booking";

const handler = async (req, res) => {
  const session = await currentSession(req);

  var result = "";
  const { id } = req.body;
  if (session && session.user.admin) {
    if (id) {
      const bookingRequest = await findBookingByID(id);

      if (bookingRequest) {
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

        const isThereConflict = await isConflict(bookingRequest);
        const timeSlots = convertSlotToArray(bookingRequest.timeSlots, true);
        if (!isThereConflict) {
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

        const approve = await setApprove(bookingRequest, session);
        const cancel = await setRejectConflicts(bookingRequest, session);

        if (approve.status && cancel.status) {
          result = {
            status: true,
            error: null,
            msg: "Booking request created",
          };
          res.status(200).send(result);
          res.end();
          return;
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
        result = { status: false, error: "No booking ID found", msg: "" };
        res.status(200).send(result);
        res.end();
        return;
      }
    } else {
      result = { status: false, error: "No booking ID found", msg: "" };
      res.status(200).send(result);
      res.end();
      return;
    }
  } else {
    result = { status: false, error: "Unauthenticated request", msg: "" };
    res.status(200).send(result);
    res.end();
    return;
  }
};

export default handler;
