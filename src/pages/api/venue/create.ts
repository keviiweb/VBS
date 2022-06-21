import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Venue } from 'types/venue';

import { createVenue } from '@helper/sys/vbs/venue';
import formidable, { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import { currentSession } from '@helper/sys/session';

// first we need to disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req);
  let result: Result = null;

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
      const capacity: number = Number(data.fields.capacity);
      const name: string = data.fields.name as string;
      const description: string = data.fields.description as string;
      const isInstantBook: boolean = data.fields.isInstantBook === 'true';
      const visible: boolean = data.fields.visible === 'true';
      const isChildVenue: boolean = data.fields.isChildVenue === 'true';
      const parentVenue: string = isChildVenue
        ? (data.fields.parentVenue as string)
        : null;

      const openingHours: string = data.fields.openingHours as string;

      const imageFile: formidable.File = data.files.image as formidable.File;
      let venuePath: string = null;

      if (imageFile !== null && imageFile !== undefined) {
        const imagePath = imageFile.filepath;

        venuePath = `/sys/venue/${imageFile.originalFilename}`;
        const pathToWriteImage = `public${venuePath}`;
        const image = await fs.readFile(imagePath);
        await fs.writeFile(pathToWriteImage, image);

        const venueData: Venue = {
          capacity: capacity,
          name: name,
          description: description,
          isInstantBook: isInstantBook,
          visible: visible,
          isChildVenue: isChildVenue,
          parentVenue: parentVenue,
          openingHours: openingHours,
          image: venuePath,
        };

        const createVenueRequest: Result = await createVenue(venueData);
        if (createVenueRequest.status) {
          result = {
            status: true,
            error: '',
            msg: `Successfully created ${data.fields.name}`,
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
