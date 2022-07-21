import React, { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import moment from 'moment-timezone';

import { monthNamesFull } from '@constants/sys/months';

/**
 * Renders a small calendar that allow users to select dates.
 *
 * The dates are limited by the calendarMin and calendarMax variables.
 *
 * Users can only click on dates that are between currentDate() + calendarMin and currentDate() + calendarMax
 *
 * @param param0 Callback function for selected date, and minimum and maximum date range
 * @returns
 */
export default function CalendarWidget({
  selectedDate,
  calendarMin,
  calendarMax,
}) {
  const locale: string = 'Asia/Singapore';
  const [currentDate, setDate] = useState(moment().tz(locale).toDate());
  const [minDate, setMinDate] = useState(moment().tz(locale).toDate());
  const [maxDate, setMaxDate] = useState(moment().tz(locale).toDate());

  const min = useRef(0);
  const max = useRef(0);

  function addDays(date: Date, days: number) {
    return moment.tz(date, locale).add(days, 'days').toDate();
  }

  useEffect(() => {
    async function setDates() {
      const current = new Date();
      setMinDate(addDays(current, Number(min.current)));
      setMaxDate(addDays(current, Number(max.current)));
    }

    if (calendarMax && calendarMin) {
      min.current = calendarMin;
      max.current = calendarMax;
      setDates();
    }
  }, [calendarMin, calendarMax]);

  const handleChange = async (date: Date) => {
    const currDate = moment.tz(date, 'Asia/Singapore').toDate();
    setDate(currDate);
    await selectedDate(currDate);
  };

  const displayLabel = (date: Date, view: string) => {
    const month = monthNamesFull[date.getMonth()];
    const year = date.getFullYear();
    if (view === 'month') {
      return `${month}`;
    }
    return `${year}`;
  };

  return (
    <Calendar
      onChange={handleChange}
      value={currentDate}
      minDate={minDate}
      minDetail='year'
      maxDate={maxDate}
      next2Label={null}
      prev2Label={null}
      navigationLabel={({ date, view }) => displayLabel(date, view)}
    />
  );
}
