import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Venue } from 'types/venue';

import { currentSession } from '@helper/sys/session';
import { findVenueByID, fetchChildVenue } from '@helper/sys/vbs/venue';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req);

  let result: Result = null;
  const { venue } = req.body;
  if (session !== undefined && session !== null) {
    if (venue !== undefined && venue !== null) {
      const venueDB: Result = await fetchChildVenue(venue);
      const parsedVenue: Venue[] = [];

      if (venueDB.status) {
        const childVenue = venueDB.msg;
        for (let ven = 0; ven < childVenue.length; ven += 1) {
          if (childVenue[ven]) {
            const venueField: Venue = childVenue[ven];

            let parentVenueName: string = null;
            if (venueField.isChildVenue) {
              const venueReq: Result = await findVenueByID(
                venueField.parentVenue,
              );
              if (venueReq && venueReq.status) {
                const venueReqMsg: Venue = venueReq.msg;
                parentVenueName = venueReqMsg.name;
              }
            }

            const isAvailable = venueField.visible ? 'Yes' : 'No';
            const cv = venueField.isChildVenue ? 'Yes' : 'No';
            const instantBook = venueField.isInstantBook ? 'Yes' : 'No';

            const data: Venue = {
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

        result = {
          status: true,
          error: null,
          msg: parsedVenue,
        };
      } else {
        result = {
          status: false,
          error: venueDB.error,
          msg: '',
        };
      }

      res.status(200).send(result);
      res.end();
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
