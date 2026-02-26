"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, AlertTriangle, Heart, AlertCircle, Calendar, Info } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import Link from "next/link";

interface Notification {
  id: string;
  type: "SOS" | "HEALTH" | "INCIDENT" | "ATTENDANCE" | "ANNOUNCEMENT";
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, isConnected } = useNotifications({ showToast: true });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "SOS":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "HEALTH":
        return <Heart className="h-4 w-4 text-pink-500" />;
      case "INCIDENT":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "ATTENDANCE":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "ANNOUNCEMENT":
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-50 border-red-200";
      case "HIGH":
        return "bg-orange-50 border-orange-200";
      case "MEDIUM":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-white border-gray-100";
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Connection Status Indicator */}
      <span
        className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card ${
          isConnected ? "bg-green-500" : "bg-gray-300"
        }`}
        title={isConnected ? "Notifications connected" : "Notifications disconnected"}
      />

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="mx-auto h-8 w-8 opacity-30" />
                <p className="mt-2 text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.slice(0, 20).map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    getIcon={getNotificationIcon}
                    getColor={getSeverityColor}
                  />
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t p-2">
              <Link
                href="/dashboard/announcements"
                className="block rounded-lg px-4 py-2 text-center text-sm text-primary hover:bg-muted"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  getIcon: (type: string) => React.ReactNode;
  getColor: (severity: string) => string;
}

function NotificationItem({ notification, getIcon, getColor }: NotificationItemProps) {
  const handleClick = () => {
    // Navigate based on notification type
    if (notification.data?.tourId) {
      console.log("Navigate to tour:", notification.data.tourId);
    }
  };

  return (
    <div
      className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${getColor(
        notification.severity
      )}`}
      onClick={handleClick}
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{notification.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatTimeAgo(notification.timestamp)}
        </p>
      </div>
    </div>
  );
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
