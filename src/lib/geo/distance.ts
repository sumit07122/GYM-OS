// Geolocation & Haversine Distance Engine for GymOS GPS Auto-Attendance

const EARTH_RADIUS_METERS = 6371000;

/**
 * Calculates the great-circle distance between two GPS coordinates using the Haversine formula
 * @returns distance in meters (rounded to nearest integer)
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }

  const toRad = (degree: number) => (degree * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(rLat1) * Math.cos(rLat2);

  // Defensively clamp to [0, 1] to prevent IEEE-754 precision drift causing NaN on antipodal coordinates
  const clampedA = Math.min(1, Math.max(0, a));
  const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));

  return Math.round(EARTH_RADIUS_METERS * c);
}

/**
 * Checks if a given distance is within the gym's configured geofence radius
 */
export function isWithinGeofence(distanceMeters: number, radiusMeters = 100): boolean {
  return distanceMeters <= radiusMeters;
}

/**
 * Formats distance into a human-readable string (e.g. "45 m" or "1.5 km")
 */
export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }
  const km = Math.round(distanceMeters / 100) / 10;
  return `${km.toFixed(1)} km`;
}
