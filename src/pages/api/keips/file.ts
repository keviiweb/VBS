import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';

import { levels } from '@constants/sys/admin';

import formidable, { IncomingForm } from 'formidable';
import fs from 'fs';
import csv from 'csv-parser';

import { currentSession } from '@helper/sys/sessionServer';
import { createKEIPSFile } from '@helper/sys/misc/keips';

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

  if (
    session !== undefined &&
    session !== null &&
    session.user.admin === levels.OWNER
  ) {
    const dataField: { fields: formidable.Fields; files: formidable.Files } =
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
      const csvFile: formidable.File = dataField.files.file as formidable.File;
      if (csvFile !== null && csvFile !== undefined) {
        const path = csvFile.filepath;
        const results: any[] = [];

        fs.createReadStream(path)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', async () => {
            const keipsRes: Result = await createKEIPSFile(results);
            if (keipsRes.status) {
              result = {
                status: true,
                error: null,
                msg: keipsRes.msg,
              };
              res.status(200).send(result);
              res.end();
            } else {
              result = {
                status: false,
                error: keipsRes.error,
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
        error: 'Failed to create KEIPS',
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
