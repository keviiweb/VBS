import type { NextApiRequest, NextApiResponse } from 'next';
import { type Result } from 'types/api';

import { actions } from '@constants/sys/admin';
import hasPermission from '@constants/sys/permission';

import type formidable from 'formidable';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import csv from 'csv-parser';

import { currentSession } from '@helper/sys/sessionServer';
import { createUserFile } from '@helper/sys/misc/user';

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Populates the User database through a CSV file
 *
 * This is an KEWEB level request only
 *
 * Used in:
 * /pages/sys/manage/admin/users
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
    hasPermission(session.user.admin, actions.POPULATE_USER)
  ) {
    const dataField: { fields: formidable.Fields; files: formidable.Files; } =
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
      const csvFile: formidable.File = dataField.files.file as formidable.File;
      if (csvFile !== null && csvFile !== undefined) {
        const path = csvFile.filepath;
        const results: any[] = [];

        fs.createReadStream(path)
          .pipe(csv({ separator: ';' }))
          .on('data', (data) => results.push(data))
          .on('end', async () => {
            console.error(results);
            const user: Result = await createUserFile(results, session);
            if (user.status) {
              result = {
                status: true,
                error: null,
                msg: user.msg,
              };
              res.status(200).send(result);
              res.end();
            } else {
              result = {
                status: false,
                error: user.error,
                msg: '',
              };
              res.status(200).send(result);
              res.end();
            }
          });
      } else {
        result = {
          status: false,
          error: 'Missing file',
          msg: '',
        };
        res.status(200).send(result);
        res.end();
      }
    } catch (error) {
      console.error(error);
      result = {
        status: false,
        error: 'Failed to create users',
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
