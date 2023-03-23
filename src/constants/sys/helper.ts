import {
  timingSlotNumberToTimingMapping,
  timeSlots,
} from '@constants/sys/timeslot';

import { type TimeSlot } from 'types/vbs/timeslot';

/**
 * Constant used for PERSONAL venue bookings
 */
export const PERSONAL = 'PERSONAL';

/**
 * Check whether the given string is valid. The criteria for a valid string is as follows:
 *
 * 1. Not Null
 * 2. Not Undefined
 * 3. Not Empty String
 *
 * @param data String to be tested
 * @returns boolean whether string is valid
 */
export const checkerString = (data: string): boolean => {
  if (data !== null && data !== undefined) {
    const res = data.trim();
    return res !== '';
  } else {
    return false;
  }
};

/**
 * Check whether the given array is valid. The criteria for a valid array is as follows:
 *
 * 1. Is an Array (aka not null and not undefined)
 *
 * @param data array
 * @returns boolean whether array is valid
 */
export const checkerArray = (data: any[]): boolean => {
  if (Array.isArray(data)) {
    return data !== null && data !== undefined;
  } else {
    return false;
  }
};

/**
 * Checks whether the number is valid. The criteria for a valid number is as follows:
 *
 * 1. Not equals to 0
 * 2. Not equals to NaN
 * 3. Not null or undefined
 *
 * @param data Number to be tested
 * @returns boolean whether number is valid
 */
export const checkerNumber = (data: number): boolean => {
  if (data !== 0) {
    return !isNaN(data) && data !== null && data !== undefined;
  } else {
    return false;
  }
};

/**
 * Check if a given element is inside the string
 *
 * 1. Split the string into their respective arrays eg. [1,3,4,5]
 * 2. Check whether any element in the second array is in the first array
 *
 * @param checkInThis string containing an array of numbers eg. 1,3,4,5
 * @param checkIfInside string containing an array of numbers eg. 1,3,5,6
 * @returns boolean whether element in second array in the first array
 */
export const isInside = (
  checkInThis: string,
  checkIfInside: string,
): boolean => {
  const wantArr = convertSlotToArray(checkInThis, true) as number[];
  const checkArr = convertSlotToArray(checkIfInside, true) as number[];

  if (checkerArray(wantArr) && checkerArray(checkArr)) {
    for (let obj = 0; obj < wantArr.length; obj += 1) {
      for (let i = 0; i < checkArr.length; i += 1) {
        if (checkArr[i] === wantArr[obj]) {
          return true;
        }
      }
    }
  }

  return false;
};

/**
 * Maps a given timeslot number to their respective timeslots
 *
 * eg. 2 is mapped to '0730 - 0800'
 *
 * eg. [1, 2] is mapped to ['0700 - 0730', '0730 - 0800']
 *
 * @param data Either a number, string or an array of numbers
 * @returns A string array or string containing the timeslots
 */
export const mapSlotToTiming = (
  data: number | string | number[],
): string[] | string => {
  if (Array.isArray(data)) {
    const result: string[] = [];

    if (checkerArray(data)) {
      for (const key in data) {
        if (
          !isNaN(data[key]) &&
          timingSlotNumberToTimingMapping[Number(data[key])] !== undefined
        ) {
          const map = timingSlotNumberToTimingMapping[Number(data[key])];
          result.push(map);
        }
      }
    }

    return result;
  } else {
    if (checkerNumber(Number(data))) {
      if (timingSlotNumberToTimingMapping[Number(data)] !== undefined) {
        const map: string = timingSlotNumberToTimingMapping[Number(data)];
        return map;
      }
    }

    return '';
  }
};

/**
 * Prints a string containing all the elements from a given array
 *
 * eg. [1, 2] is mapped to '1, 2'
 *
 * eg. ['hello', 'hi', 'bye'] is mapped to 'hello, hi, bye'
 *
 * @param data a string array with the elements
 * @returns a string containing all the elements
 */
