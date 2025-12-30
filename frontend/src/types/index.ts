export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'organizer' | 'participant';
  organization?: string;
  isActive: boolean;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  organizer: User;
  organization: string;
  status: 'draft' | 'planned' | 'ongoing' | 'completed' | 'cancelled';
  maxParticipants: number;
  currentParticipants: number;
  requirements: string[];
  itinerary: ItineraryDay[];
  images: Image[];
  documents: Document[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItineraryDay {
  day: number;
  date: Date;
  activities: string[];
  accommodations: string;
  meals: string[];
}

export interface Image {
  url: string;
  caption: string;
}

export interface Document {
  name: string;
  url: string;
  type: string;
}

export interface Participant {
  id: string;
  user: User;
  tour: Tour;
  registrationDate: Date;
  status: 'pending' | 'confirmed' | 'waitlisted' | 'cancelled' | 'completed';
  emergencyContact: EmergencyContact;
  medicalInfo: MedicalInfo;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  amountPaid: number;
  totalAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface MedicalInfo {
  conditions: string[];
  allergies: string[];
  medications: string[];
  dietaryRestrictions: string[];
}

export interface Budget {
  id: string;
  tour: Tour;
  name: string;
  description?: string;
  totalAmount: number;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  categories: BudgetCategory[];
  status: 'draft' | 'active' | 'locked' | 'archived';
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetCategory {
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
}

export interface Expense {
  id: string;
  tour: Tour;
  budget: Budget;
  category: string;
  description: string;
  amount: number;
  date: Date;
  paidBy: User;
  receipt?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}