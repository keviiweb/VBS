import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { BookingRequest } from 'types/vbs/bookingReq';

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
import { currentSession } from '@helper/sys/sessionServer';
import { createVenueBooking } from '@helper/sys/vbs/booking';
import { actions } from '@constants/sys/admin';
import { compareDate } from '@constants/sys/date';
import hasPermission from '@constants/sys/permission';

/**
 * Approves a venue booking request
 *
 * This is an JCRC level or KEWEB level request only.
 *
 * Used in:
 * /pages/sys/manage/admin/bookings
 *
 * @param req NextJS API Request
 * @param res NextJS API Response
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null);

  let result: Result = {
    status: false,
    error: null,
    msg: '',
  };

  const { id } = req.body;
  if (
    session !== undefined &&
    session !== null &&
    hasPermission(session.user.admin, actions.MANAGE_BOOKING_REQUEST)
  ) {
    if (checkerString(id)) {
      const bookingID: string = (id as string).trim();
      const bookingRequest: BookingRequest | null = await findBookingByID(
        bookingID,
        session,
      );
      if (bookingRequest !== null && bookingRequest !== undefined) {
        const isRequestApproved: boolean = await isApproved(
          bookingRequest,
          session,
        );
        const isRequestCancelled: boolean = await isCancelled(
          bookingRequest,
          session,
        );
        const isRequestRejected: boolean = await isRejected(
          bookingRequest,
          session,
        );

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
          const minDay: number =
            process.env.APPROVE_MIN_DAY !== undefined
              ? Number(process.env.APPROVE_MIN_DAY)
              : 0;
          const currentDate: number = bookingRequest.date as number;
          if (compareDate(currentDate, minDay)) {
            const isThereConflict: boolean = await isConflict(
              bookingRequest,
              session,
            );
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
                    msg: createBooking.msg,
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
          } else {
            const msg = `Approval only possible ${minDay} day(s) before`;
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
