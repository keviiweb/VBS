import type { NextApiRequest, NextApiResponse } from 'next';
import { type Result } from 'types/api';
import { type BookingRequest } from 'types/vbs/bookingReq';
import { type CCA } from 'types/cca/cca';
import { type TimeSlot } from 'types/vbs/timeslot';

import {
  mapSlotToTiming,
  convertSlotToArray,
  prettifyTiming,
  checkerString,
  checkerArray,
  PERSONAL,
} from '@constants/sys/helper';
import { convertDateToUnix } from '@constants/sys/date';
import hasPermission from '@constants/sys/permission';
import { actions } from '@constants/sys/admin';

import { currentSession } from '@helper/sys/sessionServer';
import { findCCAbyID } from '@helper/sys/cca/cca';
import { isLeader } from '@helper/sys/cca/ccaRecord';
import {
  createVenueBookingRequest,
  isThereExisting,
  isConflict,
  isApproved,
  isCancelled,
  isRejected,
  setApprove,
  setRejectConflicts,
} from '@helper/sys/vbs/bookingReq';
import { isInstantBook, isVisible } from '@helper/sys/vbs/venue';
import { sendProgressMail } from '@helper/sys/vbs/email/progress';
import { createVenueBooking } from '@helper/sys/vbs/booking';

/**
 * Creates a new Venue Booking Request
 *
 * Used in:
 * @components/sys/vbs/VenueBookingModal
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

  const { venue, venueName, date, timeSlots, type, purpose } = req.body;
  try {
    const venueField: string = (venue as string).trim();
    const venueNameField: string = (venueName as string).trim();
    const dateField: string = (date as string).trim();
    const timeSlotsField: TimeSlot[] = timeSlots as TimeSlot[];
    const typeField: string = (type as string).trim();
    const purposeField: string = (purpose as string).trim();

    if (session !== undefined && session !== null) {
      if (
        checkerString(venueField) &&
        checkerString(venueNameField) &&
        checkerString(dateField) &&
        checkerArray(timeSlotsField) &&
        timeSlotsField.length > 0 &&
        checkerString(typeField) &&
        checkerString(purposeField)
      ) {
        // clean timeslots
        const timeSlotsCleaned: TimeSlot[] = [];
        for (let key = 0; key < timeSlotsField.length; key++) {
          if (
            timeSlotsField[key] !== undefined &&
            timeSlotsField[key] !== null &&
            timeSlotsField[key].id !== undefined
          ) {
            timeSlotsCleaned.push(timeSlotsField[key]);
          }
        }

        const convertedDate: number = convertDateToUnix(dateField);
        const slots: string = convertSlotToArray(
          timeSlotsCleaned,
          false,
        ) as string;

        let bookingID: string = '';
        let cca: string = '';

        let isALeader = true;
        let isBookingCreated = false;
        let isInstantBooked = false;

        if (type !== PERSONAL) {
          const dbSearch: Result = await findCCAbyID(typeField, session);
          const checkLdr: Result = await isLeader(typeField, session);

          const permission: boolean = hasPermission(
            session.user.admin,
            actions.MANAGE_BOOKING_REQUEST,
          );

          if (checkLdr.status) {
            if (dbSearch.status) {
              const ccaNameMsg: CCA = dbSearch.msg;
              cca = ccaNameMsg.name;
            } else {
              cca = PERSONAL;
            }

            if (!(checkLdr.msg as boolean)) {
              isALeader = false;
            }
          } else {
            console.error(checkLdr.error);
            isALeader = false;
          }

          isALeader = isALeader || permission;
        } else {
          cca = PERSONAL;
        }

        if (isALeader) {
          const dataDB: BookingRequest = {
            email: session.user.email,
            venue: venueField,
            date: convertedDate,
            timeSlots: slots,
            cca: typeField,
            purpose: purposeField,
            sessionEmail: session.user.email,
          };

          const isThereConflict: boolean = await isConflict(dataDB, session);
          const visible: boolean = await isVisible(venue, session);
          const isThereExistingBookingRequest = await isThereExisting(
            dataDB,
            session,
          );

          if (isThereConflict) {
            result = {
              status: false,
              error: 'Selected slots have already been booked',
              msg: '',
            };
            res.status(200).send(result);
            res.end();
          } else if (!visible) {
            result = {
              status: false,
              error: 'Venue is not available for booking',
              msg: '',
            };
            res.status(200).send(result);
            res.end();
          } else if (isThereExistingBookingRequest) {
            result = {
              status: false,
              error: 'There is already a booking in progress',
              msg: '',
            };
            res.status(200).send(result);
            res.end();
          } else {
            const bookingRequest: BookingRequest | null =
              await createVenueBookingRequest(dataDB, session);
            if (bookingRequest !== null && bookingRequest !== undefined) {
              if (bookingRequest.id !== undefined) {
                bookingID = bookingRequest.id;
                isBookingCreated = true;
              }
            }

            if (isBookingCreated && bookingRequest !== null) {
              isInstantBooked = await isInstantBook(venue, session);
              if (isInstantBooked) {
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
                  const timeSlotsNum: number[] = convertSlotToArray(
                    bookingRequest.timeSlots,
                    true,
                  ) as number[];

                  const createBooking: Result = await createVenueBooking(
                    bookingRequest,
                    timeSlotsNum,
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
                    const approve: Result = await setApprove(
                      bookingRequest,
                      session,
                    );
                    const cancel: Result = await setRejectConflicts(
                      bookingRequest,
                      session,
                    );

                    if (approve.status && cancel.status) {
                      result = {
                        status: true,
                        error: null,
                        msg: approve.msg,
                      };
                      res.status(200).send(result);
                      res.end();
                    } else {
                      result = {
                        status: false,
                        error: `${approve.error} ${cancel.error}`,
                        msg: '',
                      };
                      res.status(200).send(result);
                      res.end();
                    }
                  }
                }
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
                error: 'Booking request not created',
                msg: '',
              };

              res.status(200).send(result);
              res.end();
            }

            if (isBookingCreated && !isInstantBooked) {
              const slotArray: number[] = convertSlotToArray(
                slots,
                true,
              ) as number[];
              const slotArrayStr: string[] = mapSlotToTiming(
                slotArray,
              ) as string[];

              const data: BookingRequest = {
                id: bookingID,
                email: session.user.email,
                venue: venueNameField,
                dateStr: dateField,
                timeSlots: prettifyTiming(slotArrayStr),
                cca,
                purpose: purposeField,
                sessionEmail: session.user.email,
              };

              try {
                await sendProgressMail(session.user.email, data);
              } catch (error) {
                console.error(error);
              }
            }
          }
        } else {
          result = {
            status: false,
            error: `You are not a leader for ${cca}`,
            msg: '',
          };
          res.status(200).send(result);
          res.end();
        }
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
    console.error(error);
    result = { status: false, error: 'Information of wrong type', msg: '' };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
