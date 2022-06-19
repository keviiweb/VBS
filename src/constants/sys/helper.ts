import {
  timingSlotNumberToTimingMapping,
  timeSlots,
} from '@constants/sys/timeslot';
import { TimeSlot } from 'types/timeslot';

export const isInside = (want: string, check: string): boolean => {
  const wantArr = convertSlotToArray(want, true) as number[];
  const checkArr = convertSlotToArray(check, true) as number[];

  for (let obj in wantArr) {
    let i = checkArr.length;
    while (i--) {
      if (Number(checkArr[i]) === Number(wantArr[obj])) {
        return true;
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
    for (let key in data) {
      if (data[key]) {
        if (!isNaN(data[key])) {
          let map = timingSlotNumberToTimingMapping[Number(data[key])];
          result.push(map);
        }
      }
    }

    return result;
  } else {
    if (!isNaN(Number(data))) {
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
    const strSlot = slots as string;
    const stringArr: string[] = strSlot.split(',');
    const result: number[] = [];
    for (let key in stringArr) {
      result[key] = Number(stringArr[key]);
    }

    return result;
  } else {
    const result = [];
    const slotArr = slots as TimeSlot[];
    for (let key in slotArr) {
      if (slotArr[key]) {
        result.push(slotArr[key].id);
      }
    }

    return result.toString();
  }
};

export const findSlots = async (
  slot: string,
  isStart: boolean,
): Promise<string> => {
  for (let i in timingSlotNumberToTimingMapping) {
    if (timingSlotNumberToTimingMapping[i].includes(slot)) {
      const split = timingSlotNumberToTimingMapping[i].split('-');
      if (split[0].trim() == slot && isStart) {
        return i;
      }

      if (split[1].trim() == slot && !isStart) {
        return i;
      }
    }
  }

  return null;
};

export const findSlotsByID = async (slot: number): Promise<string> => {
  if (slot && timeSlots[slot]) {
    return timeSlots[slot];
  }

  return null;
};
