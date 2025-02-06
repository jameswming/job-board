export interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  zip_code: string;
  created_at: string;
  distance?: number; // Distance from user in miles
} 