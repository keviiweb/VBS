import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { BookingRequest } from 'types/vbs/bookingReq';
import { TimeSlot } from 'types/vbs/timeslot';

import {
  convertSlotToArray,
  checkerString,
  checkerArray,
} from '@constants/sys/helper';
import { convertDateToUnix } from '@constants/sys/date';

import { currentSession } from '@helper/sys/sessionServer';
import { findPendingBookingWDetails } from '@helper/sys/vbs/bookingReq';

/**
 * Check for any pending Booking Request
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

  const { venue, date, timeSlots } = req.body;
  try {
    const venueField: string = (venue as string).trim();
    const dateField: string = (date as string).trim();
    const timeSlotsField: TimeSlot[] = timeSlots as TimeSlot[];

    if (session !== undefined && session !== null) {
      if (
        checkerString(venueField) &&
        checkerString(dateField) &&
        checkerArray(timeSlotsField) &&
        timeSlotsField.length > 0
      ) {
        const convertedDate: number = convertDateToUnix(dateField);
        const slots: string = convertSlotToArray(
          timeSlotsField,
          false,
        ) as string;

        const findAllPendingBookingRes: BookingRequest[] =
          await findPendingBookingWDetails(
            venueField,
            convertedDate,
            slots,
            session,
          );

        result = { status: true, error: null, msg: findAllPendingBookingRes };
        res.status(200).send(result);
        res.end();
      } else {
        result = { status: false, error: 'Missing information', msg: '' };
        res.status(200).send(result);
        res.end();
      }
    } else {
      result = { status: false, error: 'Unauthorized', msg: '' };
      res.status(200).send(result);
      res.end();
    }
  } catch (error) {
    console.log(error);
    result = { status: false, error: 'Information of wrong type', msg: '' };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
