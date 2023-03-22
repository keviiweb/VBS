export interface KEIPS {
  id?: string;
  matnet: string;
  topCCA: string;
  allCCA: string;
  bonusCCA: string;
  contrasting: string;
  OSA: string;
  osaPercentile: string;
  roomDraw: string;
  semesterStay: string;
  fulfilled: string;
  contrastingStr?: string;
  fulfilledStr?: string;
  updated_at?: string;
  action?: any;
}

export interface KEIPSCCA {
  cca: string;
  cat: string;
  atte: string;
  perf: string;
  total: string;
}

export interface KEIPSBonus {
  cca: string;
  description: string;
  total: string;
}
