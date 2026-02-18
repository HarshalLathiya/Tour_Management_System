import React from "react";
import { AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  message: string;
  variant?: "inline" | "card";
  className?: string;
}

export function ErrorMessage({ message, variant = "inline", className }: ErrorMessageProps) {
  if (variant === "card") {
    return (
      <div className={cn("card p-6 border-destructive/20 bg-destructive/5", className)}>
        <div className="flex items-start gap-3">
          <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-destructive mb-1">Error</h3>
            <p className="text-sm text-destructive/90">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3",
        className
      )}
    >
      <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
      <p className="text-sm font-medium text-destructive">{message}</p>
    </div>
  );
}

export function FieldError({ error }: { error?: string }) {
  if (!error) return null;

  return (
    <p className="text-sm text-destructive flex items-center gap-1 mt-1">
      <AlertCircle className="h-3 w-3" />
      {error}
    </p>
  );
}
