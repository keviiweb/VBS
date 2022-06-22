import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { BookingRequest } from 'types/bookingReq';

import { convertSlotToArray, checkerString } from '@constants/sys/helper';

import {
  findBookingByID,
  isConflict,
  isApproved,
  isCancelled,
  isRejected,
  setApprove,
  setRejectConflicts,
} from '@helper/sys/vbs/bookingReq';
import { currentSession } from '@helper/sys/session';
import { createVenueBooking } from '@helper/sys/vbs/booking';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req);

  let result: Result = {
    status: false,
    error: null,
    msg: '',
  };

  const { id } = req.body;
  if (session !== undefined && session !== null && session.user.admin) {
    if (checkerString(id)) {
      const bookingRequest: BookingRequest | null = await findBookingByID(id);
      if (bookingRequest !== null && bookingRequest !== undefined) {
        const isRequestApproved: boolean = await isApproved(bookingRequest);
        const isRequestCancelled: boolean = await isCancelled(bookingRequest);
        const isRequestRejected: boolean = await isRejected(bookingRequest);

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
          const isThereConflict: boolean = await isConflict(bookingRequest);
          const timeSlots: number[] = convertSlotToArray(
            bookingRequest.timeSlots,
            true,
          ) as number[];

          if (!isThereConflict) {
            const approve: Result = await setApprove(bookingRequest, session);
            const cancel: Result = await setRejectConflicts(
              bookingRequest,
              session,
            );

            if (approve.status && cancel.status) {
              const createBooking = await createVenueBooking(
                bookingRequest,
                timeSlots,
                session,
              );

              if (!createBooking.status) {
                result = {
                  status: false,
                  error: createBooking.error,
                  msg: '',
                };
                res.status(200).send(result);
                res.end();
              } else {
                result = {
                  status: true,
                  error: null,
                  msg: 'Booking request created',
                };
                res.status(200).send(result);
                res.end();
              }
            } else {
              result = {
                status: false,
                error: 'Either failed to approve slot or cancel conflicting',
                msg: '',
              };
              res.status(200).send(result);
              res.end();
            }
          } else {
            result = {
              status: false,
              error: 'Conflicts found in booking',
              msg: '',
            };
            res.status(200).send(result);
            res.end();
          }
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
