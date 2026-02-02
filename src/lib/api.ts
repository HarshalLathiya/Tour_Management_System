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
async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
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
  get: <T = unknown>(endpoint: string) => apiRequest<T>(endpoint, { method: "GET" }),

  // POST request
  post: <T = unknown>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // PUT request
  put: <T = unknown>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // DELETE request
  delete: <T = unknown>(endpoint: string) => apiRequest<T>(endpoint, { method: "DELETE" }),
};

/**
 * Tour API Methods
 */
export const tourApi = {
  // Get all tours
  getAll: () => api.get<unknown[]>("/tours"),

  // Get tour by ID
  getById: (id: number) => api.get<unknown>(`/tours/${id}`),

  // Get my assigned tours (for leaders)
  getMyAssigned: () => api.get<unknown[]>("/tours/my-assigned"),

  // Create tour
  create: (data: unknown) => api.post<unknown>("/tours", data),

  // Update tour
  update: (id: number, data: unknown) => api.put<unknown>(`/tours/${id}`, data),

  // Delete tour
  delete: (id: number) => api.delete(`/tours/${id}`),

  // Assign leader
  assignLeader: (tourId: number, leaderId: number) =>
    api.put<unknown>(`/tours/${tourId}/assign-leader`, { leader_id: leaderId }),

  // Unassign leader
  unassignLeader: (tourId: number) => api.delete<unknown>(`/tours/${tourId}/assign-leader`),
};

/**
 * User API Methods
 */
export const userApi = {
  // Get all leaders (users with 'guide' role)
  getLeaders: () => api.get<unknown[]>("/auth/leaders"),

  // Get current user profile
  getProfile: () => api.get<unknown>("/auth/profile"),
};

/**
 * Incident API Methods
 */
export const incidentApi = {
  // Get all incidents
  getAll: () => api.get<unknown[]>("/incidents"),

  // Get incident by ID
  getById: (id: number) => api.get<unknown>(`/incidents/${id}`),

  // Trigger SOS alert (one-click emergency)
  triggerSOS: (data: { tour_id: number; location?: string; description?: string }) =>
    api.post<unknown>("/incidents/sos", data),

  // Report health issue
  reportHealth: (data: {
    tour_id: number;
    health_category: string;
    description: string;
    location?: string;
    severity?: string;
  }) => api.post<unknown>("/incidents/health", data),

  // Create general incident
  create: (data: unknown) => api.post<unknown>("/incidents", data),

  // Respond to incident (mark as in progress)
  respond: (id: number) => api.put<unknown>(`/incidents/${id}/respond`, {}),

  // Resolve incident
  resolve: (id: number, resolutionNotes?: string) =>
    api.put<unknown>(`/incidents/${id}/resolve`, { resolution_notes: resolutionNotes }),

  // Update incident
  update: (id: number, data: unknown) => api.put<unknown>(`/incidents/${id}`, data),

  // Delete incident
  delete: (id: number) => api.delete(`/incidents/${id}`),
};

/**
 * Attendance API Methods
 */
export const attendanceApi = {
  // Get all attendance records
  getAll: (filters?: { tour_id?: number; user_id?: number; date?: string; status?: string }) =>
    api.get<unknown[]>(
      `/attendance?${new URLSearchParams(filters as Record<string, string>).toString()}`
    ),

  // Get attendance by ID
  getById: (id: number) => api.get<unknown>(`/attendance/${id}`),

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
  }) => api.post<unknown>("/attendance/checkin", data),

  // Create attendance (admin/guide)
  create: (data: unknown) => api.post<unknown>("/attendance", data),

  // Update attendance
  update: (id: number, data: unknown) => api.put<unknown>(`/attendance/${id}`, data),

  // Verify attendance (leader/admin)
  verify: (id: number) => api.put<unknown>(`/attendance/${id}/verify`, {}),

  // Delete attendance
  delete: (id: number) => api.delete(`/attendance/${id}`),
};
