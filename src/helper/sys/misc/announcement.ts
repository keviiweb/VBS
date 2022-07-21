import { prisma } from '@constants/sys/db';

import { Announcement } from 'types/misc/announcement';
import { Result } from 'types/api';

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
  }

  return result;
};

/**
 * Edits an announcement
 *
 * @param data Announcement Object
 * @returns A Result containing the status wrapped in a Promise
 */
export const editAnnouncement = async (data: Announcement): Promise<Result> => {
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
  }

  return result;
};

/**
 * Deletes an announcement filtered by the specific ID
 *
 * @param id Announcement ID
 * @returns A Result containing the status wrapped in a Promise
 */
export const deleteAnnouncement = async (id: string): Promise<Result> => {
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
  }

  return result;
};
