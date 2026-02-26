"use client";

import { useState, useEffect } from "react";
import { tokenManager } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Check, X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PendingRequest {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  requested_at: Date;
}

interface JoinRequestsManagerProps {
  tourId: string;
  onRequestProcessed?: () => void;
}

export function JoinRequestsManager({ tourId, onRequestProcessed }: JoinRequestsManagerProps) {
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingRequest, setProcessingRequest] = useState(false);

  const fetchPendingRequests = async () => {
    setLoadingRequests(true);
    try {
      const token = tokenManager.getToken();
      const result = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/tours/${tourId}/requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await result.json();
      if (data.success && data.data) {
        setPendingRequests(data.data);
      }
    } catch (err) {
      console.error("Error fetching pending requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, [tourId]);

  const handleApprove = async (requestId: number) => {
    setProcessingRequest(true);
    try {
      const token = tokenManager.getToken();
      const result = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/tours/${tourId}/requests/${requestId}/approve`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await result.json();
      if (data.success) {
        toast.success(data.message || "Request approved successfully");
        fetchPendingRequests();
        onRequestProcessed?.();
      } else {
        toast.error(data.error || "Failed to approve request");
      }
    } catch (err) {
      toast.error("Failed to approve request");
    } finally {
      setProcessingRequest(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequestId) return;
    setProcessingRequest(true);
    try {
      const token = tokenManager.getToken();
      const result = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/tours/${tourId}/requests/${selectedRequestId}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: rejectReason }),
        }
      );
      const data = await result.json();
      if (data.success) {
        toast.success(data.message || "Request rejected");
        fetchPendingRequests();
        onRequestProcessed?.();
      } else {
        toast.error(data.error || "Failed to reject request");
      }
    } catch (err) {
      toast.error("Failed to reject request");
    } finally {
      setProcessingRequest(false);
      setRejectDialogOpen(false);
      setRejectReason("");
      setSelectedRequestId(null);
    }
  };

  const openRejectDialog = (requestId: number) => {
    setSelectedRequestId(requestId);
    setRejectDialogOpen(true);
  };

  if (loadingRequests) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
      </div>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Pending Join Requests
        </h3>
        <p className="text-slate-500 text-center py-4">No pending join requests</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Pending Join Requests ({pendingRequests.length})
        </h3>
        <div className="space-y-3">
          {pendingRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-100 rounded-lg"
            >
              <div>
                <p className="font-medium text-slate-800">{request.full_name}</p>
                <p className="text-sm text-slate-500">{request.email}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Requested: {new Date(request.requested_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleApprove(request.id)}
                  disabled={processingRequest}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openRejectDialog(request.id)}
                  disabled={processingRequest}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Join Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this join request.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter rejection reason (optional)"
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={processingRequest}
              className="bg-red-600 hover:bg-red-700"
            >
              {processingRequest ? "Rejecting..." : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
