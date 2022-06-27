import { prisma } from '@constants/sys/db';

import { Announcement } from 'types/announcement';
import { Result } from 'types/api';

export const fetchAllAnnouncements = async (
  limit: number,
  skip: number,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const announce: Announcement[] = await prisma.announcement.findMany({
      skip: skip * limit,
      take: limit,
    });
    result = { status: true, error: null, msg: announce };
  } catch (error) {
    console.error(error);
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
};

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
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
};

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
    result = { status: false, error: error.toString(), msg: '' };
  }

  return result;
};