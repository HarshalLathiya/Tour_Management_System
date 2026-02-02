"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "SOS" | "HEALTH" | "INCIDENT" | "ATTENDANCE" | "ANNOUNCEMENT";
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

interface UseNotificationsOptions {
  onNotification?: (notification: Notification) => void;
  showToast?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { onNotification, showToast = true } = options;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const eventSource = new EventSource(`${API_BASE_URL}/notifications/stream`, {
      withCredentials: false,
    });

    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const notification: Notification = JSON.parse(event.data);

        // Add to notifications list
        setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Keep last 50

        // Call custom handler
        onNotification?.(notification);

        // Show toast notification
        if (showToast && notification.type !== "ANNOUNCEMENT") {
          const isCritical =
            notification.severity === "CRITICAL" || notification.severity === "HIGH";
          if (isCritical) {
            toast.error(notification.title, { description: notification.message });
          } else {
            toast.info(notification.title, { description: notification.message });
          }

          // Play sound for critical notifications
          if (notification.severity === "CRITICAL") {
            try {
              const audio = new Audio("/notification-sound.mp3");
              audio.play().catch(() => {
                // Sound play failed silently
              });
            } catch (error) {
              console.error("[SSE] Error playing notification sound:", error);
            }
          }
        }
      } catch (error) {
        console.error("[SSE] Error parsing notification:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("[SSE] Connection error:", error);
      setIsConnected(false);

      // EventSource will automatically try to reconnect
      // Close and cleanup will happen in the cleanup function
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [onNotification, showToast]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return {
    notifications,
    isConnected,
    clearNotifications,
    removeNotification,
  };
}
