import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { BookingRequest } from 'types/bookingReq';
import { CCA } from 'types/cca';
import { TimeSlot } from 'types/timeslot';

import {
  mapSlotToTiming,
  convertSlotToArray,
  prettifyTiming,
  checkerString,
  checkerArray,
  PERSONAL,
} from '@constants/sys/helper';
import { convertDateToUnix } from '@constants/sys/date';

import { currentSession } from '@helper/sys/session';
import { findCCAbyID, isLeader } from '@helper/sys/vbs/cca';
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

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req);

  let result: Result = {
    status: false,
    error: null,
    msg: '',
  };

  const { email, venue, venueName, date, timeSlots, type, purpose } = req.body;
  try {
    const emailField: string = email as string;
    const venueField: string = venue as string;
    const venueNameField: string = venueName as string;
    const dateField: string = date as string;
    const timeSlotsField: TimeSlot[] = timeSlots as TimeSlot[];
    const typeField: string = type as string;
    const purposeField: string = purpose as string;

    if (session !== undefined && session !== null) {
      if (
        checkerString(emailField) &&
        checkerString(venueField) &&
        checkerString(venueNameField) &&
        checkerString(dateField) &&
        checkerArray(timeSlotsField) &&
        timeSlotsField.length > 0 &&
        checkerString(typeField) &&
        checkerString(purposeField)
      ) {
        const convertedDate: number = convertDateToUnix(dateField);
        const slots: string = convertSlotToArray(
          timeSlotsField,
          false,
        ) as string;

        let bookingID: string = '';
        let cca: string = '';

        let isALeader = true;
        let isBookingCreated = false;
        let isInstantBooked = false;

        if (type !== PERSONAL) {
          const dbSearch: Result = await findCCAbyID(typeField);
          const checkLdr: Result = await isLeader(typeField, session);

          if (checkLdr.status) {
            if (dbSearch && dbSearch.status) {
              const ccaNameMsg: CCA = dbSearch.msg;
              cca = ccaNameMsg.name;
            } else {
              cca = PERSONAL;
            }

            if (!checkLdr.msg) {
              isALeader = false;
            }
          } else {
            console.error(checkLdr.error);
            isALeader = false;
          }
        } else {
          cca = PERSONAL;
        }

        if (isALeader) {
          const dataDB: BookingRequest = {
            email: emailField,
            venue: venueField,
            date: convertedDate,
            timeSlots: slots,
            cca: typeField,
            purpose: purposeField,
            sessionEmail: session.user.email,
          };

          const isThereConflict: boolean = await isConflict(dataDB);
          const visible: boolean = await isVisible(venue);
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
              await createVenueBookingRequest(dataDB);
            if (bookingRequest !== null && bookingRequest !== undefined) {
              if (bookingRequest.id !== undefined) {
                bookingID = bookingRequest.id;
                isBookingCreated = true;
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

            if (isBookingCreated && bookingRequest !== null) {
              isInstantBooked = await isInstantBook(venue);
              if (isInstantBooked) {
                const isRequestApproved: boolean = await isApproved(
                  bookingRequest,
                );
                const isRequestCancelled: boolean = await isCancelled(
                  bookingRequest,
                );
                const isRequestRejected: boolean = await isRejected(
                  bookingRequest,
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
                        msg: 'Booking request created',
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
                email: email,
                venue: venueName,
                dateStr: date,
                timeSlots: prettifyTiming(slotArrayStr),
                cca: cca,
                purpose: purpose,
                sessionEmail: session.user.email,
              };

              try {
                await sendProgressMail(email, data);
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
    console.log(error);
    result = { status: false, error: 'Information of wrong type', msg: '' };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
