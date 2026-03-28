import { Simulation, User } from '../types';

// Chaves do LocalStorage
const SESSION_KEY = 'preciosa_session'; // Usuário logado no momento
const USERS_DB_KEY = 'preciosa_users_db'; // "Banco de dados" de usuários cadastrados (Array)
const SIMULATIONS_KEY_PREFIX = 'preciosa_simulations_'; // Prefixo para dados de cada usuário

export const storageService = {
  
  // --- AUTHENTICATION (LOCAL MOCK DB) ---

  login: async (email: string, password?: string): Promise<User> => {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    // Busca o banco de dados de usuários
    const dbStr = localStorage.getItem(USERS_DB_KEY);
    const localDB = dbStr ? JSON.parse(dbStr) : [];
    
    // Procura o usuário
    const foundUser = localDB.find((u: any) => u.email === email && u.password === password);

    if (foundUser) {
      // Cria a sessão
      const user: User = { 
        email: foundUser.email, 
        uid: foundUser.uid, 
        name: foundUser.name 
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    } else {
      throw new Error("E-mail ou senha incorretos. Se não tem conta, clique em 'Criar Conta'.");
    }
  },

  register: async (email: string, password?: string, name?: string): Promise<User> => {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    const dbStr = localStorage.getItem(USERS_DB_KEY);
    const localDB = dbStr ? JSON.parse(dbStr) : [];

    // Verifica se já existe
    if (localDB.find((u: any) => u.email === email)) {
      throw new Error("Este e-mail já está cadastrado.");
    }

    // Cria novo usuário
    const newUser = {
      uid: 'user_' + Date.now(),
      email,
      password, // Em um app real, nunca salve senha pura. Aqui é apenas simulação local.
      name,
      createdAt: new Date().toISOString()
    };

    // Salva no "Banco"
    localDB.push(newUser);
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(localDB));

    // Loga o usuário automaticamente
    const userSession: User = { email, uid: newUser.uid, name };
    localStorage.setItem(SESSION_KEY, JSON.stringify(userSession));
    
    return userSession;
  },

  // Método removido, mas mantido vazio para compatibilidade se algo chamar
  loginWithGoogle: async (): Promise<User> => {
    throw new Error("Login com Google desativado (Modo Local).");
  },

  logout: async () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getUser: (): User | null => {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // --- DATABASE (SIMULATIONS - LOCALSTORAGE) ---

  saveSimulation: async (user: User, simulation: Simulation) => {
    // Simula delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const key = `${SIMULATIONS_KEY_PREFIX}${user.email}`;
    const existingStr = localStorage.getItem(key);
    const existing: Simulation[] = existingStr ? JSON.parse(existingStr) : [];
    
    // Adiciona a nova simulação no topo
    const updated = [simulation, ...existing];
    localStorage.setItem(key, JSON.stringify(updated));
  },

  getSimulations: async (user: User): Promise<Simulation[]> => {
    const key = `${SIMULATIONS_KEY_PREFIX}${user.email}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  },

  deleteSimulation: async (user: User, id: string) => {
    const key = `${SIMULATIONS_KEY_PREFIX}${user.email}`;
    const existingStr = localStorage.getItem(key);
    if (!existingStr) return;
    
    const existing: Simulation[] = JSON.parse(existingStr);
    const updated = existing.filter(sim => sim.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));
  },

  clearAllSimulations: async (user: User) => {
    const key = `${SIMULATIONS_KEY_PREFIX}${user.email}`;
    localStorage.removeItem(key);
  }
};
