import * as Location from 'expo-location';
import { FORD_DEALERSHIPS, Dealership } from '@/constants/fordDealerships';

export async function requestLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentLocation() {
  const location = await Location.getCurrentPositionAsync({});
  return location.coords;
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getDealershipsNearby(
  userLat: number,
  userLon: number
): (Dealership & { distanceKm: number })[] {
  return FORD_DEALERSHIPS.map((d) => ({
    ...d,
    distanceKm: distanceKm(userLat, userLon, d.latitude, d.longitude),
  })).sort((a, b) => a.distanceKm - b.distanceKm);
}
