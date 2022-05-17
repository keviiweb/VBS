import {
  findBookingByID,
  isApproved,
  isCancelled,
  isRejected,
  setCancel,
} from "@constants/booking";
import { currentSession } from "@constants/helper";
import { compareDate } from "@constants/helper";

const handler = async (req, res) => {
  const session = await currentSession(req);

  var result = "";
  const { id } = req.body;
  if (session) {
    if (id) {
      let isSuccessful = false;
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

        const minDay = process.env.CANCEL_MIN_DAY;
        const currentDate = bookingRequest.date;

        if (compareDate(currentDate, minDay)) {
          const reject = await setCancel(bookingRequest, session);
          if (reject.status) {
            isSuccessful = true;
            result = {
              status: true,
              error: null,
              msg: "Booking request rejected",
            };
            res.status(200).send(result);
          } else {
            result = {
              status: false,
              error: "Failed to reject booking",
              msg: "",
            };
            res.status(200).send(result);
          }
        } else {
          const msg = "Cancellation only possible " + minDay + " day(s) before";
          result = {
            status: false,
            error: msg,
            msg: "",
          };
          res.status(200).send(result);
        }
      } else {
        result = { status: false, error: "No booking ID found", msg: "" };
        res.status(200).send(result);
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
