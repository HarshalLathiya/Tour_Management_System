"use client";

import { useState, useEffect } from "react";
import { User, UserCheck, UserX, ChevronDown } from "lucide-react";
import { tourApi, userApi } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Leader {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface LeaderAssignmentProps {
  tourId: number;
  currentLeaderId?: number | null;
  currentLeaderName?: string | null;
  currentLeaderEmail?: string | null;
  onAssignmentChange?: () => void;
  readOnly?: boolean;
}

export function LeaderAssignment({
  tourId,
  currentLeaderId,
  currentLeaderName,
  currentLeaderEmail,
  onAssignmentChange,
  readOnly = false,
}: LeaderAssignmentProps) {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [selectedLeaderId, setSelectedLeaderId] = useState<string | undefined>(
    currentLeaderId?.toString()
  );
  const [isAssigning, setIsAssigning] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch available leaders
  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const result = await userApi.getLeaders();
        if (result.success && result.data) {
          setLeaders(result.data as Leader[]);
        }
      } catch (error) {
        console.error("Failed to fetch leaders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!readOnly) {
      fetchLeaders();
    } else {
      setLoading(false);
    }
  }, [readOnly]);

  // Update selected leader when props change
  useEffect(() => {
    setSelectedLeaderId(currentLeaderId?.toString());
  }, [currentLeaderId]);

  const handleAssignLeader = async () => {
    if (!selectedLeaderId || selectedLeaderId === currentLeaderId?.toString()) {
      return;
    }

    setIsAssigning(true);

    try {
      const result = await tourApi.assignLeader(tourId, parseInt(selectedLeaderId));

      if (result.success) {
        onAssignmentChange?.();
      } else {
        alert(`Failed to assign leader: ${result.error}`);
        // Revert selection
        setSelectedLeaderId(currentLeaderId?.toString());
      }
    } catch (error) {
      console.error("Failed to assign leader:", error);
      alert("Failed to assign leader. Please try again.");
      setSelectedLeaderId(currentLeaderId?.toString());
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignLeader = async () => {
    if (!currentLeaderId) return;

    if (!confirm("Are you sure you want to unassign the current leader from this tour?")) {
      return;
    }

    setIsAssigning(true);

    try {
      const result = await tourApi.unassignLeader(tourId);

      if (result.success) {
        setSelectedLeaderId(undefined);
        onAssignmentChange?.();
      } else {
        alert(`Failed to unassign leader: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to unassign leader:", error);
      alert("Failed to unassign leader. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };

  if (readOnly) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Assigned Leader
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentLeaderName ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{currentLeaderName}</p>
                <p className="text-sm text-muted-foreground">{currentLeaderEmail}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserX className="h-5 w-5" />
              <span>No leader assigned</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          Leader Assignment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Leader Display */}
        {currentLeaderName && (
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{currentLeaderName}</p>
                  <p className="text-sm text-muted-foreground">{currentLeaderEmail}</p>
                </div>
              </div>
              <Badge variant="secondary">Current</Badge>
            </div>
          </div>
        )}

        {/* Leader Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {currentLeaderName ? "Change Leader" : "Assign Leader"}
          </label>
          <div className="flex gap-2">
            <Select
              value={selectedLeaderId}
              onValueChange={setSelectedLeaderId}
              disabled={loading || isAssigning}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={loading ? "Loading leaders..." : "Select a leader"} />
              </SelectTrigger>
              <SelectContent>
                {leaders.map((leader) => (
                  <SelectItem key={leader.id} value={leader.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{leader.name}</span>
                      <span className="text-xs text-muted-foreground">{leader.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleAssignLeader}
              disabled={
                !selectedLeaderId || selectedLeaderId === currentLeaderId?.toString() || isAssigning
              }
            >
              {isAssigning ? "Assigning..." : "Assign"}
            </Button>
          </div>
        </div>

        {/* Unassign Button */}
        {currentLeaderId && (
          <Button
            variant="outline"
            onClick={handleUnassignLeader}
            disabled={isAssigning}
            className="w-full"
          >
            <UserX className="mr-2 h-4 w-4" />
            Unassign Leader
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
