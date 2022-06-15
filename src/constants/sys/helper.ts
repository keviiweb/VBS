import {
  timingSlotNumberToTimingMapping,
  timeSlots,
} from '@constants/sys/timeslot';
import { numberToWeekday } from '@constants/sys/weekdays';
import { monthNamesFull } from '@constants/sys/months';
import moment from 'moment-timezone';

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
      let map = timingSlotNumberToTimingMapping[Number(data[key])];
      result.push(map);
    }

    return result;
  } else {
    let map: string = timingSlotNumberToTimingMapping[Number(data)];
    return map;
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

export const prettifyDate = (date: Date): string => {
  if (date) {
    const dateObj = moment(date).tz('Asia/Singapore');
    const day = numberToWeekday[dateObj.day()];
    const month = monthNamesFull[dateObj.month()];
    const prettyDate = `${day}, ${dateObj.format(
      'DD',
    )} ${month} ${dateObj.year()}`;
    return prettyDate;
  }

  return `Unknown Date`;
};

export const dateISO = (date: Date | string): string => {
  if (date) {
    const dateObj = new Date(date);
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    const prettyDate = `${dateObj.getFullYear()}-${month}-${day}`;
    return prettyDate;
  }

  return `Unknown Date`;
};

export const convertDateToUnix = (date: string): number => {
  const prettified = Number(moment(date).tz('Asia/Singapore').format('x'));
  return Math.floor(prettified / 1000);
};

export const convertUnixToDate = (date: number): Date => {
  return new Date(date * 1000);
};

export const compareDate = (comparedDate: number, number: number): boolean => {
  let compared = convertUnixToDate(comparedDate);
  let date = new Date();
  date.setDate(date.getDate() + Number(number));

  return date <= compared;
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
  if (slot) {
    return timeSlots[slot];
  }

  return null;
};
