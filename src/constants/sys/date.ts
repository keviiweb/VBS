import { numberToWeekday } from '@constants/sys/weekdays';
import { monthNamesFull } from '@constants/sys/months';

import moment from 'moment-timezone';

export const convertDateToUnix = (date: string): number => {
  const prettified = moment
    .tz(date, 'YYYY-MM-DD', true, 'Asia/Singapore')
    .startOf('day');
  if (prettified.isValid()) {
    return Math.floor(prettified.valueOf() / 1000);
  } else {
    return 0;
  }
};

export const convertUnixToDate = (date: number): Date => {
  if (date < 0) {
    return null;
  }

  const converted = moment.tz(date * 1000, 'Asia/Singapore').startOf('day');
  if (converted.isValid()) {
    const today = moment.tz(new Date(), 'Asia/Singapore').startOf('day');
    const diff = converted.diff(today, 'years', true);
    if (diff > 1 || diff < -1) {
      return null;
    }
    return converted.toDate();
  } else {
    return null;
  }
};

export const compareDate = (comparedDate: number, number: number): boolean => {
  let compared = convertUnixToDate(comparedDate);
  let date = new Date();
  date.setDate(date.getDate() + Number(number));

  return date <= compared;
};

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

export const dateISO = (date: Date): string => {
  if (date && isValidDate(date)) {
    return moment
      .tz(date, 'Asia/Singapore')
      .startOf('day')
      .format('YYYY-MM-DD');
  }

  return `Unknown Date`;
};

export const prettifyDate = (date: Date): string => {
  if (date && isValidDate(date)) {
    const dateObj = moment.tz(date, 'Asia/Singapore');
    const day = numberToWeekday[dateObj.day()];
    const month = monthNamesFull[dateObj.month()];
    const prettyDate = `${day}, ${dateObj.format(
      'DD',
    )} ${month} ${dateObj.year()}`;
    return prettyDate;
  }

  return `Unknown Date`;
};
