export type Booking = {
  id?: string;
  email: string;
  venue: string;
  date: number;
  dateStr?: string;
  cca: string;
  timingSlot?: number;
  timeSlot?: string;
  startHour?: string;
  endHour?: string;
  title?: string;
  purpose: string;
  start?: string;
  end?: string;
};
