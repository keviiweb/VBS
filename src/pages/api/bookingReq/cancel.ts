import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { BookingRequest } from 'types/bookingReq';

import {
  findBookingByID,
  isApproved,
  isCancelled,
  isRejected,
  setCancel,
  notifyConflicts,
} from '@helper/sys/vbs/bookingReq';
import { checkerString } from '@constants/sys/helper';
import { currentSession } from '@helper/sys/session';
import { compareDate } from '@constants/sys/date';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req);

  let result: Result = null;
  const { id } = req.body;
  if (session !== undefined && session !== null) {
    if (checkerString(id)) {
      const bookingRequest: BookingRequest = await findBookingByID(id);

      if (bookingRequest !== null || bookingRequest !== undefined) {
        const isRequestCancelled: boolean = await isCancelled(bookingRequest);
        const isRequestRejected: boolean = await isRejected(bookingRequest);

        if (isRequestCancelled) {
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
          const minDay: number = Number(process.env.CANCEL_MIN_DAY);
          const currentDate: number = bookingRequest.date as number;

          if (compareDate(currentDate, minDay)) {
            const isRequestApproved: boolean = await isApproved(bookingRequest);
            const reject: Result = await setCancel(bookingRequest, session);
            if (reject.status) {
              if (isRequestApproved) {
                const notifyOtherRejected: Result = await notifyConflicts(
                  bookingRequest,
                  session,
                );
                if (!notifyOtherRejected.status) {
                  result = {
                    status: false,
                    error: notifyOtherRejected.error,
                    msg: '',
                  };
                  res.status(200).send(result);
                  res.end();
                } else {
                  result = {
                    status: true,
                    error: null,
                    msg: 'Booking request rejected',
                  };
                  res.status(200).send(result);
                  res.end();
                }
              } else {
                result = {
                  status: true,
                  error: null,
                  msg: 'Booking request rejected',
                };
                res.status(200).send(result);
                res.end();
              }
            } else {
              result = {
                status: false,
                error: reject.error,
                msg: '',
              };
              res.status(200).send(result);
              res.end();
            }
          } else {
            const msg = `Cancellation only possible ${minDay} day(s) before`;
            result = {
              status: false,
              error: msg,
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
