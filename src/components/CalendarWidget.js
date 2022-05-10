import Calendar from "react-calendar";
import { useState } from "react";

export default function CalendarWidget() {
  const [value, onChange] = useState(new Date());
  return <Calendar onChange={onChange} value={value} />;
}
