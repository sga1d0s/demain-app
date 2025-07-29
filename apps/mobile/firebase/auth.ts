// mobile/firebase/auth.ts
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseApp } from './config';

export const auth = getAuth(firebaseApp);

// Crear cuenta
export async function register(email: string, password: string) {
  return await createUserWithEmailAndPassword(auth, email, password);
}

// Iniciar sesión
export async function login(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}