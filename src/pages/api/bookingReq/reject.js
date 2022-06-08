import {
  findBookingByID,
  isApproved,
  isCancelled,
  isRejected,
  setReject,
} from '@helper/sys/vbs/bookingReq';
import { currentSession } from '@helper/sys/session';

const handler = async (req, res) => {
  const session = await currentSession(req);

  let result = '';
  const { id } = req.body;
  if (session && session.user.admin) {
    if (id) {
      const bookingRequest = await findBookingByID(id);

      if (bookingRequest) {
        const isRequestApproved = await isApproved(bookingRequest);
        if (isRequestApproved) {
          result = {
            status: false,
            error: 'Request already approved!',
            msg: '',
          };
          res.status(200).send(result);
          res.end();
          return;
        }

        const isRequestCancelled = await isCancelled(bookingRequest);
        if (isRequestCancelled) {
          result = {
            status: false,
            error: 'Request already cancelled!',
            msg: '',
          };
          res.status(200).send(result);
          res.end();
          return;
        }

        const isRequestRejected = await isRejected(bookingRequest);
        if (isRequestRejected) {
          result = {
            status: false,
            error: 'Request already rejected!',
            msg: '',
          };
          res.status(200).send(result);
          res.end();
          return;
        }

        const reject = await setReject(bookingRequest, session);
        if (reject.status) {
          result = {
            status: true,
            error: null,
            msg: 'Booking request rejected',
          };
          res.status(200).send(result);
          res.end();
        } else {
          result = {
            status: false,
            error: 'Failed to reject booking',
            msg: '',
          };
          res.status(200).send(result);
          res.end();
        }
      } else {
        result = { status: false, error: 'No booking ID found', msg: '' };
        res.status(200).send(result);
        res.end();
      }
    } else {
      result = { status: false, error: 'No booking ID found', msg: '' };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = { status: false, error: 'Unauthenticated request', msg: '' };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
