import { Simulation, User } from '../types';

const USER_KEY = 'preciosa_user';
const SIMULATIONS_KEY_PREFIX = 'preciosa_simulations_';

export const storageService = {
  login: (email: string): User => {
    const user = { email };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(USER_KEY);
  },

  getUser: (): User | null => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  saveSimulation: (email: string, simulation: Simulation) => {
    const key = `${SIMULATIONS_KEY_PREFIX}${email}`;
    const existingStr = localStorage.getItem(key);
    const existing: Simulation[] = existingStr ? JSON.parse(existingStr) : [];
    
    // Add to beginning of list
    const updated = [simulation, ...existing];
    localStorage.setItem(key, JSON.stringify(updated));
  },

  getSimulations: (email: string): Simulation[] => {
    const key = `${SIMULATIONS_KEY_PREFIX}${email}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  },

  deleteSimulation: (email: string, id: string) => {
    const key = `${SIMULATIONS_KEY_PREFIX}${email}`;
    const existingStr = localStorage.getItem(key);
    if (!existingStr) return;

    const existing: Simulation[] = JSON.parse(existingStr);
    const updated = existing.filter(sim => sim.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));
  },

  clearAllSimulations: (email: string) => {
    const key = `${SIMULATIONS_KEY_PREFIX}${email}`;
    localStorage.removeItem(key);
  }
};