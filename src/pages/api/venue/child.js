import { currentSession } from "@helper/session";
import { findVenueByID, fetchChildVenue } from "@helper/venue";

const handler = async (req, res) => {
  const session = await currentSession(req);

  let result = [];
  const { venue } = req.body;
  if (session) {
    if (venue) {
      try {
        const venueDB = await fetchChildVenue(venue);
        let parsedVenue = [];

        if (venueDB.status && venueDB.msg != null) {
          const childVenue = venueDB.msg;
          for (let ven in childVenue) {
            if (childVenue[ven]) {
              const venue = childVenue[ven];

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
        }

        res.status(200).send(parsedVenue);
        res.end();
        return;
      } catch (error) {
        console.log(error);
        res.status(200).send(result);
        res.end();
        return;
      }
    } else {
      res.status(200).send(result);
      res.end();
      return;
    }
  } else {
    res.status(200).send(result);
    res.end();
    return;
  }
};

export default handler;
