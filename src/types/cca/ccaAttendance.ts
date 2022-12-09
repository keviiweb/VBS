export interface CCAAttendance {
  id?: string;
  date?: number;
  dateStr?: string;
  durationStr?: string;
  sessionID?: string;
  sessionEmail?: string;
  sessionName?: string;
  ccaID: string;
  ccaAttendance: number;
  ccaName?: string;
  time?: string;
  optional?: string;
  action?: any;
  updated_at?: string;
}
