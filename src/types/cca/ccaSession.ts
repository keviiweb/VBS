export type CCASession = {
  id?: string;
  ccaID: string;
  ccaName: string;
  name: string;
  date: number;
  dateStr?: string;
  time: string;
  duration?: number;
  editable?: boolean;
  optional?: boolean;
  remarks?: string;
  ldrNotes?: string;
  updated_at?: string;
};
