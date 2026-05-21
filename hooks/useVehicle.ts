import { useUser } from '@/contexts/UserContext';

export function useVehicle() {
  const { vehicle, maintenances, dispatch } = useUser();
  return { vehicle, maintenances, dispatch };
}
