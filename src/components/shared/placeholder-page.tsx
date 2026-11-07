"use client";

import type { ReactNode } from "react";
import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: ReactNode;
}

export function PlaceholderPage({
  title,
  description,
  icon,
}: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            {icon ?? <Construction className="h-7 w-7" />}
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium">Coming in Phase 2</p>
            <p className="max-w-md text-sm text-muted-foreground">
              This module is part of the next development phase. The foundation and navigation are ready now.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
