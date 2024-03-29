export interface Booking {
  id?: string;
  email: string;
  venue: string;
  date: number;
  dateStr?: string;
  cca: string;
  timingSlot?: number;
  timeSlots?: string;
  startHour?: string;
  endHour?: string;
  title?: string;
  purpose: string;
  start?: string;
  end?: string;
  sessionEmail?: string;
  userName?: string;
  updated_at?: string;
}
