/**
 * API Service - Helper functions for making authenticated API requests
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/**
 * Make an authenticated API request
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Request failed with status ${response.status}`,
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    console.error("API request failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * API Methods
 */
export const api = {
  // GET request
  get: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: "GET" }),

  // POST request
  post: <T = any>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // PUT request
  put: <T = any>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // DELETE request
  delete: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: "DELETE" }),
};

/**
 * Tour API Methods
 */
export const tourApi = {
  // Get all tours
  getAll: () => api.get<any[]>("/tours"),

  // Get tour by ID
  getById: (id: number) => api.get<any>(`/tours/${id}`),

  // Get my assigned tours (for leaders)
  getMyAssigned: () => api.get<any[]>("/tours/my-assigned"),

  // Create tour
  create: (data: any) => api.post<any>("/tours", data),

  // Update tour
  update: (id: number, data: any) => api.put<any>(`/tours/${id}`, data),

  // Delete tour
  delete: (id: number) => api.delete(`/tours/${id}`),

  // Assign leader
  assignLeader: (tourId: number, leaderId: number) =>
    api.put<any>(`/tours/${tourId}/assign-leader`, { leader_id: leaderId }),

  // Unassign leader
  unassignLeader: (tourId: number) => api.delete<any>(`/tours/${tourId}/assign-leader`),
};

/**
 * User API Methods
 */
export const userApi = {
  // Get all leaders (users with 'guide' role)
  getLeaders: () => api.get<any[]>("/auth/leaders"),

  // Get current user profile
  getProfile: () => api.get<any>("/auth/profile"),
};

/**
 * Incident API Methods
 */
export const incidentApi = {
  // Get all incidents
  getAll: () => api.get<any[]>("/incidents"),

  // Get incident by ID
  getById: (id: number) => api.get<any>(`/incidents/${id}`),

  // Trigger SOS alert (one-click emergency)
  triggerSOS: (data: { tour_id: number; location?: string; description?: string }) =>
    api.post<any>("/incidents/sos", data),

  // Report health issue
  reportHealth: (data: {
    tour_id: number;
    health_category: string;
    description: string;
    location?: string;
    severity?: string;
  }) => api.post<any>("/incidents/health", data),

  // Create general incident
  create: (data: any) => api.post<any>("/incidents", data),

  // Respond to incident (mark as in progress)
  respond: (id: number) => api.put<any>(`/incidents/${id}/respond`, {}),

  // Resolve incident
  resolve: (id: number, resolutionNotes?: string) =>
    api.put<any>(`/incidents/${id}/resolve`, { resolution_notes: resolutionNotes }),

  // Update incident
  update: (id: number, data: any) => api.put<any>(`/incidents/${id}`, data),

  // Delete incident
  delete: (id: number) => api.delete(`/incidents/${id}`),
};

/**
 * Attendance API Methods
 */
export const attendanceApi = {
  // Get all attendance records
  getAll: (filters?: { tour_id?: number; user_id?: number; date?: string; status?: string }) =>
    api.get<any[]>(`/attendance?${new URLSearchParams(filters as any).toString()}`),

  // Get attendance by ID
  getById: (id: number) => api.get<any>(`/attendance/${id}`),

  // Self check-in with geolocation
  checkIn: (data: {
    tour_id: number;
    checkpoint_id?: number;
    location_lat: number;
    location_lng: number;
    place_lat?: number;
    place_lng?: number;
    date?: string;
    status?: string;
  }) => api.post<any>("/attendance/checkin", data),

  // Create attendance (admin/guide)
  create: (data: any) => api.post<any>("/attendance", data),

  // Update attendance
  update: (id: number, data: any) => api.put<any>(`/attendance/${id}`, data),

  // Verify attendance (leader/admin)
  verify: (id: number) => api.put<any>(`/attendance/${id}/verify`, {}),

  // Delete attendance
  delete: (id: number) => api.delete(`/attendance/${id}`),
};
