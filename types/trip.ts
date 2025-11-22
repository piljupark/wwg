export type TransportMode = 'DRIVING' | 'TRANSIT' | 'WALKING' | 'BICYCLING';

export interface Destination {
  id: string;
  name: string;
  address: string;
  placeId?: string;
  lat: number;
  lng: number;
  description?: string;
  photos?: string[];
  rating?: number;
  visitDuration?: number; // 분 단위
}

export interface DayPlan {
  id: string;
  day: number;
  date?: Date;
  destinations: Destination[];
  transportMode: TransportMode;
  notes?: string;
}

export interface TripPlan {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  days: DayPlan[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  sharedWith?: string[]; // user IDs
}

export interface RouteInfo {
  distance: string;
  duration: string;
  steps: any[];
}
