import { prisma } from '@constants/sys/db';
import { levels } from '@root/src/constants/sys/admin';

import { User } from 'types/misc/user';
import { Result } from 'types/api';
import { checkerString } from '@root/src/constants/sys/helper';

/**
 * Finds all User records filtered by email address
 *
 * @param email Email address of the user
 * @returns A Result containing the status wrapped in a Promise
 */
export const fetchUserByEmail = async (email: string): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const userFromDB: User = await prisma.users.findUnique({
      where: {
        email: email,
      },
    });

    if (userFromDB) {
      result = { status: true, error: null, msg: userFromDB };
    } else {
      result = { status: false, error: 'Failed to fetch user', msg: null };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch user', msg: null };
  }

  return result;
};

/**
 * Creates a new User
 *
 * @param data User Object
 * @returns A Result containing the status wrapped in a Promise
 */
export const createUser = async (data: User): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const user: User = await prisma.users.create({
      data: data,
    });

    if (user) {
      result = { status: true, error: null, msg: 'Successfully created user' };
    } else {
      result = { status: false, error: 'Failed to create user', msg: '' };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to create user', msg: '' };
  }

  return result;
};

/**
 * Populates the list of User read from a CSV file
 *
 * 1. The specific User record is fetched
 * 2. If the record is available, the record is updated
 * 3. If the record cannot be found, a new record is created.
 *
 * @param dataField File content
 * @returns A Result containing the status wrapped in a Promise
 */
export const createUserFile = async (dataField: any[]): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };

  let count = 0;

  try {
    for (let key = 0; key < dataField.length; key += 1) {
      if (dataField[key]) {
        const data = dataField[key];

        const name: string = data.name !== undefined ? data.name : '';
        const email: string = data.email !== undefined ? data.email : '';
        const admin: number =
          data.admin !== undefined ? Number(data.admin) : levels.USER;
        const studentID: string =
          data.studentID !== undefined ? data.studentID : '';
        const roomNum: string = data.roomNum !== undefined ? data.roomNum : '';

        if (checkerString(name) && checkerString(email)) {
          const userData: User = {
            name: name.trim(),
            email: email.trim(),
            admin: admin,
            studentID: studentID.trim(),
            roomNum: roomNum.trim(),
          };

          await prisma.users.upsert({
            where: {
              email: userData.email,
            },
            update: {},
            create: {
              email: userData.email,
              name: userData.name,
              admin: userData.admin,
              studentID: userData.studentID,
              roomNum: userData.roomNum,
            },
          });

          count += 1;
        }
      }
    }

    result = {
      status: true,
      error: null,
      msg: `Successfully created ${count} User records`,
    };
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to create user', msg: '' };
  }
  return result;
};

/**
 * Counts the total of User records available
 *
 * @returns Total number of User record wrapped in a Promise
 */
export const countUser = async (): Promise<number> => {
  let count: number = 0;
  try {
    count = await prisma.users.count();
  } catch (error) {
    console.error(error);
  }

  return count;
};

/**
 * Finds all User records
 *
 * @param limit Number of total records to fetch. Defaults to 100000
 * @param skip Number of records to skip. Defaults to 0
 * @returns A Result containing the list of User records wrapped in a Promise
 */
export const fetchAllUser = async (
  limit: number = 100000,
  skip: number = 0,
): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const users: User[] = await prisma.users.findMany({
      skip: skip * limit,
      take: limit,
    });

    if (users) {
      result = { status: true, error: null, msg: users };
    } else {
      result = { status: false, error: 'Failed to fetch user', msg: [] };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to fetch user', msg: [] };
  }

  return result;
};

/**
 * Edit a User
 *
 * @param data User Object
 * @returns A Result containing the status wrapped in a Promise
 */
export const editUser = async (data: User): Promise<Result> => {
  let result: Result = { status: false, error: null, msg: '' };
  try {
    const user: User = await prisma.users.update({
      where: {
        id: data.id,
      },
      data: data,
    });

    if (user) {
      result = {
        status: true,
        error: '',
        msg: `Successfully updated ${user.name}`,
      };
    } else {
      result = { status: false, error: 'Failed to update user', msg: '' };
    }
  } catch (error) {
    console.error(error);
    result = { status: false, error: 'Failed to update user', msg: '' };
  }

  return result;
};
