import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import React from 'react';

export default function BookingCalendar({
  slotMin,
  slotMax,
  events,
  eventMouseEnter,
  eventMouseLeave,
}) {
  return (
    <FullCalendar
      plugins={[interactionPlugin, timeGridPlugin, listPlugin]}
      initialView='timeGridWeek'
      nowIndicator
      editable={false}
      slotMinTime={slotMin}
      slotMaxTime={slotMax}
      allDaySlot={false}
      events={events}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'timeGridWeek,listWeek',
      }}
      eventMouseEnter={eventMouseEnter}
      eventMouseLeave={eventMouseLeave}
    />
  );
}