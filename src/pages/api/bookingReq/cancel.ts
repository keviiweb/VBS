import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';

import {
  findBookingByID,
  isApproved,
  isCancelled,
  isRejected,
  setCancel,
  notifyConflicts,
} from '@helper/sys/vbs/bookingReq';
import { currentSession } from '@helper/sys/session';
import { compareDate } from '@constants/sys/helper';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req);

  let result: Result = null;
  const { id } = req.body;
  if (session) {
    if (id) {
      const bookingRequest = await findBookingByID(id);

      if (bookingRequest) {
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

        const minDay = Number(process.env.CANCEL_MIN_DAY);
        const currentDate = bookingRequest.date as number;

        if (compareDate(currentDate, minDay)) {
          const isRequestApproved = await isApproved(bookingRequest);
          const reject = await setCancel(bookingRequest, session);
          if (reject.status) {
            if (isRequestApproved) {
              const notifyOtherRejected = await notifyConflicts(
                bookingRequest,
                session,
              );
              if (!notifyOtherRejected.status) {
                result = {
                  status: false,
                  error: 'Failed to notify conflicting requests!',
                  msg: '',
                };
                res.status(200).send(result);
                res.end();
                return;
              }
            }

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
          const msg = `Cancellation only possible ${minDay} day(s) before`;
          result = {
            status: false,
            error: msg,
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
