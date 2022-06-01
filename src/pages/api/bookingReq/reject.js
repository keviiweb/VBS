import {
  findBookingByID,
  isApproved,
  isCancelled,
  isRejected,
  setReject,
} from "@helper/bookingReq";
import { currentSession } from "@helper/session";

const handler = async (req, res) => {
  const session = await currentSession(req);

  var result = "";
  const { id } = req.body;
  if (session && session.user.admin) {
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

        const reject = await setReject(bookingRequest, session);
        if (reject.status) {
          isSuccessful = true;
          result = {
            status: true,
            error: null,
            msg: "Booking request rejected",
          };
          res.status(200).send(result);
          res.end();
          return;
        } else {
          result = {
            status: false,
            error: "Failed to reject booking",
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
