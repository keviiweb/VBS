import type { NextApiRequest, NextApiResponse } from 'next';
import { type Result } from 'types/api';
import { type Venue } from 'types/vbs/venue';

import { currentSession } from '@helper/sys/sessionServer';
import {
  findVenueByID,
  fetchAllVenue,
  countVenue,
} from '@helper/sys/vbs/venue';

/**
 * Fetches all venues based on pagination limit and skip
 *
 * Used in:
 * /pages/sys/manage/admin/venues
 *
 * @param req NextJS API Request
 * @param res NextJS API Response
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null);

  const limitQuery = req.query.limit;
  const skipQuery = req.query.skip;

  let result: Result = {
    status: false,
    error: null,
    msg: '',
  };

  if (session !== null && session !== undefined) {
    const limit: number =
      limitQuery !== undefined ? Number(limitQuery) : 100000;
    const skip: number = skipQuery !== undefined ? Number(skipQuery) : 0;

    const venueDB: Result = await fetchAllVenue(limit, skip, session);
    const count: number = await countVenue(session);

    const parsedVenue: Venue[] = [];

    if (venueDB.status) {
      const venueData: Venue[] = venueDB.msg;
      if (count > 0) {
        for (let ven = 0; ven < venueData.length; ven += 1) {
          const venue: Venue = venueData[ven];

          let parentVenueName: string = '';
          if (venue.isChildVenue) {
            const venueReq = await findVenueByID(venue.parentVenue, session);
            if (
              venueReq.status &&
              venueReq !== null &&
              venueReq !== undefined
            ) {
              const venueReqMsg: Venue = venueReq.msg;
              parentVenueName = venueReqMsg.name;
            }
          }

          const isAvailable = venue.visible ? 'Yes' : 'No';
          const childVenue = venue.isChildVenue ? 'Yes' : 'No';
          const instantBook = venue.isInstantBook ? 'Yes' : 'No';

          const data: Venue = {
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
            childVenue,
            instantBook,
          };

          parsedVenue.push(data);
        }
      }

      result = {
        status: true,
        error: null,
        msg: { count, res: parsedVenue },
      };
      res.status(200).send(result);
      res.end();
    } else {
      result = {
        status: false,
        error: venueDB.error,
        msg: { count: 0, res: [] },
      };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = {
      status: false,
      error: 'Unauthenticated',
      msg: { count: 0, res: [] },
    };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
