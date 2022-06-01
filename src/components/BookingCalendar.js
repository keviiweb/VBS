import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";

export default function BookingCalendar({ slotMin, slotMax, events }) {
  return (
    <FullCalendar
      plugins={[interactionPlugin, timeGridPlugin, listPlugin]}
      initialView="timeGridWeek"
      nowIndicator={true}
      editable={false}
      slotMinTime={slotMin}
      slotMaxTime={slotMax}
      allDaySlot={false}
      initialEvents={events}
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "timeGridWeek,listWeek",
      }}
    />
  );
}
