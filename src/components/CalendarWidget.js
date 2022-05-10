import Calendar from "react-calendar";
import React, { useState } from "react";
import 'react-calendar/dist/Calendar.css';
import { monthNamesFull } from "@constants/months";

export default function CalendarWidget() {
  const minDate = new Date();
  minDate.setDate(new Date().getDate() + Number(process.env.CALENDAR_MIN_DAY));

  const maxDate = new Date();
  maxDate.setDate(new Date().getDate() + Number(process.env.CALENDAR_MAX_DAY));

  const [date, setDate] = useState(new Date());
  const handleChange = (date) => {
    setDate(date);
  }

  const displayLabel = (date, label, locale, view) => {
    var month = monthNamesFull[date.getMonth()];
    var year = date.getFullYear();
    if (view === "month") {
      return `${month}`;
    }
    return `${year}`;
  }

  return (
    <Calendar
      onChange={handleChange}
      value={date}
      minDate={minDate}
      minDetail="year"
      next2Label={null}
      prev2Label={null}
      navigationLabel={displayLabel}
    />
  );
}
