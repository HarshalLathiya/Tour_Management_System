"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { MapPin, CheckCircle, Clock, AlertCircle, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { tourApi, attendanceApi, api } from "@/lib/api";
import { toast } from "sonner";

interface Tour {
  id: number;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface CheckpointLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

interface AttendanceRecord {
  id: number;
  date: string;
  status: string;
  location_lat?: number;
  location_lng?: number;
  created_at: string;
  checkpoint_id?: number;
  user_name?: string;
}

interface ItineraryLocation {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
  arrival_time?: string;
}

export default function CheckInPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
  const [locations, setLocations] = useState<CheckpointLocation[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAttendanceHistory = useCallback(async () => {
    if (!selectedTourId) return;

    try {
      const result = await attendanceApi.getAll({ tour_id: selectedTourId });
      if (result.success && result.data) {
        // The API should return user info with each attendance record
        setAttendanceHistory(result.data as AttendanceRecord[]);
      }
    } catch (error) {
      console.error("Error fetching attendance history:", error);
    }
  }, [selectedTourId]);

  useEffect(() => {
    fetchTours();
  }, []);

  useEffect(() => {
    if (selectedTourId) {
      fetchLocations();
      fetchAttendanceHistory();
    }
  }, [selectedTourId, fetchAttendanceHistory]);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const result = await tourApi.getAll();
      if (result.success && result.data) {
        const tours = result.data as Tour[];
        setTours(tours);
        if (tours.length > 0) {
          setSelectedTourId(tours[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching tours:", error);
      toast.error("Error", { description: "Failed to load tours" });
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    if (!selectedTourId) return;

    try {
      // Fetch itineraries for the tour to get real checkpoint locations
      const itineraryResult = await api.get<{ id: number; title: string; date: string }[]>(
        `/itineraries?tour_id=${selectedTourId}`
      );

      if (itineraryResult.success && itineraryResult.data && itineraryResult.data.length > 0) {
        // Use real itinerary data as locations
        // In a real app, you would have a separate locations/checkpoints table
        // For now, we'll create placeholder locations from itinerary data
        // This is a workaround - ideally the backend should have a checkpoints/locations table
        const realLocations: CheckpointLocation[] = itineraryResult.data.map((item, index) => ({
          id: item.id,
          name: item.title || `Day ${index + 1}`,
          // Default coordinates (in real app, these would come from the database)
          latitude: 0,
          longitude: 0,
          radius: 500, // Default 500m radius
        }));
        setLocations(realLocations);
      } else {
        // Fallback to placeholder data if no itineraries
        setLocations([
          {
            id: 1,
            name: "Tour Start Location",
            latitude: 0,
            longitude: 0,
            radius: 500,
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      // Fallback to placeholder data on error
      setLocations([
        {
          id: 1,
          name: "Tour Start Location",
          latitude: 0,
          longitude: 0,
          radius: 500,
        },
      ]);
    }
  };

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setIsGettingLocation(false);
          resolve(location);
        },
        (error) => {
          setIsGettingLocation(false);
          reject(error);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  };

  const handleCheckIn = async () => {
    if (!selectedTourId || !selectedLocationId) {
      toast.error("Error", { description: "Please select a tour and location" });
      return;
    }

    setIsCheckingIn(true);

    try {
      // Get current location
      const location = await getCurrentLocation();

      // Find selected location details
      const selectedLocation = locations.find((l) => l.id === selectedLocationId);

      // Calculate distance if we have real coordinates
      if (selectedLocation && selectedLocation.latitude !== 0 && selectedLocation.longitude !== 0) {
        const distance = calculateDistance(
          location.lat,
          location.lng,
          selectedLocation.latitude,
          selectedLocation.longitude
        );

        // Check if within geofence radius - ENFORCE GEOFENCE
        if (distance > selectedLocation.radius) {
          toast.error("Outside Check-In Area", {
            description: `You are ${Math.round(distance)}m away from the location. Please move within ${selectedLocation.radius}m to check in.`,
          });
          setIsCheckingIn(false);
          return;
        }
      }

      // Check in with geofencing
      const result = await attendanceApi.checkIn({
        tour_id: selectedTourId,
        checkpoint_id: selectedLocationId,
        location_lat: location.lat,
        location_lng: location.lng,
        date: new Date().toISOString().split("T")[0],
        status: "present",
      });

      if (result.success) {
        toast.success("Check-In Successful", {
          description: `You've been marked present at ${selectedLocation?.name}`,
        });
        fetchAttendanceHistory();
      } else {
        toast.error("Check-In Failed", {
          description: result.error || "Please ensure you're at the correct location",
        });
      }
    } catch (error: unknown) {
      toast.error("Location Error", {
        description: error instanceof Error ? error.message : "Unable to get your location",
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Return in meters
  };

  const selectedLocation = locations.find((l) => l.id === selectedLocationId);
  const distanceToLocation =
    userLocation &&
    selectedLocation &&
    selectedLocation.latitude !== 0 &&
    selectedLocation.longitude !== 0
      ? calculateDistance(
          userLocation.lat,
          userLocation.lng,
          selectedLocation.latitude,
          selectedLocation.longitude
        )
      : null;

  const isOutsideGeofence =
    distanceToLocation !== null && selectedLocation && distanceToLocation > selectedLocation.radius;

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Self Check-In</h2>
        <p className="text-slate-500">Mark your attendance at tour locations</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Check In Now</CardTitle>
            <CardDescription>Select your current tour and location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Tour</label>
              <select
                value={selectedTourId || ""}
                onChange={(e) => setSelectedTourId(parseInt(e.target.value))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {tours.map((tour) => (
                  <option key={tour.id} value={tour.id}>
                    {tour.name} - {tour.destination}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Location</label>
              <select
                value={selectedLocationId || ""}
                onChange={(e) => setSelectedLocationId(parseInt(e.target.value))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                disabled={!selectedTourId}
              >
                <option value="">Choose a location...</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            {userLocation && distanceToLocation !== null && selectedLocation && (
              <div className={`p-4 rounded-lg ${isOutsideGeofence ? "bg-red-50" : "bg-slate-50"}`}>
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-700">
                    Distance to {selectedLocation.name}:{" "}
                    <span className="font-bold">
                      {distanceToLocation < 1000
                        ? `${Math.round(distanceToLocation)}m`
                        : `${(distanceToLocation / 1000).toFixed(2)}km`}
                    </span>
                  </span>
                </div>
                {isOutsideGeofence && (
                  <div className="flex items-center space-x-2 text-sm text-red-700 mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>You're outside the check-in radius ({selectedLocation.radius}m)</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="flex-1"
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Get Location
                  </>
                )}
              </Button>

              <Button
                onClick={handleCheckIn}
                disabled={
                  !selectedTourId || !selectedLocationId || isCheckingIn || isOutsideGeofence
                }
                className="flex-1"
                variant={isOutsideGeofence ? "secondary" : "default"}
              >
                {isCheckingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking In...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Check In
                  </>
                )}
              </Button>
            </div>

            {isOutsideGeofence && (
              <p className="text-xs text-red-600 text-center">
                Please move closer to the location to enable check-in
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance History</CardTitle>
            <CardDescription>Your recent check-ins</CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceHistory.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Clock className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>No attendance records yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attendanceHistory.slice(0, 10).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {record.user_name || "Unknown Participant"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(record.date).toLocaleDateString()} •{" "}
                        {new Date(record.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        record.status === "PRESENT" || record.status === "present"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        record.status === "PRESENT" || record.status === "present"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-700"
                      }
                    >
                      {record.status?.toUpperCase() || "UNKNOWN"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
