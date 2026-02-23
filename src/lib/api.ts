/**
 * API Client
 * Centralized API service with type-safe methods
 */

import { config } from "@/config";

// ============================================================================
// Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tour types matching backend
export interface TourData {
  id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  destination?: string;
  price?: string;
  status: "planned" | "ongoing" | "completed" | "cancelled";
  content?: string;
  created_by?: number;
  created_at: string;
  assigned_leader_id?: number;
  leader_assigned_at?: string;
  participant_count?: number;
  leader_name?: string;
  leader_email?: string;
}

export interface UserData {
  id: number;
  email: string;
  name: string;
  role: "admin" | "guide" | "tourist";
  created_at: string;
}

export interface IncidentData {
  id: number;
  tour_id: number;
  reported_by?: number;
  title: string;
  description?: string;
  location?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "RESOLVED";
  created_at: string;
  updated_at?: string;
}

export interface AttendanceData {
  id: number;
  user_id: number;
  tour_id: number;
  date: string;
  status: "present" | "absent" | "late" | "left_with_permission";
  checkpoint_id?: number;
  verified_by?: number;
  verification_time?: string;
  location_lat?: number;
  location_lng?: number;
  created_at?: string;
  user_name?: string;
  user_email?: string;
}

export interface AnnouncementData {
  id: number;
  title: string;
  content: string;
  tour_id?: number;
  created_at: string;
}

export interface ItineraryData {
  id: number;
  tour_id: number;
  route_id?: number;
  date: string;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  created_at: string;
  updated_at?: string;
}

export interface AccommodationData {
  id: number;
  tour_id: number;
  name: string;
  address?: string;
  check_in_date?: string;
  check_out_date?: string;
  contact_number?: string;
  created_at?: string;
}

export interface RoomAssignmentData {
  id: number;
  accommodation_id: number;
  user_id: number;
  room_number?: string;
  room_type?: string;
  notes?: string;
  profile?: {
    full_name: string;
  };
}

// Photo types
export interface PhotoData {
  id: number;
  tour_id: number;
  user_id: number;
  photo_url: string;
  caption?: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

// ============================================================================
// Token Management
// ============================================================================

class TokenManager {
  private static instance: TokenManager;

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(config.auth.tokenKey);
  }

  setToken(token: string): void {
    if (typeof window === "undefined") return;

    // Store in localStorage for API calls
    localStorage.setItem(config.auth.tokenKey, token);

    // Store in cookie for middleware (with security flags)
    const secure = window.location.protocol === "https:";
    document.cookie = `${config.auth.tokenKey}=${token}; path=/; max-age=${config.auth.tokenExpiry}; SameSite=Lax${secure ? "; Secure" : ""}`;
  }

  removeToken(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem(config.auth.userKey);
    document.cookie = `${config.auth.tokenKey}=; path=/; max-age=0`;
  }

  getUser<T = UserData>(): T | null {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem(config.auth.userKey);
    return user ? JSON.parse(user) : null;
  }

  setUser(user: UserData): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(config.auth.userKey, JSON.stringify(user));
  }

  decodeToken(): { id: number; email: string; role: string; exp: number } | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const decoded = this.decodeToken();
    if (!decoded) return true;
    return decoded.exp * 1000 < Date.now();
  }
}

export const tokenManager = TokenManager.getInstance();

