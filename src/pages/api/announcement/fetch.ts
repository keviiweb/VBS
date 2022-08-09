import type { NextApiRequest, NextApiResponse } from 'next';
import { Result } from 'types/api';
import { Announcement } from 'types/misc/announcement';

import { currentSession } from '@helper/sys/sessionServer';
import { fetchAllAnnouncements } from '@helper/sys/misc/announcement';

/**
 * Fetches the list of announcements with pagination and skip
 *
 * Used in:
 * /pages/sys/manage/announcement
 * @components/sys/misc/Announcement
 *
 * @param req NextJS API Request
 * @param res NextJS API Response
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await currentSession(req, res, null);

  const limitQuery = req.query.limit;
  const skipQuery = req.query.skip;

  let result: Result = {
    status: false,
    error: null,
    msg: '',
  };

  if (session !== null && session !== undefined) {
    const limit: number =
      limitQuery !== undefined ? Number(limitQuery) : 100000;
    const skip: number = skipQuery !== undefined ? Number(skipQuery) : 0;

    const announcementDB: Result = await fetchAllAnnouncements(
      limit,
      skip,
      session,
    );
    const parsedAnnouncement: Announcement[] = [];

    if (announcementDB.status) {
      const announceData: Announcement[] = announcementDB.msg;
      if (announceData.length > 0) {
        for (let ven = 0; ven < announceData.length; ven += 1) {
          if (announceData[ven]) {
            const announce: Announcement = announceData[ven];

            const data: Announcement = {
              id: announce.id,
              image: announce.image,
              description: announce.description,
            };

            parsedAnnouncement.push(data);
          }
        }
      }

      result = {
        status: true,
        error: null,
        msg: parsedAnnouncement,
      };
      res.status(200).send(result);
      res.end();
    } else {
      result = {
        status: false,
        error: announcementDB.error,
        msg: [],
      };
      res.status(200).send(result);
      res.end();
    }
  } else {
    result = { status: false, error: 'Unauthenticated', msg: [] };
    res.status(200).send(result);
    res.end();
  }
};

export default handler;
