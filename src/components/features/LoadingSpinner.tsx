import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-3",
};

export function LoadingSpinner({ size = "md", className, fullScreen }: LoadingSpinnerProps) {
  const spinner = <div className={cn("spinner", sizeClasses[size], className)} />;

  if (fullScreen) {
    return <div className="flex h-screen items-center justify-center bg-background">{spinner}</div>;
  }

  return spinner;
}

export function LoadingPage({ message }: { message?: string }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
      <LoadingSpinner size="lg" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

export function LoadingCard({ className }: { className?: string }) {
  return (
    <div className={cn("card p-12 flex items-center justify-center", className)}>
      <LoadingSpinner />
    </div>
  );
}
