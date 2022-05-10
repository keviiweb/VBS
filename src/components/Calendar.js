import Calendar from "react-calendar";

export default function Calendar() {
  const [value, onChange] = useState(new Date());
  return <Calendar onChange={onChange} value={value} />;
}
