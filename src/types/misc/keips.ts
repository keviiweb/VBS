export interface KEIPS {
  id?: string;
  matnet: string;
  topCCA: string;
  allCCA: string;
  bonusCCA: string;
  contrasting: boolean;
  OSA: number;
  osaPercentile: number;
  roomDraw: number;
  semesterStay: string;
  fulfilled: boolean;
  contrastingStr?: string;
  fulfilledStr?: string;
  updated_at?: string;
  action?: any;
}

export interface KEIPSCCA {
  cca: string;
  cat: string;
  atte: number;
  perf: number;
  total: number;
}

export interface KEIPSBonus {
  cca: string;
  description: string;
  total: number;
}
