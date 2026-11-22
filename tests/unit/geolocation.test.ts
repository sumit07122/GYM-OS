import { describe, it, expect } from 'vitest';
import { calculateDistanceMeters, isWithinGeofence, formatDistance } from '../../src/lib/geo/distance';

describe('Geolocation & Haversine Distance Engine', () => {
  // Olympia Elite Fitness Bandra coordinates
  const gymLocation = {
    latitude: 19.0596,
    longitude: 72.8295,
  };

  it('calculates 0 meters for exact identical coordinates', () => {
    const dist = calculateDistanceMeters(
      gymLocation.latitude,
      gymLocation.longitude,
      gymLocation.latitude,
      gymLocation.longitude
    );
    expect(dist).toBe(0);
  });

  it('accurately calculates distance within 50 meters (inside gym)', () => {
    // 0.0003 deg latitude is ~33 meters
    const memberLocation = {
      latitude: 19.0599,
      longitude: 72.8295,
    };

    const dist = calculateDistanceMeters(
      memberLocation.latitude,
      memberLocation.longitude,
      gymLocation.latitude,
      gymLocation.longitude
    );

    expect(dist).toBeGreaterThan(25);
    expect(dist).toBeLessThan(45);
    expect(isWithinGeofence(dist, 100)).toBe(true);
  });

  it('accurately detects member outside 100m geofence', () => {
    // 0.01 deg latitude is ~1.11 km
    const memberLocation = {
      latitude: 19.0700,
      longitude: 72.8295,
    };

    const dist = calculateDistanceMeters(
      memberLocation.latitude,
      memberLocation.longitude,
      gymLocation.latitude,
      gymLocation.longitude
    );

    expect(dist).toBeGreaterThan(1000);
    expect(isWithinGeofence(dist, 100)).toBe(false);
  });

  it('formats distance in meters when < 1000m and km when >= 1000m', () => {
    expect(formatDistance(45)).toBe('45 m');
    expect(formatDistance(1450)).toBe('1.5 km');
  });
});