// ============================================================================
// API Client
// ============================================================================

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = tokenManager.getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle 401 - token expired/invalid
        if (response.status === 401) {
          tokenManager.removeToken();
          if (typeof window !== "undefined" && !window.location.pathname.includes("/auth")) {
            window.location.href = "/auth/login";
          }
        }

        return {
          success: false,
          error: data.error || data.message || `Request failed with status ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.data ?? data,
        message: data.message,
      };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // HTTP Methods
  get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// Create API client instance
const apiClient = new ApiClient(`${config.api.baseUrl}/api`);

// ============================================================================
// API Services
// ============================================================================

/**
 * Authentication API
 */
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<{ token: string; user: UserData }>("/auth/login", { email, password }),

  register: (data: { email: string; password: string; name: string; role: string }) =>
    apiClient.post<{ token: string; user: UserData }>("/auth/register", data),

  getProfile: () => apiClient.get<UserData>("/auth/profile"),

  getLeaders: () => apiClient.get<UserData[]>("/auth/leaders"),
};

/**
 * Tours API
 */
export const tourApi = {
  getAll: (filters?: { status?: string; leader_id?: number }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.leader_id) params.append("leader_id", String(filters.leader_id));
    const query = params.toString();
    return apiClient.get<TourData[]>(`/tours${query ? `?${query}` : ""}`);
  },

  getById: (id: number) => apiClient.get<TourData>(`/tours/${id}`),

  getUpcoming: () => apiClient.get<TourData[]>("/tours/upcoming"),

  getOngoing: () => apiClient.get<TourData[]>("/tours/ongoing"),

  getCompleted: () => apiClient.get<TourData[]>("/tours/completed"),

  getMyAssigned: () => apiClient.get<TourData[]>("/tours/my-assigned"),

  create: (data: Partial<TourData>) => apiClient.post<TourData>("/tours", data),

  update: (id: number, data: Partial<TourData>) => apiClient.put<TourData>(`/tours/${id}`, data),

  delete: (id: number) => apiClient.delete(`/tours/${id}`),

  assignLeader: (tourId: number, leaderId: number) =>
    apiClient.put<TourData>(`/tours/${tourId}/assign-leader`, { leader_id: leaderId }),

  unassignLeader: (tourId: number) => apiClient.delete<TourData>(`/tours/${tourId}/assign-leader`),
};

/**
 * Incidents API
 */
export const incidentApi = {
  getAll: (tourId?: number) => {
    const query = tourId ? `?tour_id=${tourId}` : "";
    return apiClient.get<IncidentData[]>(`/incidents${query}`);
  },

  getById: (id: number) => apiClient.get<IncidentData>(`/incidents/${id}`),

  create: (data: Partial<IncidentData>) => apiClient.post<IncidentData>("/incidents", data),

  triggerSOS: (data: { tour_id: number; location?: string; description?: string }) =>
    apiClient.post<IncidentData>("/incidents/sos", data),

  reportHealth: (data: {
    tour_id: number;
    health_category: string;
    description: string;
    location?: string;
    severity?: string;
  }) => apiClient.post<IncidentData>("/incidents/health", data),

  respond: (id: number) => apiClient.put<IncidentData>(`/incidents/${id}/respond`, {}),

  resolve: (id: number, resolutionNotes?: string) =>
    apiClient.put<IncidentData>(`/incidents/${id}/resolve`, { resolution_notes: resolutionNotes }),

  update: (id: number, data: Partial<IncidentData>) =>
    apiClient.patch<IncidentData>(`/incidents/${id}`, data),

  delete: (id: number) => apiClient.delete(`/incidents/${id}`),
};

/**
 * Attendance API
 */
export const attendanceApi = {
  getAll: (filters?: { tour_id?: number; user_id?: number; date?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.tour_id) params.append("tour_id", String(filters.tour_id));
    if (filters?.user_id) params.append("user_id", String(filters.user_id));
    if (filters?.date) params.append("date", filters.date);
    if (filters?.status) params.append("status", filters.status);
    const query = params.toString();
    return apiClient.get<AttendanceData[]>(`/attendance${query ? `?${query}` : ""}`);
  },

  getById: (id: number) => apiClient.get<AttendanceData>(`/attendance/${id}`),

  checkIn: (data: {
    tour_id: number;
    checkpoint_id?: number;
    location_lat: number;
    location_lng: number;
    date?: string;
    status?: string;
  }) => apiClient.post<AttendanceData>("/attendance/checkin", data),

  create: (data: Partial<AttendanceData>) => apiClient.post<AttendanceData>("/attendance", data),

  update: (id: number, data: Partial<AttendanceData>) =>
    apiClient.put<AttendanceData>(`/attendance/${id}`, data),

  verify: (id: number) => apiClient.put<AttendanceData>(`/attendance/${id}/verify`, {}),

  delete: (id: number) => apiClient.delete(`/attendance/${id}`),
};

/**
 * Announcements API
 */
export const announcementApi = {
  getAll: (tourId?: number) => {
    const query = tourId ? `?tour_id=${tourId}` : "";
    return apiClient.get<AnnouncementData[]>(`/announcements${query}`);
  },

  getById: (id: number) => apiClient.get<AnnouncementData>(`/announcements/${id}`),

  create: (data: Partial<AnnouncementData>) =>
    apiClient.post<AnnouncementData>("/announcements", data),

  update: (id: number, data: Partial<AnnouncementData>) =>
    apiClient.put<AnnouncementData>(`/announcements/${id}`, data),

  delete: (id: number) => apiClient.delete(`/announcements/${id}`),
};

/**
 * Itinerary API
 */
export const itineraryApi = {
  getAll: (tourId?: number) => {
    const query = tourId ? `?tour_id=${tourId}` : "";
    return apiClient.get<ItineraryData[]>(`/itineraries${query}`);
  },

  getById: (id: number) => apiClient.get<ItineraryData>(`/itineraries/${id}`),

  create: (data: Partial<ItineraryData>) => apiClient.post<ItineraryData>("/itineraries", data),

  update: (id: number, data: Partial<ItineraryData>) =>
    apiClient.put<ItineraryData>(`/itineraries/${id}`, data),

  delete: (id: number) => apiClient.delete(`/itineraries/${id}`),
};

/**
 * Users API
 */
export const userApi = {
  getLeaders: () => authApi.getLeaders(),
  getProfile: () => authApi.getProfile(),
};

/**
 * Accommodation API
 */
export const accommodationApi = {
  getAll: (tourId: number) => apiClient.get<AccommodationData[]>(`/accommodations/${tourId}`),

  create: (data: {
    tour_id: number;
    name: string;
    address?: string;
    check_in_date?: string;
    check_out_date?: string;
    contact_number?: string;
  }) => apiClient.post<AccommodationData>("/accommodations", data),

  update: (id: number, data: Partial<AccommodationData>) =>
    apiClient.put<AccommodationData>(`/accommodations/${id}`, data),

  delete: (id: number) => apiClient.delete(`/accommodations/${id}`),

  getRoomAssignments: (accommodationId: number) =>
    apiClient.get<RoomAssignmentData[]>(`/accommodations/${accommodationId}/assignments`),

  createRoomAssignment: (data: {
    accommodation_id: number;
    user_id: number;
    room_number?: string;
    room_type?: string;
    notes?: string;
  }) =>
    apiClient.post<RoomAssignmentData>(
      `/accommodations/${data.accommodation_id}/assignments`,
      data
    ),

  deleteRoomAssignment: (assignmentId: number) =>
    apiClient.delete(`/accommodations/assignments/${assignmentId}`),

  getTourParticipants: (tourId: number) =>
    apiClient.get<{ user_id: number; name: string }[]>(`/accommodations/${tourId}/participants`),
};

/**
 * Photo API
 */
export const photoApi = {
  // Get all photos for a tour
  getByTourId: (tourId: number) => apiClient.get<PhotoData[]>(`/photos/${tourId}`),

  // Upload a new photo (sends base64 or URL)
  upload: (tourId: number, data: { photo_url: string; caption?: string }) =>
    apiClient.post<PhotoData>(`/photos/${tourId}`, data),

  // Delete a photo
  delete: (photoId: number) => apiClient.delete(`/photos/${photoId}`),
};

// Legacy exports for backward compatibility
export const api = {
  get: <T>(endpoint: string) => apiClient.get<T>(endpoint),
  post: <T>(endpoint: string, data?: unknown) => apiClient.post<T>(endpoint, data),
  put: <T>(endpoint: string, data?: unknown) => apiClient.put<T>(endpoint, data),
  delete: <T>(endpoint: string) => apiClient.delete<T>(endpoint),
};

// Export the token manager and API client
export { apiClient };
