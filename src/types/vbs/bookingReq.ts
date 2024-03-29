export interface BookingRequest {
  id?: string;
  email: string;
  userName?: string;
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
  editable?: boolean;
  action?: any;
  updated_at?: string;
}
