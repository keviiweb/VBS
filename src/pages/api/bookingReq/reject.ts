import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { BookingRequest } from 'types/vbs/bookingReq';

import { currentSession } from '@helper/sys/sessionServer';
import {
  findBookingByID,
  isApproved,
  isCancelled,
  isRejected,
  setReject,
} from '@helper/sys/vbs/bookingReq';
import { deleteVenueBooking } from '@helper/sys/vbs/booking';

import { checkerString, convertSlotToArray } from '@constants/sys/helper';
import { levels } from '@constants/sys/admin';
import { compareDate } from '@constants/sys/date';

/**
 * Rejects a venue booking request with a reason explaining why
 *
 * This is an ADMIN level or OWNER level request only.
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

  const { id, reason } = req.body;
  if (
    session !== undefined &&
    session !== null &&
    (session.user.admin === levels.ADMIN || session.user.admin === levels.OWNER)
  ) {
    if (checkerString(id) && checkerString(reason)) {
      const bookingID: string = (id as string).trim();
      const reasonField: string = (reason as string).trim();
      const bookingRequest: BookingRequest | null = await findBookingByID(
        bookingID,
        session,
      );

      if (bookingRequest !== null) {
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

        const minDay: number =
          process.env.APPROVE_MIN_DAY !== undefined
            ? Number(process.env.APPROVE_MIN_DAY)
            : 0;
        const currentDate: number = bookingRequest.date as number;

        if (isRequestApproved) {
          if (compareDate(currentDate, minDay)) {
            const timeSlots: number[] = convertSlotToArray(
              bookingRequest.timeSlots,
              true,
            ) as number[];

            const deleteBooking: Result = await deleteVenueBooking(
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
              const reject: Result = await setReject(
                bookingRequest,
                reasonField,
                session,
              );
              if (reject.status) {
                result = {
                  status: true,
                  error: null,
                  msg: reject.msg,
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
            const msg = `Rejection only possible ${minDay} day(s) before`;
            result = {
              status: false,
              error: msg,
              msg: '',
            };
            res.status(200).send(result);
            res.end();
          }
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
        } else if (compareDate(currentDate, minDay)) {
          const reject: Result = await setReject(
            bookingRequest,
            reasonField,
            session,
          );
          if (reject.status) {
            result = {
              status: true,
              error: null,
              msg: reject.msg,
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
        } else {
          const msg = `Rejection only possible ${minDay} day(s) before`;
          result = {
            status: false,
            error: msg,
            msg: '',
          };
          res.status(200).send(result);
          res.end();
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
