import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '@/services/firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Level = 'bronze' | 'prata' | 'ouro';

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  points: number;
  level: Level;
};

export type Vehicle = {
  id: string;
  brand: 'Ford';
  model: string;
  color: string;
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
  initialized: boolean;
  user: User | null;
  profile: UserProfile | null;
  vehicles: Vehicle[];
  selectedVehicleIndex: number;
  vehicle: Vehicle | null; // = vehicles[selectedVehicleIndex]
  maintenances: Maintenance[];
};

type Action =
  | { type: 'SET_INITIALIZED' }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_PROFILE'; payload: UserProfile }
  | { type: 'SET_VEHICLES'; payload: Vehicle[] }
  | { type: 'ADD_VEHICLE'; payload: Vehicle }
  | { type: 'SELECT_VEHICLE'; payload: number }
  | { type: 'SET_VEHICLE'; payload: Vehicle }
  | { type: 'SET_MAINTENANCES'; payload: Maintenance[] }
  | { type: 'UPDATE_KM'; payload: number }
  | { type: 'ADD_MAINTENANCE'; payload: Maintenance }
  | { type: 'UPDATE_POINTS'; payload: { points: number; level: Level } }
  | { type: 'RESET' };

const CACHE_KEY = '@fordcare/user_data';

// ─── Reducer ──────────────────────────────────────────────────────────────────

const initialState: State = {
  initialized: false,
  user: null,
  profile: null,
  vehicles: [],
  selectedVehicleIndex: 0,
  vehicle: null,
  maintenances: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_INITIALIZED':
      return { ...state, initialized: true };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'SET_VEHICLES': {
      const idx = Math.min(state.selectedVehicleIndex, action.payload.length - 1);
      return {
        ...state,
        vehicles: action.payload,
        selectedVehicleIndex: Math.max(0, idx),
        vehicle: action.payload[Math.max(0, idx)] ?? null,
      };
    }
    case 'ADD_VEHICLE':
      return { ...state, vehicles: [...state.vehicles, action.payload] };
    case 'SELECT_VEHICLE': {
      const idx = Math.max(0, Math.min(action.payload, state.vehicles.length - 1));
      return { ...state, selectedVehicleIndex: idx, vehicle: state.vehicles[idx] ?? null };
    }
    case 'SET_VEHICLE': {
      const updated = state.vehicles.map((v, i) =>
        i === state.selectedVehicleIndex ? action.payload : v
      );
      return { ...state, vehicle: action.payload, vehicles: updated };
    }
    case 'SET_MAINTENANCES':
      return { ...state, maintenances: action.payload };
    case 'UPDATE_KM': {
      if (!state.vehicle) return state;
      const updated = { ...state.vehicle, currentKm: action.payload };
      const updatedVehicles = state.vehicles.map((v, i) =>
        i === state.selectedVehicleIndex ? updated : v
      );
      return { ...state, vehicle: updated, vehicles: updatedVehicles };
    }
    case 'ADD_MAINTENANCE':
      return { ...state, maintenances: [action.payload, ...state.maintenances] };
    case 'UPDATE_POINTS':
      return state.profile
        ? { ...state, profile: { ...state.profile, ...action.payload } }
        : state;
    case 'RESET':
      return { ...initialState, initialized: true };
    default:
      return state;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDate(value: any): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (value?.toDate) return value.toDate();
  return new Date(value);
}

function docToVehicle(vDoc: any): Vehicle {
  const d = vDoc.data();
  return {
    id: vDoc.id,
    brand: 'Ford',
    model: d.model ?? '',
    color: d.color ?? 'black',
    year: d.year ?? 0,
    currentKm: d.currentKm ?? 0,
    lastServiceKm: d.lastServiceKm ?? 0,
    lastServiceDate: toDate(d.lastServiceDate),
  };
}

async function loadFromFirestore(uid: string, dispatch: React.Dispatch<Action>) {
  const userSnap = await getDoc(doc(db, 'users', uid));
  if (!userSnap.exists()) return;

  const data = userSnap.data();
  const profile: UserProfile = {
    uid,
    name: data.name ?? '',
    email: data.email ?? '',
    points: data.points ?? 0,
    level: data.level ?? 'bronze',
  };
  dispatch({ type: 'SET_PROFILE', payload: profile });

  const vehiclesSnap = await getDocs(collection(db, 'users', uid, 'vehicles'));
  const vehicles: Vehicle[] = vehiclesSnap.docs.map(docToVehicle);
  dispatch({ type: 'SET_VEHICLES', payload: vehicles });

  if (vehicles.length > 0) {
    const mQuery = query(
      collection(db, 'users', uid, 'maintenances'),
      orderBy('date', 'desc')
    );
    const mSnap = await getDocs(mQuery);
    const maintenances: Maintenance[] = mSnap.docs.map((d) => {
      const m = d.data();
      return {
        id: d.id,
        type: m.type ?? '',
        date: toDate(m.date),
        km: m.km ?? 0,
        dealership: m.dealership ?? '',
        notes: m.notes ?? '',
        pointsEarned: m.pointsEarned ?? 0,
      };
    });
    dispatch({ type: 'SET_MAINTENANCES', payload: maintenances });

    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ profile, vehicles, maintenances })
    );
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

type ContextValue = State & { dispatch: React.Dispatch<Action> };

const UserContext = createContext<ContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    AsyncStorage.getItem(CACHE_KEY).then((raw) => {
      if (!raw) return;
      try {
        const cached = JSON.parse(raw);
        if (cached.profile) dispatch({ type: 'SET_PROFILE', payload: cached.profile });

        // Support both old single-vehicle cache and new multi-vehicle cache
        if (cached.vehicles?.length) {
          dispatch({
            type: 'SET_VEHICLES',
            payload: cached.vehicles.map((v: any) => ({
              ...v,
              lastServiceDate: new Date(v.lastServiceDate),
            })),
          });
        } else if (cached.vehicle) {
          dispatch({
            type: 'SET_VEHICLES',
            payload: [{ ...cached.vehicle, lastServiceDate: new Date(cached.vehicle.lastServiceDate) }],
          });
        }

        if (cached.maintenances) {
          dispatch({
            type: 'SET_MAINTENANCES',
            payload: cached.maintenances.map((m: any) => ({ ...m, date: new Date(m.date) })),
          });
        }
      } catch {}
    });

    const unsub = onAuthStateChanged(auth, async (user) => {
      dispatch({ type: 'SET_USER', payload: user });

      if (user) {
        await loadFromFirestore(user.uid, dispatch);
      } else {
        await AsyncStorage.removeItem(CACHE_KEY);
        dispatch({ type: 'RESET' });
      }

      dispatch({ type: 'SET_INITIALIZED' });
    });

    return unsub;
  }, []);

  return (
    <UserContext.Provider value={{ ...state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
