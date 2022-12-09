export interface User {
  id?: string;
  name: string;
  email: string;
  username?: string;
  admin: number;
  adminStr?: string;
  acceptedTerm?: boolean;
  acceptedTermStr?: string;
  updated_at?: string;
  action?: any;
}
