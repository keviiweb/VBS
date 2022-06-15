import React, { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { monthNamesFull } from '@constants/sys/months';
import moment from 'moment-timezone';

export default function CalendarWidget({
  selectedDate,
  calendarMin,
  calendarMax,
}) {
  const locale = 'Asia/Singapore';
  const [currentDate, setDate] = useState(moment().tz(locale).toDate());
  const [minDate, setMinDate] = useState(moment().tz(locale).toDate());
  const [maxDate, setMaxDate] = useState(moment().tz(locale).toDate());

  const min = useRef(0);
  const max = useRef(0);

  function addDays(date: Date, days: number) {
    return moment(date, 'YYYY-MM-DD').add(days, 'days').toDate();
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
    const currDate = moment(date).tz('Asia/Singapore').toDate();
    setDate(currDate);
    await selectedDate(currDate);
  };

  const displayLabel = (date, view) => {
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
