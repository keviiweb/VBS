import type { NextApiRequest, NextApiResponse } from 'next';
import { type Result } from 'types/api';
import { type Venue } from 'types/vbs/venue';

import { createVenue } from '@helper/sys/vbs/venue';
import { currentSession } from '@helper/sys/sessionServer';

import type formidable from 'formidable';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';

import { actions } from '@constants/sys/admin';
import hasPermission from '@constants/sys/permission';

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Creates the venue
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
    hasPermission(session.user.admin, actions.CREATE_VENUE)
  ) {
    const data: { fields: formidable.Fields; files: formidable.Files; } =
      await new Promise((resolve, reject) => {
        const form = new IncomingForm();
        form.parse(req, (err, fields, files) => {
          if (err !== undefined && err !== null) {
            reject(err);
            return;
          }
          resolve({ fields, files });
          return true;
        });
      });

    try {
      const capacity: number = Number(data.fields.capacity);
      const name: string = (data.fields.name as string).trim();
      const description: string = (data.fields.description as string).trim();
      const isInstantBook: boolean = data.fields.isInstantBook === 'true';
      const visible: boolean =
        data.fields.visible !== undefined
          ? data.fields.visible === 'true'
          : true;
      const isChildVenue: boolean = data.fields.isChildVenue === 'true';
      const parentVenue: string = isChildVenue
        ? (data.fields.parentVenue as string).trim()
        : '';

      const openingHours: string = (data.fields.openingHours as string).trim();

      const imageFile: formidable.File = data.files.image as formidable.File;
      let venuePath: string = '';

      if (imageFile !== null && imageFile !== undefined) {
        const imagePath = imageFile.filepath;

        venuePath = `/sys/venue/${imageFile.originalFilename?.trim()}`;
        const pathToWriteImage = `public${venuePath}`;
        const image = await fs.readFile(imagePath);
        try {
          await fs.writeFile(pathToWriteImage, image);
        } catch (error) {
          console.error(error);
        }

        const venueData: Venue = {
          capacity,
          name,
          description,
          isInstantBook,
          visible,
          isChildVenue,
          parentVenue,
          openingHours,
          image: venuePath,
        };

        const createVenueRequest: Result = await createVenue(
          venueData,
          session,
        );
        if (createVenueRequest.status) {
          result = {
            status: true,
            error: '',
            msg: createVenueRequest.msg,
          };
          res.status(200).send(result);
          res.end();
        } else {
          result = {
            status: false,
            error: createVenueRequest.error,
            msg: '',
          };
          res.status(200).send(result);
          res.end();
        }
      } else {
        result = {
          status: false,
          error: 'Please include an image!',
          msg: '',
        };
        res.status(200).send(result);
        res.end();
      }
    } catch (error) {
      console.error(error);
      result = {
        status: false,
        error: `Failed to create ${data.fields.name}`,
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
