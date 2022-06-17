import { numberToWeekday } from '@constants/sys/weekdays';
import { monthNamesFull } from '@constants/sys/months';
import moment from 'moment-timezone';

export const convertDateToUnix = (date: string): number => {
  const prettified = moment(date, 'YYYY-MM-DD', true).tz('Asia/Singapore');
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

  const converted = moment(date * 1000);
  if (converted.isValid()) {
    const today = moment();
    const diff = converted.diff(today, 'years', true);
    if (diff > 1 || diff < -1) {
      return null;
    }
    return converted.tz('Asia/Singapore').toDate();
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
    return moment(date, 'YYYY-MM-DD', true)
      .tz('Asia/Singapore')
      .format('YYYY-MM-DD');
  }

  return `Unknown Date`;
};

export const prettifyDate = (date: Date): string => {
  if (date && isValidDate(date)) {
    const dateObj = moment(date, 'YYYY-MM-DD', true).tz('Asia/Singapore');
    const day = numberToWeekday[dateObj.day()];
    const month = monthNamesFull[dateObj.month()];
    const prettyDate = `${day}, ${dateObj.format(
      'DD',
    )} ${month} ${dateObj.year()}`;
    return prettyDate;
  }

  return `Unknown Date`;
};
