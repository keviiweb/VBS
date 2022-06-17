import {
  timingSlotNumberToTimingMapping,
  timeSlots,
} from '@constants/sys/timeslot';

export const isInside = (want: string, check: string): boolean => {
  const wantArr = convertSlotToArray(want, true);
  const checkArr = convertSlotToArray(check, true);

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

export const mapSlotToTiming = (data: string | number[]): string[] | string => {
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

export const convertSlotToArray = (slots, reverse: boolean = false) => {
  if (reverse) {
    const result = slots.split(',');
    for (let key in result) {
      result[key] = Number(result[key]);
    }

    return result;
  } else {
    const result = [];
    for (let key in slots) {
      if (slots[key]) {
        result.push(slots[key].id);
      }
    }

    return result.toString();
  }
};

export const findSlots = async (slot, isStart: boolean): Promise<string> => {
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
