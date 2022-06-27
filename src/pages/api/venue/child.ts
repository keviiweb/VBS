import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Venue } from 'types/vbs/venue';

import { checkerString } from '@constants/sys/helper';

import { currentSession } from '@helper/sys/sessionServer';
import { findVenueByID, fetchChildVenue } from '@helper/sys/vbs/venue';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null);

  let result: Result = {
    status: false,
    error: null,
    msg: '',
  };
  const { venue } = req.body;
  if (session !== undefined && session !== null) {
    if (checkerString(venue)) {
      const venueID: string = (venue as string).trim();
      const venueDB: Result = await fetchChildVenue(venueID);
      const parsedVenue: Venue[] = [];

      if (venueDB.status) {
        const childVenue: Venue[] = venueDB.msg;
        if (childVenue.length > 0) {
          for (let ven = 0; ven < childVenue.length; ven += 1) {
            if (childVenue[ven]) {
              const venueField: Venue = childVenue[ven];

              let parentVenueName: string = '';
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
