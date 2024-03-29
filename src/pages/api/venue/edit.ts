import type { NextApiRequest, NextApiResponse } from 'next';
import { type Result } from 'types/api';
import { type Venue } from 'types/vbs/venue';

import { editVenue } from '@helper/sys/vbs/venue';
import { currentSession } from '@helper/sys/sessionServer';

import type formidable from 'formidable';
import { IncomingForm } from 'formidable';

import { actions } from '@constants/sys/admin';
import hasPermission from '@constants/sys/permission';

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Edit the venue
 *
 * This is an KEWEB level request only
 *
 * Used in:
 * /pages/sys/manage/admin/venues
 *
 * @param req NextJS API Request
 * @param res NextJS API Response
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null);
  let result: Result = {
    status: false,
    error: null,
    msg: '',
  };

  if (
    session !== undefined &&
    session !== null &&
    hasPermission(session.user.admin, actions.EDIT_VENUE)
  ) {
    const data: { fields: formidable.Fields; files: formidable.Files; } =
      await new Promise((resolve, reject) => {
        const form = new IncomingForm();
        form.parse(req, (err, fields, files) => {
          if (err !== null && err !== undefined) {
            reject(err);
            return;
          }
          resolve({ fields, files });
          return true;
        });
      });

    try {
      const id: string = (data.fields.id as string).trim();
      const capacity: number = Number(data.fields.capacity);
      const name: string = (data.fields.name as string).trim();
      const description: string = (data.fields.description as string).trim();
      const isInstantBook: boolean = data.fields.isInstantBook === 'true';
      const visible: boolean = data.fields.visible === 'true';
      const isChildVenue: boolean = data.fields.isChildVenue === 'true';
      const parentVenue: string = isChildVenue
        ? (data.fields.parentVenue as string).trim()
        : '';
      const openingHours: string = (data.fields.openingHours as string).trim();

      const venueData: Venue = {
        id,
        capacity,
        name,
        description,
        isInstantBook,
        visible,
        isChildVenue,
        parentVenue,
        openingHours,
        updated_at: new Date().toISOString(),
      };

      const editVenueRequest: Result = await editVenue(venueData, session);
      if (editVenueRequest.status) {
        result = {
          status: true,
          error: '',
          msg: editVenueRequest.status,
        };
        res.status(200).send(result);
        res.end();
      } else {
        result = {
          status: false,
          error: editVenueRequest.error,
          msg: '',
        };
        res.status(200).send(result);
        res.end();
      }
    } catch (error) {
      console.error(error);
      result = {
        status: false,
        error: 'Information of wrong type',
        msg: '',
      };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = { status: false, error: 'Unauthenticated request', msg: '' };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
