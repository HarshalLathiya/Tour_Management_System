/**
 * Calculate the distance between two points using the Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Check if a point is within a geofence
 * @param userLat - User's latitude
 * @param userLng - User's longitude
 * @param checkpointLat - Checkpoint latitude
 * @param checkpointLng - Checkpoint longitude
 * @param radiusMeters - Geofence radius in meters (default: 100m)
 * @returns Object with isWithin boolean and distance in meters
 */
export function isWithinGeofence(
  userLat: number,
  userLng: number,
  checkpointLat: number,
  checkpointLng: number,
  radiusMeters: number = 100
): { isWithin: boolean; distance: number } {
  const distance = calculateDistance(userLat, userLng, checkpointLat, checkpointLng);

  return {
    isWithin: distance <= radiusMeters,
    distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
  };
}
