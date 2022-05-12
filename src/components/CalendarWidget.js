import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { monthNamesFull } from "@constants/months";
import React, { useState, useEffect } from "react";

export default function CalendarWidget({
  selectedDate,
  calendarMin,
  calendarMax,
}) {
  const [currentDate, setDate] = useState(new Date());
  const [minDate, _setMinDate] = useState(addDays(currentDate, calendarMin));
  const [maxDate, _setMaxDate] = useState(addDays(currentDate, calendarMax));

  function addDays(date, days) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  const handleChange = async (date) => {
    setDate(date);
    await selectedDate(date);
  };

  const displayLabel = (date, label, locale, view) => {
    let month = monthNamesFull[date.getMonth()];
    let year = date.getFullYear();
    if (view === "month") {
      return `${month}`;
    }
    return `${year}`;
  };

  return (
    <Calendar
      onChange={handleChange}
      value={currentDate}
      minDate={minDate}
      minDetail="year"
      maxDate={maxDate}
      next2Label={null}
      prev2Label={null}
      navigationLabel={({ date, label, locale, view }) =>
        displayLabel(date, label, locale, view)
      }
    />
  );
}
