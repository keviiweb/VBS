import type { NextApiRequest, NextApiResponse } from 'next';
import { type Result } from 'types/api';
import { type Announcement } from 'types/misc/announcement';

import { editAnnouncement } from '@helper/sys/misc/announcement';
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
 * Edit the announcement
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
    hasPermission(session.user.admin, actions.EDIT_ANNOUNCEMENT)
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
      const description: string = (data.fields.description as string).trim();

      const announceData: Announcement = {
        id,
        description,
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
