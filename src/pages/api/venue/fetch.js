import { currentSession } from '@helper/sys/session';
import { findVenueByID, fetchAllVenue } from '@helper/sys/vbs/venue';

const handler = async (req, res) => {
  const session = await currentSession(req);

  let result = '';
  if (session) {
    const venueDB = await fetchAllVenue();
    const parsedVenue = [];

    if (venueDB && venueDB.status) {
      const venueData = venueDB.msg;
      for (let ven = 0; ven < venueData.length; ven += 1) {
        if (venueData[ven]) {
          const venue = venueData[ven];

          let parentVenueName = null;
          if (venue.isChildVenue) {
            const venueReq = await findVenueByID(venue.parentVenue);
            if (venueReq && venueReq.status) {
              parentVenueName = venueReq.msg.name;
            }
          }

          const isAvailable = venue.visible ? 'Yes' : 'No';
          const childVenue = venue.isChildVenue ? 'Yes' : 'No';
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
    } else {
      result = {
        status: false,
        error: 'Cannot get all venues',
        msg: '',
      };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = { status: false, error: 'Unauthenticated', msg: '' };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
