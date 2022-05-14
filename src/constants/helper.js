import { useSession } from "next-auth/react";
import { timingSlotNumberToTimingMapping } from "@constants/slotNumberToTimingMapping";
import { numberToWeekday } from "@constants/weekdays";
import { monthNamesFull } from "@constants/months";

export const isInside = (want, check) => {
 // Check if want is inside check
 // Sample: "1,2,3"  is inside "4,5,6" ?
 const wantArr = convertSlotToArray(want, true);
 const checkArr = convertSlotToArray(check, true);

 for (let i in wantArr) {
  if (checkArr.includes(i)) {
    return true;
  }
 }

 return false;
}

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
};

export const convertDateToUnix = (date) => {
  const parseDate = Date.parse(date);
  return Math.floor(parseDate / 1000);
};

export const convertUnixToDate = (date) => {
  return new Date(date * 1000);
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

export const currentSession = () => {
  var session = null;
  if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    session = {
      expires: "1",
      user: {
        username: "Test user",
        email: "testing@test.com",
        admin: true,
        studentID: "A7654321",
      },
    };
  } else {
    const { data: session, _status } = useSession();
    if (session) {
      return session;
    }
  }

  return session;
};
