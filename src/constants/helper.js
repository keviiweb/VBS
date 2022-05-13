import { useSession } from "next-auth/react";
import { timingSlotNumberToTimingMapping } from "./slotNumberToTimingMapping";

export const mapSlotToTiming = (data) => {
  const result = [];
  for (let key in data) {
    let map = timingSlotNumberToTimingMapping[Number(data[key])];
    result.push(map);
  }

  return result;
};

export const convertDateToUnix = (date) => {
  const parseDate = Date.parse(date);
  return Math.floor(parseDate / 1000);
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
