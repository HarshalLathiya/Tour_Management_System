import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  backLink?: string;
  backLabel?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, backLink, backLabel, action }: PageHeaderProps) {
  return (
    <div className="page-header">
      {backLink && (
        <Link
          href={backLink}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          {backLabel || "Back"}
        </Link>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">{title}</h1>
          {description && <p className="page-description">{description}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
