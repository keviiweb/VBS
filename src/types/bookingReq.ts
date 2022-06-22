export type BookingRequest = {
  id?: string;
  email: string;
  venue: string;
  date?: number;
  dateStr?: string;
  cca: string;
  timeSlots: string;
  purpose: string;
  isApproved?: boolean;
  isRejected?: boolean;
  isCancelled?: boolean;
  sessionEmail?: string;
  conflictRequest?: string;
  conflictRequestObj?: BookingRequest[];
  status?: string;
  reason?: string;
  action?: any;
};
