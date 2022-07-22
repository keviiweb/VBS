import { prisma } from '@constants/sys/db';

import { Log } from 'types/misc/logger';

/**
 * Adds a logging entry in the database
 *
 * @param location Location where the function is called.
 * @param username Username of the user performing the action.
 * @param content What action was performed
 * @return No content is returned
 */
export const logger = async (
  location: string,
  username: string,
  content: string,
): Promise<void> => {
  try {
    const data: Log = {
      location: location,
      username: username,
      content: content,
    };

    await prisma.log.create({
      data: data,
    });
  } catch (error) {
    console.error(error);
  }
};
