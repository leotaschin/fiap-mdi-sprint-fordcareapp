import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export async function cadastrar(name: string, email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(credential.user, { displayName: name });

  await setDoc(doc(db, 'users', credential.user.uid), {
    name,
    email,
    points: 0,
    level: 'bronze',
    createdAt: serverTimestamp(),
  });

  return credential.user;
}

export async function login(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logout() {
  await signOut(auth);
}

export async function esqueceuSenha(email: string) {
  await sendPasswordResetEmail(auth, email);
}
