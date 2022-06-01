import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { monthNamesFull } from "@constants/months";
import { useState, useEffect, useRef } from "react";

export default function CalendarWidget({
  selectedDate,
  calendarMin,
  calendarMax,
}) {
  const [currentDate, setDate] = useState(new Date());
  const [minDate, setMinDate] = useState(new Date());
  const [maxDate, setMaxDate] = useState(new Date());

  const min = useRef(0);
  const max = useRef(0);

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

  function addDays(date, days) {
    let result = new Date(date.getTime());
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
