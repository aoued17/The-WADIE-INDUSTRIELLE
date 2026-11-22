export type Language = 'ar' | 'fr';

export type RoutePath =
  | '/'
  | '/about'
  | '/services'
  | '/equipment'
  | '/projects'
  | '/booking'
  | '/contact'
  | '/admin';

export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'completed';

export interface ServiceItem {
  id: number;
  name_ar: string;
  name_fr: string;
  description_ar: string;
  description_fr: string;
  image: string;
}

export interface EquipmentItem {
  id: number;
  name_ar: string;
  name_fr: string;
  description_ar: string;
  description_fr: string;
  specs_ar: string | null;
  specs_fr: string | null;
  image: string;
  category: 'rental' | 'sales';
  availability: 'available' | 'limited' | 'unavailable';
}

export interface ProjectItem {
  id: number;
  title_ar: string;
  title_fr: string;
  description_ar: string;
  description_fr: string;
  category_ar: string | null;
  category_fr: string | null;
  image: string;
}

export interface BookingRecord {
  id: number;
  booking_reference: string;
  customer_name: string;
  phone: string;
  email: string | null;
  service: string;
  equipment: string | null;
  appointment_date: string;
  appointment_time: string;
  project_location: string;
  message: string | null;
  status: BookingStatus;
  created_at: string;
}

export interface CatalogResponse {
  source: string;
  dbConnected: boolean;
  services: ServiceItem[];
  equipment: EquipmentItem[];
  projects: ProjectItem[];
  seededInDb?: boolean;
}
