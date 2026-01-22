export type UserRole = 'super_admin' | 'org_admin' | 'tour_leader' | 'participant';
export type TourStatus = 'draft' | 'planned' | 'active' | 'completed' | 'cancelled';
export type AttendanceStatus = 'present' | 'absent' | 'left_with_permission';
export type ExpenseCategory = 'transport' | 'accommodation' | 'food' | 'miscellaneous' | 'emergency';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AnnouncementType = 'general' | 'alert' | 'emergency' | 'reminder';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  health_notes?: string;
  passport_url?: string;
  medical_info_url?: string;
  dietary_requirements?: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  is_verified: boolean;
  verified_at?: string;
  verified_by?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: UserRole;
  joined_at: string;
  profile?: Profile;
}

export interface Tour {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: TourStatus;
  per_person_fee: number;
  total_budget: number;
  buffer_amount: number;
  max_participants?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  organization?: Organization;
  leaders?: TourLeader[];
  participants?: TourParticipant[];
}

export interface TourLeader {
  id: string;
  tour_id: string;
  user_id: string;
  is_primary: boolean;
  assigned_at: string;
  profile?: Profile;
}

export interface TourParticipant {
  id: string;
  tour_id: string;
  user_id: string;
  payment_status: string;
  amount_paid: number;
  joined_at: string;
  profile?: Profile;
}

export interface ItineraryDay {
  id: string;
  tour_id: string;
  day_number: number;
  date: string;
  title?: string;
  description?: string;
  created_at: string;
  locations?: ItineraryLocation[];
}

export interface ItineraryLocation {
  id: string;
  itinerary_day_id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  arrival_time?: string;
  departure_time?: string;
  sequence_order: number;
  notes?: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  tour_id: string;
  location_id?: string;
  user_id: string;
  status: AttendanceStatus;
  reason?: string;
  marked_by?: string;
  marked_at: string;
  synced_at?: string;
  profile?: Profile;
  location?: ItineraryLocation;
}

export interface Expense {
  id: string;
  tour_id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  vendor_name?: string;
  receipt_url?: string;
  currency: string;
  exchange_rate: number;
  created_by?: string;
  created_at: string;
}

export interface TourPhoto {
  id: string;
  tour_id: string;
  user_id: string;
  photo_url: string;
  caption?: string;
  created_at: string;
  profile?: Profile;
}

export interface Incident {
  id: string;
  tour_id: string;
  reported_by?: string;
  involved_users?: string[];
  title: string;
  description?: string;
  severity: IncidentSeverity;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  tour_id: string;
  created_by?: string;
  type: AnnouncementType;
  title: string;
  content: string;
  scheduled_for?: string;
  published_at: string;
  created_at: string;
}

export interface SOSAlert {
  id: string;
  tour_id: string;
  user_id: string;
  latitude?: number;
  longitude?: number;
  message?: string;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  profile?: Profile;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}
