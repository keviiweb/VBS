import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { BookingRequest } from 'types/vbs/bookingReq';

import { checkerString, convertSlotToArray } from '@constants/sys/helper';
import { compareDate } from '@constants/sys/date';

import {
  findBookingByID,
  isApproved,
  isCancelled,
  isRejected,
  isOwner,
  setCancel,
  notifyConflicts,
} from '@helper/sys/vbs/bookingReq';
import { currentSession } from '@helper/sys/sessionServer';
import { deleteVenueBooking } from '@helper/sys/vbs/booking';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null);

  let result: Result = {
    status: false,
    error: null,
    msg: '',
  };

  const { id } = req.body;
  if (session !== undefined && session !== null) {
    if (checkerString(id)) {
      const bookingID: string = (id as string).trim();
      const bookingRequest: BookingRequest | null = await findBookingByID(
        bookingID,
      );

      if (bookingRequest !== null && bookingRequest !== undefined) {
        const isRequestCancelled: boolean = await isCancelled(bookingRequest);
        const isRequestRejected: boolean = await isRejected(bookingRequest);
        const isRequestByOwner: boolean = await isOwner(
          bookingRequest,
          session,
        );

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
        } else if (!isRequestByOwner) {
          result = {
            status: false,
            error: 'Only the creator can cancel this request!',
            msg: '',
          };
          res.status(200).send(result);
          res.end();
        } else {
          const minDay: number = Number(process.env.CANCEL_MIN_DAY);
          const currentDate: number = bookingRequest.date as number;

          if (compareDate(currentDate, minDay)) {
            const isRequestApproved: boolean = await isApproved(bookingRequest);

            if (isRequestApproved) {
              const timeSlots: number[] = convertSlotToArray(
                bookingRequest.timeSlots,
                true,
              ) as number[];

              const deleteBooking = await deleteVenueBooking(
                bookingRequest,
                timeSlots,
                session,
              );

              if (!deleteBooking.status) {
                result = {
                  status: false,
                  error: deleteBooking.error,
                  msg: '',
                };
                res.status(200).send(result);
                res.end();
              } else {
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
                  const reject: Result = await setCancel(
                    bookingRequest,
                    session,
                  );
                  if (reject.status) {
                    result = {
                      status: true,
                      error: null,
                      msg: 'Booking request rejected - Successfully notified conflicting requests',
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
              }
            } else {
              const reject: Result = await setCancel(bookingRequest, session);
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
