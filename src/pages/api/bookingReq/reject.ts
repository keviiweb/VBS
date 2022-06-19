import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { BookingRequest } from 'types/bookingReq';

import {
  findBookingByID,
  isApproved,
  isCancelled,
  isRejected,
  setReject,
} from '@helper/sys/vbs/bookingReq';
import { currentSession } from '@helper/sys/session';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req);

  let result: Result = null;
  const { id } = req.body;
  if (session !== undefined && session !== null && session.user.admin) {
    if (id !== undefined && id !== null) {
      const bookingRequest: BookingRequest = await findBookingByID(id);

      if (bookingRequest) {
        const isRequestApproved = await isApproved(bookingRequest);
        const isRequestCancelled = await isCancelled(bookingRequest);
        const isRequestRejected = await isRejected(bookingRequest);

        if (isRequestApproved) {
          result = {
            status: false,
            error: 'Request already approved!',
            msg: '',
          };
          res.status(200).send(result);
          res.end();
        } else if (isRequestCancelled) {
          result = {
            status: false,
            error: 'Request already cancelled!',
            msg: '',
          };
          res.status(200).send(result);
          res.end();
        } else if (isRequestRejected) {
          result = {
            status: false,
            error: 'Request already rejected!',
            msg: '',
          };
          res.status(200).send(result);
          res.end();
        } else {
          const reject: Result = await setReject(bookingRequest, session);
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
              error: reject.error,
              msg: '',
            };
            res.status(200).send(result);
            res.end();
          }
        }
      } else {
        result = { status: false, error: 'No booking found', msg: '' };
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
