"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { incidentApi } from "@/lib/api";
import { toast } from "sonner";

interface SOSButtonProps {
  tourId: number;
  className?: string;
}

export function SOSButton({ tourId, className = "" }: SOSButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [isTriggering, setIsTriggering] = useState(false);
  const getLocation = (): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve(`${latitude},${longitude}`);
        },
        (error) => {
          console.error("Geolocation error:", error);
          resolve(undefined);
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    });
  };

  const handleTriggerSOS = async () => {
    setIsTriggering(true);

    try {
      // Get current location
      const location = await getLocation();

      // Trigger SOS
      const result = await incidentApi.triggerSOS({
        tour_id: tourId,
        location,
        description: description.trim() || undefined,
      });

      if (result.success) {
        toast.success("SOS Alert Triggered", {
          description: "Emergency alert has been sent to tour leaders and organization.",
        });
        setIsConfirmOpen(false);
        setDescription("");
      } else {
        toast.error("Failed to Trigger SOS", {
          description: result.error || "An error occurred. Please try again.",
        });
      }
    } catch {
      toast.error("Error", {
        description: "Failed to trigger SOS alert. Please try again.",
      });
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        size="lg"
        className={`bg-red-600 hover:bg-red-700 ${className}`}
        onClick={() => setIsConfirmOpen(true)}
      >
        <AlertTriangle className="mr-2 h-5 w-5" />
        SOS EMERGENCY
      </Button>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Trigger SOS Alert</DialogTitle>
            <DialogDescription>
              This will immediately notify tour leaders and organization of an emergency situation.
              Your location will be shared if available.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Additional Details (Optional)</label>
              <Textarea
                placeholder="Briefly describe the emergency..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsConfirmOpen(false);
                setDescription("");
              }}
              disabled={isTriggering}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleTriggerSOS} disabled={isTriggering}>
              {isTriggering ? "Triggering..." : "Trigger SOS Alert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
