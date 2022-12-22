import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';

import { deleteAnnouncement } from '@helper/sys/misc/announcement';
import { currentSession } from '@helper/sys/sessionServer';

import formidable, { IncomingForm } from 'formidable';

import { actions } from '@constants/sys/admin';
import hasPermission from '@constants/sys/permission';

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Delete the announcement
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
    hasPermission(session.user.admin, actions.DELETE_ANNOUNCEMENT)
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
      const id: string = (data.fields.id as string).trim();

      const deleteAnnounceRequest: Result = await deleteAnnouncement(
        id,
        session,
      );
      if (deleteAnnounceRequest.status) {
        result = {
          status: true,
          error: '',
          msg: deleteAnnounceRequest.msg,
        };
        res.status(200).send(result);
        res.end();
      } else {
        result = {
          status: false,
          error: deleteAnnounceRequest.error,
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
