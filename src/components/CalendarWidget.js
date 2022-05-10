import Calendar from "react-calendar";

export default function CalendarWidget() {
  const [value, onChange] = useState(new Date());
  return <Calendar onChange={onChange} value={value} />;
}
