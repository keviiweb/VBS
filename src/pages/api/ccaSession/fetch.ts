import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { CCASession } from 'types/cca/ccaSession';
import { CCA } from 'types/cca/cca';

import { currentSession } from '@helper/sys/sessionServer';
import { findCCAbyID } from '@helper/sys/cca/cca';
import {
  countAllCCASessionByCCAID,
  fetchAllCCASessionByCCAID,
} from '@helper/sys/cca/ccaSession';
import { splitHours } from '@helper/sys/vbs/venue';

import {
  convertUnixToDate,
  dateISO,
  calculateDuration,
} from '@constants/sys/date';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null);

  let result: Result = {
    status: false,
    error: null,
    msg: '',
  };

  const { id } = req.body;

  if (session !== null && session !== undefined) {
    const parsedCCASession: CCASession[] = [];

    let ccaID: string | undefined;
    if (id !== undefined) {
      ccaID = (id as string).trim();
    }

    if (ccaID !== undefined) {
      const limitQuery = req.body.limit;
      const skipQuery = req.body.skip;
      const limit: number = limitQuery !== undefined ? Number(limitQuery) : 100;
      const skip: number = skipQuery !== undefined ? Number(skipQuery) : 0;

      const ccaDetailsRes: Result = await findCCAbyID(ccaID);
      if (ccaDetailsRes.status && ccaDetailsRes.msg) {
        const ccaDetails: CCA = ccaDetailsRes.msg;
        const ccaDB: Result = await fetchAllCCASessionByCCAID(
          ccaID,
          limit,
          skip,
        );
        const totalCount: number = await countAllCCASessionByCCAID(ccaID);
        if (ccaDB.status) {
          const ccaData: CCASession[] = ccaDB.msg;
          if (ccaData && ccaData.length > 0) {
            for (let ven = 0; ven < ccaData.length; ven += 1) {
              if (ccaData[ven]) {
                const record: CCASession = ccaData[ven];
                const { time } = record;
                const { start, end } = await splitHours(time);
                if (start !== null && end !== null) {
                  const duration: number = await calculateDuration(start, end);

                  const dateObj: Date | null = convertUnixToDate(record.date);
                  let dateStr: string = '';

                  if (dateObj !== null) {
                    dateStr = dateISO(dateObj);
                  }

                  const editableStr: string = record.editable ? 'Yes' : 'No';
                  const optionalStr: string = record.optional ? 'Yes' : 'No';

                  const data: CCASession = {
                    id: record.id,
                    ccaID: ccaID,
                    ccaName: ccaDetails.name,
                    name: record.name,
                    date: record.date,
                    dateStr: dateStr,
                    time: record.time,
                    duration: duration,
                    editable: record.editable,
                    optional: record.optional,
                    editableStr: editableStr,
                    optionalStr: optionalStr,
                    remarks: record.remarks,
                    ldrNotes: record.ldrNotes,
                  };

                  parsedCCASession.push(data);
                }
              }
            }
          }

          result = {
            status: true,
            error: null,
            msg: { count: totalCount, res: parsedCCASession },
          };
          res.status(200).send(result);
          res.end();
        } else {
          result = {
            status: false,
            error: ccaDB.error,
            msg: { count: 0, res: [] },
          };
          res.status(200).send(result);
          res.end();
        }
      } else {
        result = {
          status: false,
          error: ccaDetailsRes.error,
          msg: { count: 0, res: [] },
        };
        res.status(200).send(result);
        res.end();
      }
    } else {
      result = {
        status: false,
        error: 'Incomplete information',
        msg: { count: 0, res: [] },
      };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = {
      status: false,
      error: 'Unauthenticated',
      msg: { count: 0, res: [] },
    };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
