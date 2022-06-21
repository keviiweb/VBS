import {
  timingSlotNumberToTimingMapping,
  timeSlots,
} from '@constants/sys/timeslot';
import { TimeSlot } from 'types/timeslot';

export const checkerString = (data: string): boolean => {
  if (data !== null && data !== undefined) {
    const res = data.trim();
    return res !== '';
  } else {
    return false;
  }
};

export const checkerArray = (data: any[]): boolean => {
  if (Array.isArray(data)) {
    return data !== null && data !== undefined;
  } else {
    return false;
  }
};

export const checkerNumber = (data: number): boolean => {
  if (data !== 0) {
    return !isNaN(data) && data !== null && data !== undefined;
  } else {
    return false;
  }
};

export const isInside = (want: string, check: string): boolean => {
  const wantArr = convertSlotToArray(want, true) as number[];
  const checkArr = convertSlotToArray(check, true) as number[];

  if (checkerArray(wantArr) && checkerArray(checkArr)) {
    for (let obj in wantArr) {
      let i = checkArr.length;
      while (i--) {
        if (Number(checkArr[i]) === Number(wantArr[obj])) {
          return true;
        }
      }
    }
  }

  return false;
};

export const mapSlotToTiming = (
  data: number | string | number[],
): string[] | string => {
  if (Array.isArray(data)) {
    const result: string[] = [];

    if (checkerArray(data)) {
      for (let key in data) {
        if (data[key]) {
          if (!isNaN(data[key])) {
            let map = timingSlotNumberToTimingMapping[Number(data[key])];
            result.push(map);
          }
        }
      }
    }

    return result;
  } else {
    if (!checkerNumber(Number(data))) {
      if (timingSlotNumberToTimingMapping[Number(data)]) {
        let map: string = timingSlotNumberToTimingMapping[Number(data)];
        return map;
      }
    }

    return '';
  }
};

export const prettifyTiming = (data: string[]): string => {
  let str = '';
  let count = 0;

  for (let key in data) {
    count += 1;
    if (count != data.length) {
      str += data[key] + ', ';
    } else {
      str += data[key];
    }
  }

  return str;
};

export const convertSlotToArray = (
  slots: string | TimeSlot[],
  reverse: boolean = false,
): number[] | string => {
  if (reverse) {
    try {
      const strSlot = slots as string;
      if (strSlot.includes(',')) {
        const stringArr: string[] = strSlot.split(',');
        const result: number[] = [];
        for (let key in stringArr) {
          if (stringArr[key]) {
            const res = Number(stringArr[key]);
            if (isNaN(res)) {
              return null;
            } else {
              result[key] = res;
            }
          }
        }

        return result;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  } else {
    try {
      const result = [];
      const slotArr = slots as TimeSlot[];
      for (let key in slotArr) {
        if (slotArr[key]) {
          const id = slotArr[key].id;
          if (isNaN(id) || id === null || id === undefined) {
            return null;
          } else {
            result.push(slotArr[key].id);
          }
        }
      }

      return result.toString();
    } catch (error) {
      return null;
    }
  }
};

export const findSlots = async (
  slot: string,
  isStart: boolean,
): Promise<string> => {
  const num = Number(slot);
  if (isNaN(num)) {
    return null;
  } else {
    for (let i in timingSlotNumberToTimingMapping) {
      if (timingSlotNumberToTimingMapping[i].includes(slot)) {
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

export const findSlotsByID = async (slot: number): Promise<string> => {
  if (
    slot !== null &&
    slot !== undefined &&
    slot !== 0 &&
    !isNaN(slot) &&
    timeSlots[slot]
  ) {
    return timeSlots[slot];
  }

  return null;
};
