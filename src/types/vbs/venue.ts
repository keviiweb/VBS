export type Venue = {
  id?: string;
  name: string;
  image?: string;
  openingHours: string;
  description: string;
  visible: boolean;
  capacity: number;
  parentVenue: string;
  parentVenueName?: string;
  isChildVenue: boolean;
  isInstantBook: boolean;
  isAvailable?: string;
  childVenue?: string;
  instantBook?: string;
  action?: any;
  updated_at?: string;
};
