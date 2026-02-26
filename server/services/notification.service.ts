import type { Response } from "express";

interface NotificationClient {
  userId: number;
  response: Response;
  role: string;
}

interface Notification {
  id: string;
  type: "SOS" | "HEALTH" | "INCIDENT" | "ATTENDANCE" | "ANNOUNCEMENT" | "TOUR_REQUEST";
  title: string;
  message: string;
  data?: unknown;
  timestamp: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

class NotificationService {
  private clients: Map<number, NotificationClient> = new Map();

  /**
   * Add a new SSE client connection
   */
  addClient(userId: number, role: string, response: Response): void {
    // Set SSE headers
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    // Store client
    this.clients.set(userId, { userId, response, role });

    // Send initial connection message
    this.sendToClient(userId, {
      id: `connect-${Date.now()}`,
      type: "ANNOUNCEMENT",
      title: "Connected",
      message: "Real-time notifications enabled",
      timestamp: new Date().toISOString(),
      severity: "LOW",
    });

    // Handle client disconnect
    response.on("close", () => {
      this.removeClient(userId);
    });

    console.log(
      `[SSE] Client connected: User ${userId} (${role}), Total clients: ${this.clients.size}`
    );
  }

  /**
   * Remove a client connection
   */
  removeClient(userId: number): void {
    this.clients.delete(userId);
    console.log(`[SSE] Client disconnected: User ${userId}, Total clients: ${this.clients.size}`);
  }

  /**
   * Send notification to a specific user
   */
  sendToClient(userId: number, notification: Notification): void {
    const client = this.clients.get(userId);
    if (client) {
      try {
        client.response.write(`data: ${JSON.stringify(notification)}\n\n`);
      } catch (error) {
        console.error(`[SSE] Error sending to user ${userId}:`, error);
        this.removeClient(userId);
      }
    }
  }

  /**
   * Send notification to all admins and guides
   */
  notifyLeadersAndAdmins(notification: Notification): void {
    let count = 0;
    this.clients.forEach((client) => {
      if (client.role === "admin" || client.role === "guide") {
        this.sendToClient(client.userId, notification);
        count++;
      }
    });
    console.log(`[SSE] Notified ${count} leaders/admins`);
  }

  /**
   * Send notification to all admins only
   */
  notifyAdmins(notification: Notification): void {
    let count = 0;
    this.clients.forEach((client) => {
      if (client.role === "admin") {
        this.sendToClient(client.userId, notification);
        count++;
      }
    });
    console.log(`[SSE] Notified ${count} admins`);
  }

  /**
   * Send notification to all connected clients
   */
  broadcast(notification: Notification): void {
    this.clients.forEach((client) => {
      this.sendToClient(client.userId, notification);
    });
    console.log(`[SSE] Broadcasted to ${this.clients.size} clients`);
  }

  /**
   * Send notification to users in a specific tour
   */
  notifyTourParticipants(tourId: number, notification: Notification, excludeUserId?: number): void {
    // TODO: Query database to get tour participants
    // For now, broadcast to all (except excluded user)
    let count = 0;
    this.clients.forEach((client) => {
      if (!excludeUserId || client.userId !== excludeUserId) {
        this.sendToClient(client.userId, notification);
        count++;
      }
    });
    console.log(`[SSE] Notified ${count} tour participants`);
  }

  /**
   * Notify about SOS alert
   */
  notifySOSAlert(data: {
    incidentId: number;
    tourId: number;
    reportedBy: number;
    reportedByName: string;
    location?: string;
    description?: string;
  }): void {
    const notification: Notification = {
      id: `sos-${data.incidentId}`,
      type: "SOS",
      title: "🚨 SOS EMERGENCY ALERT",
      message: `${data.reportedByName} has triggered an SOS alert${data.location ? ` at ${data.location}` : ""}`,
      data: {
        incidentId: data.incidentId,
        tourId: data.tourId,
        reportedBy: data.reportedBy,
        location: data.location,
        description: data.description,
      },
      timestamp: new Date().toISOString(),
      severity: "CRITICAL",
    };

    // Notify all leaders and admins
    this.notifyLeadersAndAdmins(notification);
  }

