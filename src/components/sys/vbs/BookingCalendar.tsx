import React from 'react';
import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';

/**
 * Renders a calendar that is populated with the approved venue bookings
 *
 * slotMinTime: minimum time period eg. 0700
 *
 * slotMaxTime: maximum time period eg. 2330
 *
 * events: List of Bookings
 *
 * eventClick: Function that is triggered when user click on box
 *
 * eventMouseEnter: Function that is triggered when user hovers on box
 *
 * eventMouseLeave: Function that is triggered when user move away from box
 * @param param0 Parameters for the calendar
 * @returns A calendar
 */
export default function BookingCalendar({
  slotMin,
  slotMax,
  events,
  eventClick,
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
      eventClick={eventClick}
    />
  );
}
