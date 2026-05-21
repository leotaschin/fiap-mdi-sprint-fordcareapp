import React, { createContext, useContext, useReducer } from 'react';

export type AlertStatus = 'urgente' | 'atencao' | 'ok';

export type Alert = {
  type: string;
  status: AlertStatus;
  kmRemaining: number;
  daysRemaining: number;
};

export type Vehicle = {
  id: string;
  brand: 'Ford';
  model: string;
  year: number;
  currentKm: number;
  lastServiceKm: number;
  lastServiceDate: Date;
};

export type Maintenance = {
  id: string;
  type: string;
  date: Date;
  km: number;
  dealership: string;
  notes: string;
  pointsEarned: number;
};

type State = {
  vehicle: Vehicle | null;
  alerts: Alert[];
  maintenances: Maintenance[];
  points: number;
  level: 'bronze' | 'prata' | 'ouro';
  loading: boolean;
};

type Action =
  | { type: 'SET_VEHICLE'; payload: Vehicle }
  | { type: 'SET_ALERTS'; payload: Alert[] }
  | { type: 'SET_MAINTENANCES'; payload: Maintenance[] }
  | { type: 'SET_POINTS'; payload: { points: number; level: 'bronze' | 'prata' | 'ouro' } }
  | { type: 'ADD_MAINTENANCE'; payload: Maintenance }
  | { type: 'UPDATE_KM'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET' };

const initialState: State = {
  vehicle: null,
  alerts: [],
  maintenances: [],
  points: 0,
  level: 'bronze',
  loading: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_VEHICLE':
      return { ...state, vehicle: action.payload };
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    case 'SET_MAINTENANCES':
      return { ...state, maintenances: action.payload };
    case 'SET_POINTS':
      return { ...state, points: action.payload.points, level: action.payload.level };
    case 'ADD_MAINTENANCE':
      return { ...state, maintenances: [action.payload, ...state.maintenances] };
    case 'UPDATE_KM':
      return state.vehicle
        ? { ...state, vehicle: { ...state.vehicle, currentKm: action.payload } }
        : state;
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

type ContextValue = State & { dispatch: React.Dispatch<Action> };

const VehicleContext = createContext<ContextValue | null>(null);

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <VehicleContext.Provider value={{ ...state, dispatch }}>
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicleContext() {
  const ctx = useContext(VehicleContext);
  if (!ctx) throw new Error('useVehicleContext must be used inside VehicleProvider');
  return ctx;
}
