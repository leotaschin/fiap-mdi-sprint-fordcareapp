import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  increment,
  serverTimestamp,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from './firebase';

export type MaintenanceData = {
  type: string;
  date: Date;
  km: number;
  dealership: string;
  notes: string;
  pointsEarned: number;
};

export async function registrarManutencao(userId: string, data: MaintenanceData) {
  const ref = await addDoc(collection(db, 'users', userId, 'maintenances'), {
    ...data,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, 'users', userId), {
    points: increment(data.pointsEarned),
  });

  return ref.id;
}

export async function buscarManutencoes(userId: string) {
  const q = query(
    collection(db, 'users', userId, 'maintenances'),
    orderBy('date', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