export const prettifyTiming = (data: string[]): string => {
  let str = '';
  let count = 0;

  for (const key in data) {
    count += 1;
    if (count !== data.length) {
      str += data[key] + ', ';
    } else {
      str += data[key];
    }
  }

  return str;
};

/**
 * Converts a string or a TimeSlot array to their respective formats
 *
 * eg. '1,2,3,4' with reverse=True is mapped to [1, 2, 3, 4]
 *
 * eg. [{ id: 1, slot: '0700 - 0800', booked: false }] with reverse=False is mapped to '1'
 *
 * @param slots Either a string or a TimeSlot array
 * @param reverse True for an array, False for a string
 * @returns Either a string or an array of numbers depending on the reverse flag
 */
export const convertSlotToArray = (
  slots: string | TimeSlot[],
  reverse: boolean = false,
): number[] | string | null => {
  if (reverse) {
    try {
      const strSlot = slots as string;
      const stringArr: string[] = strSlot.split(',');
      const result: number[] = [];
      for (const key in stringArr) {
        if (stringArr[key].length > 0) {
          const res = Number(stringArr[key]);
          if (isNaN(res)) {
            return null;
          } else {
            result[key] = res;
          }
        }
      }

      return result;
    } catch (error) {
      return null;
    }
  } else {
    try {
      const result: number[] = [];
      const slotArr = slots as TimeSlot[];
      for (const key in slotArr) {
        if (slotArr[key] !== undefined) {
          const id = slotArr[key].id;
          if (id === undefined || isNaN(id) || id === null) {
            continue;
          } else {
            if (isNaN(id)) {
              return null;
            } else {
              const resID: TimeSlot = slotArr[key];
              if (resID.id !== undefined) {
                result.push(resID.id);
              }
            }
          }
        }
      }

      return result.toString();
    } catch (error) {
      return null;
    }
  }
};

/**
 * Finds the full timeslot id with the included slot
 *
 * eg. '0800' with isStart=false is mapped to '2'
 *
 * @param slot a string containing the timeslot
 * @param isStart if the timeslot is a start time or end time
 * @returns
 */
export const findSlots = async (
  slot: string,
  isStart: boolean,
): Promise<string | null> => {
  const num = Number(slot);
  if (isNaN(num)) {
    return null;
  } else {
    for (const i in timingSlotNumberToTimingMapping) {
      if (timingSlotNumberToTimingMapping[i].includes(slot) as boolean) {
        const split = timingSlotNumberToTimingMapping[i].split('-');
        const split0 = Number(split[0].trim());
        const split1 = Number(split[1].trim());
        if (split0 === num && isStart) {
          return i;
        }

        if (split1 === num && !isStart) {
          return i;
        }
      }
    }

    return null;
  }
};

/**
 * Retrieves a TimeSlot object by its id
 *
 * @param slot timeslot number
 * @returns a TimeSlot or null if invalid id
 */
export const findSlotsByID = async (slot: number): Promise<string | null> => {
  if (checkerNumber(slot) && timeSlots[slot] !== undefined) {
    return timeSlots[slot];
  }

  return null;
};

/**
 * Converts the timeslot into their respective start and end times
 *
 * eg. '0700 - 0830' is mapped to start: 0700, end: 0830
 *
 * @param opening A string containing a timeslot
 * @returns The start time and end time in a Promise
 */
export const splitHours = async (
  opening: string,
): Promise<{ start: number | null; end: number | null; }> => {
  try {
    if (opening.length > 0) {
      if (!opening.includes('-')) {
        return { start: null, end: null };
      }

      const hours: string[] = opening.split('-');
      if (hours.length === 2) {
        const startN = Number(hours[0].trim());
        const endN = Number(hours[1].trim());

        if (isNaN(startN) || startN === null || isNaN(endN) || endN === null) {
          return { start: null, end: null };
        } else {
          return { start: startN, end: endN };
        }
      } else {
        return { start: null, end: null };
      }
    } else {
      return { start: null, end: null };
    }
  } catch (error) {
    console.error(error);
    return { start: null, end: null };
  }
};
