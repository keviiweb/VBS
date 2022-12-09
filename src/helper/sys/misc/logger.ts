import { prisma } from '@constants/sys/db';
import { Result } from 'types/api';
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
  content: string
): Promise<void> => {
  if (process.env.LOGGER !== undefined && process.env.LOGGER) {
    try {
      const data: Log = {
        location,
        username,
        content
      };

      await prisma.log.create({
        data
      });
    } catch (error) {
      console.error(error);
    }
  }
};

export const deleteAllLog = async (): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    await prisma.log.deleteMany({});
    result = {
      status: true,
      error: null,
      msg: 'Successfully deleted all logs'
    };
  } catch (error) {
    console.error(error);
    result = {
      status: false,
      error: 'Failed to delete all logs',
      msg: ''
    };
  }
  return result;
};
