import { currentSession } from '@helper/sys/session';
import { findVenueByID, fetchChildVenue } from '@helper/sys/vbs/venue';

const handler = async (req, res) => {
  const session = await currentSession(req);

  const result = [];
  const { venue } = req.body;
  if (session) {
    if (venue) {
      try {
        const venueDB = await fetchChildVenue(venue);
        const parsedVenue = [];

        if (venueDB.status && venueDB.msg != null) {
          const childVenue = venueDB.msg;

          for (const ven of childVenue) {
            if (childVenue[ven]) {
              const venue = childVenue[ven];

              let parentVenueName = null;
              if (venue.isChildVenue) {
                const venueReq = await findVenueByID(venue.parentVenue);
                if (venueReq && venueReq.status) {
                  parentVenueName = venueReq.msg.name;
                }
              }

              const isAvailable = venue.visible ? 'Yes' : 'No';
              const cv = venue.isChildVenue ? 'Yes' : 'No';
              const instantBook = venue.isInstantBook ? 'Yes' : 'No';

              const data = {
                capacity: venue.capacity,
                description: venue.description,
                id: venue.id,
                isChildVenue: venue.isChildVenue,
                isInstantBook: venue.isInstantBook,
                name: venue.name,
                openingHours: venue.openingHours,
                parentVenue: venue.parentVenue,
                parentVenueName,
                visible: venue.visible,
                isAvailable,
                childVenue: cv,
                instantBook,
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
      }
    } else {
      res.status(200).send(result);
      res.end();
    }
  } else {
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
