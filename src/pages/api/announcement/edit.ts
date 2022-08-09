import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Announcement } from 'types/misc/announcement';

import { editAnnouncement } from '@helper/sys/misc/announcement';
import { currentSession } from '@helper/sys/sessionServer';

import formidable, { IncomingForm } from 'formidable';

import { levels } from '@constants/sys/admin';

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Edit the announcement
 *
 * This is an ADMIN level or OWNER level request only.
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
    (session.user.admin === levels.ADMIN || session.user.admin === levels.OWNER)
  ) {
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
      const description: string = (data.fields.description as string).trim();

      const announceData: Announcement = {
        id: id,
        description: description,
        updated_at: new Date().toISOString(),
      };

      const editAnnounceRequest: Result = await editAnnouncement(
        announceData,
        session,
      );
      if (editAnnounceRequest.status) {
        result = {
          status: true,
          error: '',
          msg: editAnnounceRequest.msg,
        };
        res.status(200).send(result);
        res.end();
      } else {
        result = {
          status: false,
          error: editAnnounceRequest.error,
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
