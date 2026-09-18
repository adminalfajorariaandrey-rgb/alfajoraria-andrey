import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './firebase';
import { AuthUser } from '../types';

export const DEFAULT_ADMIN_EMAIL = 'adminalfajorariaandrey@gmail.com';

function mapFirebaseUser(user: User | null): AuthUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'Administrador',
  };
}

export function getCurrentAdmin(): AuthUser | null {
  return mapFirebaseUser(auth.currentUser);
}

// Backward compatibility alias
export const getCurrentOwner = getCurrentAdmin;

export async function signInAdmin(email: string, password: string): Promise<AuthUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!normalizedEmail) {
    throw new Error('Por favor, informe o e-mail de acesso.');
  }
  if (!trimmedPassword) {
    throw new Error('Por favor, digite a senha de acesso.');
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, normalizedEmail, trimmedPassword);
    const mapped = mapFirebaseUser(credential.user);
    if (!mapped) throw new Error('Não foi possível identificar o usuário autenticado.');
    return mapped;
  } catch (error: any) {
    // Se o usuário não existir no Firebase Auth (primeiro login do admin), provisiona automaticamente
    if (
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/invalid-credential'
    ) {
      try {
        const newCredential = await createUserWithEmailAndPassword(
          auth,
          normalizedEmail,
          trimmedPassword
        );
        const mapped = mapFirebaseUser(newCredential.user);
        if (mapped) return mapped;
      } catch (createError: any) {
        if (createError.code === 'auth/email-already-in-use') {
          throw new Error('E-mail ou senha incorretos. Verifique suas credenciais.');
        }
        if (createError.code === 'auth/weak-password') {
          throw new Error('A senha deve ter no mínimo 6 caracteres.');
        }
      }
    }

    // Mensagens amigáveis para os erros do Firebase Auth
    if (
      error.code === 'auth/invalid-credential' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/user-not-found'
    ) {
      throw new Error('E-mail ou senha incorretos. Verifique os dados digitados.');
    }
    if (error.code === 'auth/invalid-email') {
      throw new Error('O formato do e-mail informado é inválido.');
    }
    if (error.code === 'auth/too-many-requests') {
      throw new Error('Muitas tentativas com erro. Por favor, aguarde alguns minutos e tente novamente.');
    }
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Falha de conexão com os servidores do Firebase. Verifique sua internet.');
    }

    throw new Error(error.message || 'Falha ao autenticar no Firebase.');
  }
}

// Backward compatibility alias
export const signInOwner = signInAdmin;

export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}

// Backward compatibility alias
export const signOutOwner = signOutAdmin;

export function subscribeToAuth(callback: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(auth, (firebaseUser) => {
    callback(mapFirebaseUser(firebaseUser));
  });
}

// Backward compatibility alias
export const subscribeToOwnerAuth = subscribeToAuth;
