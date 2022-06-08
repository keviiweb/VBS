import { currentSession } from '@helper/sys/session';
import { findVenueByID, fetchChildVenue } from '@helper/sys/vbs/venue';

const handler = async (req, res) => {
  const session = await currentSession(req);

  let result = '';
  const { venue } = req.body;
  if (session) {
    if (venue) {
      try {
        const venueDB = await fetchChildVenue(venue);
        const parsedVenue = [];

        if (venueDB.status && venueDB.msg != null) {
          const childVenue = venueDB.msg;
          for (let ven = 0; ven < childVenue.length; ven += 1) {
            if (childVenue[ven]) {
              const venueField = childVenue[ven];

              let parentVenueName = null;
              if (venueField.isChildVenue) {
                const venueReq = await findVenueByID(venueField.parentVenue);
                if (venueReq && venueReq.status) {
                  parentVenueName = venueReq.msg.name;
                }
              }

              const isAvailable = venueField.visible ? 'Yes' : 'No';
              const cv = venueField.isChildVenue ? 'Yes' : 'No';
              const instantBook = venueField.isInstantBook ? 'Yes' : 'No';

              const data = {
                capacity: venueField.capacity,
                description: venueField.description,
                id: venueField.id,
                isChildVenue: venueField.isChildVenue,
                isInstantBook: venueField.isInstantBook,
                name: venueField.name,
                openingHours: venueField.openingHours,
                parentVenue: venueField.parentVenue,
                parentVenueName: parentVenueName,
                visible: venueField.visible,
                isAvailable: isAvailable,
                childVenue: cv,
                instantBook: instantBook,
              };

              parsedVenue.push(data);
            }
          }
        }

        result = {
          status: true,
          error: null,
          msg: parsedVenue,
        };

        res.status(200).send(result);
        res.end();
      } catch (error) {
        console.error(error);
        result = {
          status: false,
          error: error.toString(),
          msg: '',
        };
        res.status(200).send(result);
        res.end();
      }
    } else {
      result = {
        status: false,
        error: 'No parent ID provided',
        msg: '',
      };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = {
      status: false,
      error: 'Unauthenticated',
      msg: '',
    };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
