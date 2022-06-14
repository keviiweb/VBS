import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';

import { currentSession } from '@helper/sys/session';
import {
  findVenueByID,
  fetchAllVenue,
  countVenue,
} from '@helper/sys/vbs/venue';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req);

  const limitQuery = req.query.limit;
  const skipQuery = req.query.skip;

  let result: Result = null;
  if (session) {
    const limit = limitQuery !== undefined ? Number(limitQuery) : 10;
    const skip = skipQuery !== undefined ? Number(skipQuery) : 0;

    const venueDB = await fetchAllVenue(limit, skip);
    const count = await countVenue();

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
        msg: { count: count, res: parsedVenue },
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
