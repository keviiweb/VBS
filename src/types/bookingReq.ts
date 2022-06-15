export type BookingRequest = {
  id?: string;
  email: string;
  venue: string;
  date: number | string;
  cca: string;
  timeSlots: string;
  purpose: string;
  isApproved?: boolean;
  isRejected?: boolean;
  isCancelled?: boolean;
  sessionEmail: string;
  conflictRequest?: string;
};