  /**
   * Notify about health issue
   */
  notifyHealthIssue(data: {
    incidentId: number;
    tourId: number;
    reportedBy: number;
    reportedByName: string;
    healthCategory: string;
    description: string;
    severity: string;
  }): void {
    const notification: Notification = {
      id: `health-${data.incidentId}`,
      type: "HEALTH",
      title: `Health Issue: ${data.healthCategory}`,
      message: `${data.reportedByName} reported a health issue: ${data.description}`,
      data: {
        incidentId: data.incidentId,
        tourId: data.tourId,
        reportedBy: data.reportedBy,
        healthCategory: data.healthCategory,
      },
      timestamp: new Date().toISOString(),
      severity: (data.severity as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL") || "HIGH",
    };

    this.notifyLeadersAndAdmins(notification);
  }

  /**
   * Notify about incident response
   */
  notifyIncidentResponse(data: {
    incidentId: number;
    respondedBy: number;
    respondedByName: string;
    reportedBy: number;
  }): void {
    const notification: Notification = {
      id: `incident-response-${data.incidentId}`,
      type: "INCIDENT",
      title: "Incident Response",
      message: `${data.respondedByName} is responding to your incident`,
      data: {
        incidentId: data.incidentId,
        respondedBy: data.respondedBy,
      },
      timestamp: new Date().toISOString(),
      severity: "MEDIUM",
    };

    // Notify the person who reported
    this.sendToClient(data.reportedBy, notification);
  }

  /**
   * Notify about incident resolution
   */
  notifyIncidentResolution(data: {
    incidentId: number;
    resolvedBy: number;
    resolvedByName: string;
    reportedBy: number;
    resolutionNotes?: string;
  }): void {
    const notification: Notification = {
      id: `incident-resolved-${data.incidentId}`,
      type: "INCIDENT",
      title: "Incident Resolved",
      message: `Your incident has been resolved by ${data.resolvedByName}${data.resolutionNotes ? `: ${data.resolutionNotes}` : ""}`,
      data: {
        incidentId: data.incidentId,
        resolvedBy: data.resolvedBy,
        resolutionNotes: data.resolutionNotes,
      },
      timestamp: new Date().toISOString(),
      severity: "LOW",
    };

    this.sendToClient(data.reportedBy, notification);
  }

  /**
   * Notify user when their tour join request is approved
   */
  notifyTourJoinApproved(data: { userId: number; tourId: number; tourName: string }): void {
    const notification: Notification = {
      id: `tour-join-approved-${data.tourId}-${Date.now()}`,
      type: "TOUR_REQUEST",
      title: "Tour Join Request Approved! 🎉",
      message: `Your request to join "${data.tourName}" has been approved. You are now a participant!`,
      data: {
        tourId: data.tourId,
        tourName: data.tourName,
      },
      timestamp: new Date().toISOString(),
      severity: "MEDIUM",
    };

    this.sendToClient(data.userId, notification);
  }

  /**
   * Notify user when their tour join request is rejected
   */
  notifyTourJoinRejected(data: {
    userId: number;
    tourId: number;
    tourName: string;
    reason?: string;
  }): void {
    const notification: Notification = {
      id: `tour-join-rejected-${data.tourId}-${Date.now()}`,
      type: "TOUR_REQUEST",
      title: "Tour Join Request Rejected",
      message: `Your request to join "${data.tourName}" has been rejected${data.reason ? `: ${data.reason}` : "."}`,
      data: {
        tourId: data.tourId,
        tourName: data.tourName,
        reason: data.reason,
      },
      timestamp: new Date().toISOString(),
      severity: "LOW",
    };

    this.sendToClient(data.userId, notification);
  }

  /**
   * Notify admins about new tour join request
   */
  notifyNewTourJoinRequest(data: {
    userId: number;
    userName: string;
    tourId: number;
    tourName: string;
  }): void {
    const notification: Notification = {
      id: `tour-join-request-${data.tourId}-${Date.now()}`,
      type: "TOUR_REQUEST",
      title: "New Tour Join Request",
      message: `${data.userName} wants to join "${data.tourName}". Please review and approve.`,
      data: {
        userId: data.userId,
        userName: data.userName,
        tourId: data.tourId,
        tourName: data.tourName,
      },
      timestamp: new Date().toISOString(),
      severity: "MEDIUM",
    };

    // Notify all admins
    this.notifyAdmins(notification);
  }
}

export const notificationService = new NotificationService();
