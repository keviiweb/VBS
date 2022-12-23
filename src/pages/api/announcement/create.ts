import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Announcement } from 'types/misc/announcement';

import { createAnnouncement } from '@helper/sys/misc/announcement';
import { currentSession } from '@helper/sys/sessionServer';

import formidable, { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';

import { actions } from '@constants/sys/admin';
import hasPermission from '@constants/sys/permission';

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Create the announcement
 *
 * This is an JCRC level or KEWEB level request only.
 *
 * Used in:
 * /pages/sys/manage/announcement
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
    hasPermission(session.user.admin, actions.CREATE_ANNOUNCEMENT)
  ) {
    const data: { fields: formidable.Fields; files: formidable.Files; } =
      await new Promise((resolve, reject) => {
        const form = new IncomingForm();
        form.parse(req, (err, fields, files) => {
          if (err !== null && err !== undefined) {
            return reject(err);
          }
          resolve({ fields, files });
          return true;
        });
      });

    try {
      const description: string = (data.fields.description as string).trim();
      const imageFile: formidable.File = data.files.image as formidable.File;
      let announcePath: string = '';

      if (imageFile !== null && imageFile !== undefined) {
        const imagePath = imageFile.filepath;

        announcePath = `/sys/announcement/${imageFile.originalFilename?.trim()}`;
        const pathToWriteImage = `public${announcePath}`;
        const image = await fs.readFile(imagePath);
        try {
          await fs.writeFile(pathToWriteImage, image);
        } catch (error) {
          console.error(error);
        }

        const announceData: Announcement = {
          description,
          image: announcePath,
          sessionEmail: session.user.email,
        };

        const createAnnounceRequest: Result = await createAnnouncement(
          announceData,
          session,
        );
        if (createAnnounceRequest.status) {
          result = {
            status: true,
            error: '',
            msg: createAnnounceRequest.msg,
          };
          res.status(200).send(result);
          res.end();
        } else {
          result = {
            status: false,
            error: createAnnounceRequest.error,
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
        error: 'Failed to create announcement',
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
