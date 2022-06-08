import {
  timingSlotNumberToTimingMapping,
  timeSlots,
} from '@constants/sys/timeslot';
import { numberToWeekday } from '@constants/sys/weekdays';
import { monthNamesFull } from '@constants/sys/months';

export const convertSlotToArray = (slots, reverse = false) => {
  if (reverse) {
    const result = slots.split(',');

    Object.keys(result).forEach((key) => {
      result[key] = Number(result[key]);
    });

    return result;
  }
  const result = [];

  Object.keys(slots).forEach((key) => {
    if (slots[key]) {
      result.push(slots[key].id);
    }
  });

  return result.toString();
};

export const isInside = (want, check) => {
  // Check if want is inside check
  // Sample: "1,2,3"  is inside "4,5,6" ?
  const wantArr = convertSlotToArray(want, true);
  const checkArr = convertSlotToArray(check, true);

  let result = false;
  Object.keys(wantArr).forEach((obj) => {
    const i = checkArr.length;
    while (i >= 0) {
      if (Number(checkArr[i]) === Number(wantArr[obj])) {
        result = true;
      }
    }
  });

  return result;
};

export const mapSlotToTiming = (data) => {
  if (Array.isArray(data)) {
    const result = [];

    Object.keys(data).forEach((key) => {
      const map = timingSlotNumberToTimingMapping[Number(data[key])];
      result.push(map);
    });

    return result;
  }
  const map = timingSlotNumberToTimingMapping[Number(data)];
  return map;
};

export const prettifyTiming = (data) => {
  let str = '';
  let count = 0;

  Object.keys(data).forEach((key) => {
    count += 1;
    if (count !== data.length) {
      str += `${data[key]}, `;
    } else {
      str += data[key];
    }
  });

  return str;
};

export const prettifyDate = (date) => {
  if (date) {
    const dateObj = new Date(date);
    const day = numberToWeekday[dateObj.getDay()];
    const month = monthNamesFull[dateObj.getMonth()];
    const prettyDate = `${day}, ${dateObj.getDate()} ${month} ${dateObj.getFullYear()}`;
    return prettyDate;
  }

  return 'Unknown Date';
};

export const dateISO = (date) => {
  if (date) {
    const dateObj = new Date(date);
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    const prettyDate = `${dateObj.getFullYear()}-${month}-${day}`;
    return prettyDate;
  }

  return 'Unknown Date';
};

export const convertDateToUnix = (date) => {
  const prettified = prettifyDate(date);
  if (prettified) {
    const parseDate = Date.parse(prettified);
    return parseDate ? Math.floor(parseDate / 1000) : 0;
  }

  return 0;
};

export const convertUnixToDate = (date) => new Date(date * 1000);

export const compareDate = (comparedDate, number) => {
  const compared = convertUnixToDate(comparedDate);
  const date = new Date();
  date.setDate(date.getDate() + Number(number));

  return date <= compared;
};

export const findSlots = async (slot, isStart) => {
  let result = false;
  let answer = null;

  Object.keys(timingSlotNumberToTimingMapping).forEach((i) => {
    if (timingSlotNumberToTimingMapping[i].includes(slot)) {
      const split = timingSlotNumberToTimingMapping[i].split('-');
      if (split[0].trim() === slot && isStart) {
        if (!result) {
          result = true;
          answer = i;
        }
      }

      if (split[1].trim() === slot && !isStart) {
        if (!result) {
          result = true;
          answer = i;
        }
      }
    }
  });

  if (!result) {
    return null;
  }
  return answer;
};

export const findSlotsByID = async (slot) => {
  if (slot) {
    return timeSlots[slot];
  }

  return null;
};
