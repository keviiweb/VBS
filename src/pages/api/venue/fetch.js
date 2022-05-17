import { currentSession } from "@constants/helper";
import { findVenueByID, fetchAllVenue } from "@constants/venue";

const handler = async (req, res) => {
  const session = await currentSession(req);

  let result = "";
  if (session) {
    let venues = null;
    try {
      venues = await fetchAllVenue();
    } catch (error) {
      console.log(error);
      result = { status: false, error: error, msg: "" };
      res.status(200).send(result);
      res.end();
      return;
    }

    if (venues) {
      const parsedVenue = [];
      for (let ven in venues) {
        if (venues[ven]) {
          const venue = venues[ven];

          let parentVenueName = null;
          if (venue.isChildVenue) {
            const venueReq = await findVenueByID(venue.parentVenue);
            if (venueReq && venueReq.status) {
              parentVenueName = venueReq.msg.name;
            }
          }

          const isAvailable = venue.visible ? "Yes" : "No";
          const childVenue = venue.isChildVenue ? "Yes" : "No";
          const instantBook = venue.isInstantBook ? "Yes" : "No";

          const data = {
            capacity: venue.capacity,
            description: venue.description,
            id: venue.id,
            isChildVenue: venue.isChildVenue,
            isInstantBook: venue.isInstantBook,
            name: venue.name,
            openingHours: venue.openingHours,
            parentVenue: venue.parentVenue,
            parentVenueName: parentVenueName,
            visible: venue.visible,
            isAvailable: isAvailable,
            childVenue: childVenue,
            instantBook: instantBook,
          };

          parsedVenue.push(data);
        }
      }
      result = {
        status: true,
        error: null,
        msg: parsedVenue,
      };
      res.status(200).send(result);
      res.end();
      return;
    } else {
      result = {
        status: false,
        error: "Cannot get all venues",
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
