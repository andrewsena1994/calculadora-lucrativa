import { Simulation, User } from '../types';
import { db, auth, isFirebaseConfigured } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';

const USER_KEY = 'preciosa_user';
const SIMULATIONS_KEY_PREFIX = 'preciosa_simulations_';
const AUTH_DB_KEY = 'preciosa_local_auth_db'; // Armazena usuários locais (simulação de banco)

export const storageService = {
  
  // --- AUTHENTICATION ---

  login: async (email: string, password?: string): Promise<User> => {
    if (isFirebaseConfigured && password && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user: User = { 
          email: userCredential.user.email || email,
          uid: userCredential.user.uid,
          name: userCredential.user.displayName || undefined
        };
        // Cache user locally to keep session state simple for this structure
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      } catch (error: any) {
        throw new Error(getFirebaseErrorMessage(error.code));
      }
    } else {
      // Fallback LocalStorage (Modo Offline Seguro)
      // Verifica se o usuário existe no "banco de dados local"
      const dbStr = localStorage.getItem(AUTH_DB_KEY);
      const localDB = dbStr ? JSON.parse(dbStr) : [];
      
      const foundUser = localDB.find((u: any) => u.email === email && u.password === password);

      if (foundUser) {
        const user = { email, uid: 'local-user-' + email, name: foundUser.name };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      } else {
        // Se não achar ou senha errada
        throw new Error("E-mail ou senha incorretos. Se não tem conta, clique em 'Criar Conta'.");
      }
    }
  },

  register: async (email: string, password?: string, name?: string): Promise<User> => {
    if (isFirebaseConfigured && password && auth) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
        }

        const user: User = { 
          email: userCredential.user.email || email,
          uid: userCredential.user.uid,
          name: name || undefined
        };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      } catch (error: any) {
        throw new Error(getFirebaseErrorMessage(error.code));
      }
    } else {
      // Fallback LocalStorage Register (Modo Offline Seguro)
      const dbStr = localStorage.getItem(AUTH_DB_KEY);
      const localDB = dbStr ? JSON.parse(dbStr) : [];

      // Verifica duplicidade
      if (localDB.find((u: any) => u.email === email)) {
        throw new Error("Este e-mail já está cadastrado.");
      }

      // Salva novo usuário
      localDB.push({ email, password, name });
      localStorage.setItem(AUTH_DB_KEY, JSON.stringify(localDB));

      const user = { email, uid: 'local-user-' + email, name };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    }
  },

  loginWithGoogle: async (): Promise<User> => {
    if (isFirebaseConfigured && auth) {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user: User = {
          email: result.user.email || '',
          uid: result.user.uid,
          name: result.user.displayName || undefined
        };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      } catch (error: any) {
        if (error.code === 'auth/popup-closed-by-user') {
          throw new Error("Login cancelado.");
        }
        throw new Error(getFirebaseErrorMessage(error.code));
      }
    } else {
      throw new Error("Google Login indisponível (Firebase não configurado).");
    }
  },

  logout: async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    localStorage.removeItem(USER_KEY);
  },

  getUser: (): User | null => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // --- DATABASE (SIMULATIONS) ---

  saveSimulation: async (user: User, simulation: Simulation) => {
    if (isFirebaseConfigured && db) {
      // Save to Cloud Firestore
      try {
        await addDoc(collection(db, "simulations"), {
          ...simulation,
          userEmail: user.email,
          userId: user.uid,
          createdAt: serverTimestamp() // Use server timestamp
        });
      } catch (e) {
        console.error("Erro ao salvar no Firebase:", e);
        throw new Error("Erro de conexão ao salvar.");
      }
    } else {
      // Save to LocalStorage
      const key = `${SIMULATIONS_KEY_PREFIX}${user.email}`;
      const existingStr = localStorage.getItem(key);
      const existing: Simulation[] = existingStr ? JSON.parse(existingStr) : [];
      const updated = [simulation, ...existing];
      localStorage.setItem(key, JSON.stringify(updated));
    }
  },

  getSimulations: async (user: User): Promise<Simulation[]> => {
    if (isFirebaseConfigured && db) {
      // Get from Cloud Firestore
      try {
        const q = query(
          collection(db, "simulations"), 
          where("userEmail", "==", user.email),
          orderBy("date", "desc") // Ordena por data (string ISO do frontend) ou createdAt
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id // Use Firestore ID
        })) as Simulation[];
      } catch (e) {
        console.error("Erro ao buscar do Firebase:", e);
        return [];
      }
    } else {
      // Get from LocalStorage
      const key = `${SIMULATIONS_KEY_PREFIX}${user.email}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    }
  },

  deleteSimulation: async (user: User, id: string) => {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, "simulations", id));
      } catch (e) {
        console.error("Erro ao deletar do Firebase:", e);
      }
    } else {
      const key = `${SIMULATIONS_KEY_PREFIX}${user.email}`;
      const existingStr = localStorage.getItem(key);
      if (!existingStr) return;
      const existing: Simulation[] = JSON.parse(existingStr);
      const updated = existing.filter(sim => sim.id !== id);
      localStorage.setItem(key, JSON.stringify(updated));
    }
  },

  clearAllSimulations: async (user: User) => {
    if (isFirebaseConfigured && db) {
      // Firestore doesn't have a "delete collection" for web clients easily,
      // we have to fetch and delete one by one or use a cloud function.
      // For simplicity here, we delete fetched docs.
      const sims = await storageService.getSimulations(user);
      for (const sim of sims) {
        await deleteDoc(doc(db, "simulations", sim.id));
      }
    } else {
      const key = `${SIMULATIONS_KEY_PREFIX}${user.email}`;
      localStorage.removeItem(key);
    }
  }
};

// Helper para traduzir erros do Firebase Auth
function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-email': return 'E-mail inválido.';
    case 'auth/user-disabled': return 'Usuário desativado.';
    case 'auth/user-not-found': return 'Usuário não encontrado.';
    case 'auth/wrong-password': return 'Senha incorreta.';
    case 'auth/email-already-in-use': return 'Este e-mail já está cadastrado.';
    case 'auth/weak-password': return 'A senha deve ter pelo menos 6 caracteres.';
    case 'auth/invalid-credential': return 'Credenciais inválidas.';
    case 'auth/popup-closed-by-user': return 'Login cancelado.';
    default: return 'Ocorreu um erro no login. Verifique seus dados.';
  }
}