import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export type VehicleData = {
  brand: 'Ford';
  model: string;
  color: string;
  year: number;
  currentKm: number;
  lastServiceKm: number;
  lastServiceDate: Date;
};

export async function salvarVeiculo(userId: string, data: VehicleData) {
  const ref = await addDoc(collection(db, 'users', userId, 'vehicles'), {
    ...data,
    lastServiceDate: data.lastServiceDate,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function atualizarKm(userId: string, vehicleId: string, newKm: number) {
  const ref = doc(db, 'users', userId, 'vehicles', vehicleId);
  await updateDoc(ref, { currentKm: newKm });
}

export async function buscarVeiculos(userId: string) {
  const snap = await getDocs(collection(db, 'users', userId, 'vehicles'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function atualizarServico(userId: string, vehicleId: string, km: number, date: Date) {
  const ref = doc(db, 'users', userId, 'vehicles', vehicleId);
  await updateDoc(ref, { lastServiceKm: km, lastServiceDate: date });
}
