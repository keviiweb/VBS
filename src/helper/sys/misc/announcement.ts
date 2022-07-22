import { prisma } from '@constants/sys/db';

import { Announcement } from 'types/misc/announcement';
import { Result } from 'types/api';
import { Session } from 'next-auth/core/types';

import { logger } from '@helper/sys/misc/logger';
/**
 * Finds all announcements
 *
 * @param limit Number of total records to fetch. Defaults to 100000
 * @param skip Number of records to skip. Defaults to 0
 * @returns A Result containing all announcements wrapped in a Promise
 */
export const fetchAllAnnouncements = async (
  limit: number = 100000,
  skip: number = 0,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const announce: Announcement[] = await prisma.announcement.findMany({
      skip: skip * limit,
      take: limit,
    });

    if (announce) {
      result = { status: true, error: null, msg: announce };
    } else {
      result = {
        status: false,
        error: 'Failed to fetch announcements',
        msg: [],
      };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch announcements', msg: [] };
    await logger('fetchAllAnnouncements', session.user.email, error.message);
  }

  return result;
};

/**
 * Creates an announcement
 *
 * @param data Announcement Object
 * @returns A Result containing the status wrapped in a Promise
 */
export const createAnnouncement = async (
  data: Announcement,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const announce: Announcement = await prisma.announcement.create({
      data: data,
    });

    if (announce) {
      result = {
        status: true,
        error: '',
        msg: 'Successfully created announcement',
      };
    } else {
      result = {
        status: false,
        error: 'Failed to create announcement',
        msg: '',
      };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to create announcement', msg: '' };
    await logger('createAnnouncement', session.user.email, error.message);
  }

  return result;
};

/**
 * Edits an announcement
 *
 * @param data Announcement Object
 * @returns A Result containing the status wrapped in a Promise
 */
export const editAnnouncement = async (
  data: Announcement,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const announce = await prisma.announcement.update({
      where: {
        id: data.id,
      },
      data: data,
    });

    if (announce) {
      result = {
        status: true,
        error: '',
        msg: 'Successfully updated announcement',
      };
    } else {
      result = {
        status: false,
        error: 'Failed to update announcement',
        msg: '',
      };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to update announcement', msg: '' };
    await logger('editAnnouncement', session.user.email, error.message);
  }

  return result;
};

/**
 * Deletes an announcement filtered by the specific ID
 *
 * @param id Announcement ID
 * @returns A Result containing the status wrapped in a Promise
 */
export const deleteAnnouncement = async (
  id: string,
  session: Session,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const announce = await prisma.announcement.delete({
      where: {
        id: id,
      },
    });

    if (announce) {
      result = {
        status: true,
        error: '',
        msg: 'Successfully deleted announcement',
      };
    } else {
      result = {
        status: false,
        error: 'Failed to delete announcement',
        msg: '',
      };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to delete announcement', msg: '' };
    await logger('deleteAnnouncement', session.user.email, error.message);
  }

  return result;
};
