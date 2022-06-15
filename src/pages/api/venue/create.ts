import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';

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

  if (session && session.user.admin) {
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
      const imageFile: formidable.File = data.files.image as formidable.File;
      let venuePath: string = null;

      if (imageFile) {
        const imagePath = imageFile.filepath;

        venuePath = `/sys/venue/${imageFile.originalFilename}`;
        const pathToWriteImage = `public${venuePath}`;
        const image = await fs.readFile(imagePath);
        await fs.writeFile(pathToWriteImage, image);
      }

      const isChildVenue = data.fields.isChildVenue === 'true';
      const parentVenue = isChildVenue ? data.fields.parentVenue : null;

      const venueData = {
        capacity: Number(data.fields.capacity),
        name: data.fields.name as string,
        description: data.fields.description as string,
        isInstantBook: data.fields.isInstantBook === 'true',
        visible: data.fields.visible === 'true',
        isChildVenue: isChildVenue,
        parentVenue: parentVenue as string,
        openingHours: data.fields.openingHours as string,
        image: venuePath,
      };

      const createVenueRequest = await createVenue(venueData);
      if (createVenueRequest.status) {
        result = {
          status: true,
          error: '',
          msg: `Successfully created ${data.fields.name}`,
        };
        res.status(200).send(result);
        res.end();
        return;
      }
      result = {
        status: false,
        error: createVenueRequest.error,
        msg: '',
      };
      res.status(200).send(result);
      res.end();
      return;
    } catch (error) {
      console.log(error);
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
