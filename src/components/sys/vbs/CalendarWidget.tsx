import React, { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import moment from 'moment-timezone';

import { monthNamesFull } from '@constants/sys/months';
import { addDays, fetchCurrentDate, locale } from '@constants/sys/date';

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
  const [currentDate, setDate] = useState(fetchCurrentDate());
  const [minDate, setMinDate] = useState(fetchCurrentDate());
  const [maxDate, setMaxDate] = useState(fetchCurrentDate());

  const min = useRef(0);
  const max = useRef(0);

  useEffect(() => {
    async function setDates(minField: number, maxField: number) {
      min.current = minField;
      max.current = maxField;

      const currentDateField: Date = fetchCurrentDate();
      setMinDate(addDays(currentDateField, locale, Number(min.current)));
      setMaxDate(addDays(currentDateField, locale, Number(max.current)));
    }

    if (
      calendarMax !== null &&
      calendarMax !== undefined &&
      calendarMin !== null &&
      calendarMin !== undefined
    ) {
      setDates(Number(calendarMin), Number(calendarMax));
    }
  }, [calendarMin, calendarMax]);

  const handleChange = async (date: Date) => {
    const currDate = moment.tz(date, locale).toDate();
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
