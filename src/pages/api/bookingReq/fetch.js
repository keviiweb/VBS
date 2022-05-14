import { prisma } from "@constants/db";
import {
  mapSlotToTiming,
  currentSession,
  convertSlotToArray,
  convertUnixToDate,
  prettifyTiming,
  prettifyDate,
} from "@constants/helper";
import { findVenueByID } from "@constants/venue";
import { findCCAbyID } from "@constants/cca";
import { BOOKINGS } from "@constants/booking";

const handler = async (req, res) => {
  const session = currentSession();
  const query = req.query.q;

  var result = "";
  if (session) {
    if (session.user.admin) {
      try {
        let bookings = null;

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

                const data = {
                  id: book.id,
                  email: book.email,
                  venue: venue,
                  date: prettifyDate(date),
                  timeSlots: prettifyTiming(timeSlots),
                  isApproved: book.isApproved,
                  isRejected: book.isRejected,
                  isCancelled: book.isCancelled,
                  bookingID: book.bookingID,
                  purpose: book.purpose,
                  cca: cca,
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
        } else {
          result = {
            status: false,
            error: "Cannot get all bookings",
            msg: "",
          };
          res.status(200).send(result);
        }
      } catch (error) {
        console.log(error);
        result = { status: false, error: error, msg: "" };
        res.status(200).send(result);
      }
    } else {
      result = { status: false, error: "Unauthorized access", msg: "" };
      res.status(200).send(result);
    }
  } else {
    result = { status: false, error: "Unauthenticated", msg: "" };
    res.status(200).send(result);
  }
  res.end();
};

export default handler;
