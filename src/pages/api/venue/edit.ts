import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Venue } from 'types/vbs/venue';

import { editVenue } from '@helper/sys/vbs/venue';
import { currentSession } from '@helper/sys/sessionServer';

import formidable, { IncomingForm } from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null);
  let result: Result = {
    status: false,
    error: null,
    msg: '',
  };

  if (session !== undefined && session !== null && session.user.admin) {
    const data: { fields: formidable.Fields; files: formidable.Files } =
      await new Promise((resolve, reject) => {
        const form = new IncomingForm();
        form.parse(req, (err, fields, files) => {
          if (err) {
            return reject(err);
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
        id: id,
        capacity: capacity,
        name: name,
        description: description,
        isInstantBook: isInstantBook,
        visible: visible,
        isChildVenue: isChildVenue,
        parentVenue: parentVenue,
        openingHours: openingHours,
        updated_at: new Date().toISOString(),
      };

      const editVenueRequest: Result = await editVenue(venueData);
      if (editVenueRequest.status) {
        result = {
          status: true,
          error: '',
          msg: `Successfully edited ${data.fields.name}`,
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
