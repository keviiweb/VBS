import { timingSlotNumberToTimingMapping } from "@constants/timeslot";
import { numberToWeekday } from "@constants/weekdays";
import { monthNamesFull } from "@constants/months";

export const isInside = (want, check) => {
  // Check if want is inside check
  // Sample: "1,2,3"  is inside "4,5,6" ?
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

export const mapSlotToTiming = (data) => {
  const result = [];
  for (let key in data) {
    let map = timingSlotNumberToTimingMapping[Number(data[key])];
    result.push(map);
  }

  return result;
};

export const prettifyTiming = (data) => {
  let str = "";
  let count = 0;

  for (let key in data) {
    count += 1;
    if (count != data.length) {
      str += data[key] + ", ";
    } else {
      str += data[key];
    }
  }

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

  return `Unknown Date`;
};

export const convertDateToUnix = (date) => {
  const prettified = prettifyDate(date);
  if (prettified) {
    const parseDate = Date.parse(prettified);
    return parseDate ? Math.floor(parseDate / 1000) : 0;
  }
};

export const convertUnixToDate = (date) => {
  return new Date(date * 1000);
};

export const compareDate = (comparedDate, number) => {
  let compared = convertUnixToDate(comparedDate);
  let date = new Date();
  date.setDate(date.getDate() + Number(number));

  return date <= compared;
};

export const convertSlotToArray = (slots, reverse = false) => {
  if (reverse) {
    const result = slots.split(",");
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

export const findSlots = async (slot, isStart) => {
  for (let i in timingSlotNumberToTimingMapping) {
    if (timingSlotNumberToTimingMapping[i].includes(slot)) {
      const split = timingSlotNumberToTimingMapping[i].split("-");
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
