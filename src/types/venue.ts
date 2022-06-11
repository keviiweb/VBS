export type Venue = {
  id: string;
  name: string;
  image: string;
  openingHours: string;
  description: string;
  visible: boolean;
  capacity: number;
  parentVenue: string;
  isChildVenue: boolean;
  isInstantBook: boolean;
};
