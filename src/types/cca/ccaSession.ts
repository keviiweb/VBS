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
  editableStr?: string;
  optionalStr?: string;
  expectedM?: string;
  remarks?: string;
  ldrNotes?: string;
  action?: any;
  updated_at?: string;
};
