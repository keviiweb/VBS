import { prisma } from "@constants/db";
import {
  mapSlotToTiming,
  currentSession,
  convertSlotToArray,
  convertUnixToDate,
  prettifyTiming,
  prettifyDate,
  compareDate,
} from "@constants/helper";
import { findVenueByID } from "@constants/venue";
import { findCCAbyID } from "@constants/cca";
import { BOOKINGS, getConflictingRequest } from "@constants/booking";

const handler = async (req, res) => {
  const session = currentSession();
  const query = req.query.q;

  var result = "";
  if (session) {
    let bookings = null;
    if (query && query == "USER") {
      try {
        bookings = await prisma.venueBookingRequest.findMany({
          orderBy: [
            {
              created_at: "desc",
            },
          ],
          where: {
            sessionEmail: session.user.email,
          },
        });
      } catch (error) {
        console.log(error);
        result = { status: false, error: error, msg: "" };
        res.status(200).send(result);
        res.end();
        return;
      }
    } else if (session.user.admin) {
      try {
        if (query) {
          if (BOOKINGS.includes(query)) {
            switch (query) {
              case "APPROVED":
                bookings = await prisma.venueBookingRequest.findMany({
                  orderBy: [
                    {
                      created_at: "desc",
                    },
                  ],
                  where: {
                    isApproved: true,
                    isCancelled: false,
                    isRejected: false,
                  },
                });
                break;
              case "PENDING":
                bookings = await prisma.venueBookingRequest.findMany({
                  orderBy: [
                    {
                      created_at: "desc",
                    },
                  ],
                  where: {
                    isApproved: false,
                    isCancelled: false,
                    isRejected: false,
                  },
                });
                break;
              case "REJECTED":
                bookings = await prisma.venueBookingRequest.findMany({
                  orderBy: [
                    {
                      created_at: "desc",
                    },
                  ],
                  where: {
                    isApproved: false,
                    isCancelled: false,
                    isRejected: true,
                  },
                });
                break;
            }
          }
        } else {
          bookings = await prisma.venueBookingRequest.findMany({
            orderBy: [
              {
                created_at: "desc",
              },
            ],
          });
        }
      } catch (error) {
        console.log(error);
        result = { status: false, error: error, msg: "" };
        res.status(200).send(result);
      }
    } else {
      result = { status: false, error: "Unauthorized access", msg: "" };
      res.status(200).send(result);
      res.end();
      return;
    }

    if (bookings) {
      const parsedBooking = [];
      for (let booking in bookings) {
        if (bookings[booking]) {
          const book = bookings[booking];
          const venueReq = await findVenueByID(book.venue);
          const date = convertUnixToDate(book.date);
          const timeSlots = mapSlotToTiming(
            convertSlotToArray(book.timeSlots, true)
          );

          if (venueReq.status) {
            const venue = venueReq.msg.name;

            let cca = undefined;
            if (book.cca === "PERSONAL") {
              cca = "PERSONAL";
            } else {
              const ccaReq = await findCCAbyID(book.cca);
              cca = ccaReq.msg.name;
            }

            let conflicts = await getConflictingRequest(book);
            if (conflicts.status) {
              conflicts = conflicts.msg;
            } else {
              conflicts = [];
            }

            let status = null;

            if (!book.isApproved && !book.isCancelled && !book.isRejected) {
              const bookingDate = book.date;
              if (compareDate(bookingDate, 1)) {
                status = "PENDING";
              } else {
                status = "EXPIRED";
              }
            } else if (
              book.isApproved &&
              !book.isCancelled &&
              !book.isRejected
            ) {
              status = "APPROVED";
            } else if (
              !book.isApproved &&
              book.isCancelled &&
              !book.isRejected
            ) {
              status = "CANCELLED";
            } else if (
              !book.isApproved &&
              !book.isCancelled &&
              book.isRejected
            ) {
              status = "REJECTED";
            } else {
              status = "UNKNOWN";
            }

            const data = {
              id: book.id,
              email: book.email,
              venue: venue,
              date: prettifyDate(date),
              timeSlots: prettifyTiming(timeSlots),
              isApproved: book.isApproved,
              isRejected: book.isRejected,
              isCancelled: book.isCancelled,
              purpose: book.purpose,
              cca: cca,
              conflictRequest: conflicts,
              status: status,
            };

            parsedBooking.push(data);
          }
        }
      }

      result = {
        status: true,
        error: null,
        msg: parsedBooking,
      };
      res.status(200).send(result);
      res.end();
      return;
    } else {
      result = {
        status: false,
        error: "Cannot get all bookings",
        msg: "",
      };
      res.status(200).send(result);
      res.end();
      return;
    }
  } else {
    result = { status: false, error: "Unauthenticated", msg: "" };
    res.status(200).send(result);
    res.end();
    return;
  }
};

export default handler;
