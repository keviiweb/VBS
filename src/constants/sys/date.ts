import { numberToWeekday } from '@constants/sys/weekdays';
import { monthNamesFull } from '@constants/sys/months';

import moment from 'moment-timezone';

export const locale: string = process.env.TZ !== undefined
  ? process.env.TZ
  : 'Asia/Singapore';
export const timeFormat: string = 'YYYY-MM-DD';

/**
 * Gets the current date in Date object
 *
 * @returns Date object representing today's date
 */
export const fetchCurrentDate = (): Date => {
  return moment().tz(locale).toDate();
};

/**
 * Add * number of days to the particular date object
 *
 * @param date Date object
 * @param locale Timezone
 * @param days Number of days to add
 * @returns Date object
 */
export const addDays = (date: Date, locale: string, days: number) => {
  return moment.tz(date, locale).add(days, 'days').toDate();
};

/**
 * Converts a string to Unix timestamp in seconds to store
 * in the database.
 *
 * @param date A string in YYYY-MM-DD format
 * @returns UNIX timestamp in seconds
 */
export const convertDateToUnix = (date: string): number => {
  const prettified = moment.tz(date, timeFormat, true, locale).startOf('day');
  if (prettified.isValid()) {
    return Math.floor(prettified.valueOf() / 1000);
  } else {
    return 0;
  }
};

/**
 * Converts a Unix timestamp in seconds to a Date object
 *
 * Checks if the date provided is within 1 year of today's date,
 * else marks it as invalid and return null
 *
 * @param date
 * @returns A Date object or Null
 */
export const convertUnixToDate = (date: number): Date | null => {
  if (date < 0) {
    return null;
  }

  const converted = moment.tz(date * 1000, locale).startOf('day');
  if (converted.isValid()) {
    const today = moment.tz(new Date(), locale).startOf('day');
    const diff = converted.diff(today, 'years', true);
    if (diff > 1 || diff < -1) {
      return null;
    }
    return converted.toDate();
  } else {
    return null;
  }
};

/**
 * Compares the date between today's date + number and the comparedDate
 *
 * First, an object with the current date is created.
 *
 * Next, the object is added with the number of dates as specified
 *
 * Lastly, the object is checked against the comparedDate and returns true
 * if the date is before the comparedDate
 *
 * @param comparedDate The date to be compared in Unix timestamp
 * @param number Number of days
 * @returns Boolean whether date exceeds compared date
 */
export const compareDate = (comparedDate: number, number: number): boolean => {
  const compared: Date | null = convertUnixToDate(comparedDate);

  if (compared !== null) {
    let date: Date = fetchCurrentDate();
    date = addDays(date, locale, number);

    return date <= compared;
  } else {
    return false;
  }
};

/**
 * Check whether the Date object is valid
 *
 * @param d Date object to be checked
 * @returns Boolean whether the object is a valid Date
 */
export const isValidDate = (d: Date): boolean => {
  if (d === null || d === undefined) {
    return false;
  }

  if (Object.prototype.toString.call(d) === '[object Date]') {
    if (isNaN(d.getTime())) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
};

/**
 * Converts a Date object into a string in YYYY-MM-DD format
 *
 * @param date Date object
 * @returns A string in YYYY-MM-DD format if valid, or 'Unknown Date' if not valid
 */
export const dateISO = (date: Date): string => {
  if (date !== undefined && isValidDate(date)) {
    return moment.tz(date, locale).startOf('day').format(timeFormat);
  }

  return 'Unknown Date';
};

/**
 * Converts a Date object into a string in specified format
 *
 * eg. Thursday, 21 July 2022
 *
 * @param date Date object
 * @returns A string in specified format or 'Unknown Date' if date not valid
 */
export const prettifyDate = (date: Date): string => {
  if (date !== undefined && isValidDate(date)) {
    const dateObj = moment.tz(date, locale);
    const day = numberToWeekday[dateObj.day()];
    const month = monthNamesFull[dateObj.month()];
    const prettyDate = `${day}, ${dateObj.format(
      'DD',
    )} ${month} ${dateObj.year()}`;
    return prettyDate;
  }

  return 'Unknown Date';
};

/**
 * Calculates the duration between two timings
 *
 * @param start Start time eg. 0700
 * @param end End time eg. 1300
 * @returns Duration between the two hours in a Promise
 */
export const calculateDuration = async (
  start: number,
  end: number,
): Promise<number> => {
  let duration: number = 0;

  const s: string = start.toString().padStart(4, '0');
  const e: string = end.toString().padStart(4, '0');

  const startH = `${s.toString().slice(0, 2)}:${s.toString().slice(2)}:00`;
  const endH = `${e.toString().slice(0, 2)}:${e.toString().slice(2)}:00`;

  const startTimeM = moment(startH, 'HH:mm:ss');
  const endTimeM = moment(endH, 'HH:mm:ss');
  const durationH = moment.duration(endTimeM.diff(startTimeM));
  duration = durationH.asHours();

  return duration;
};
