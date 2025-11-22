
import React, { useState } from 'react';
import { User } from '../types';
import { storageService } from '../services/storage';
import { Button, Input, Card } from './ui/Components';
import { LogIn, Gem } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Not used for real auth in this demo
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Preencha todos os campos");
      return;
    }
    
    // Mock login
    const user = storageService.login(email);
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          {/* Logo Diamond */}
          <div className="bg-white w-24 h-24 rounded-full mb-4 flex items-center justify-center shadow-lg ring-4 ring-pink-400/30">
            <Gem className="text-pink-500 w-12 h-12 drop-shadow-sm" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-md">Calculadora Preciosa</h1>
          <p className="text-pink-100 text-sm md:text-base">
            "Transforme sua revenda em um salário previsível todos os meses."
          </p>
        </div>

        <Card className="shadow-2xl">
          <h2 className="text-xl font-semibold text-center mb-6 text-gray-800">Bem-vinda de volta</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="E-mail" 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoFocus
            />
            <Input 
              label="Senha" 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)} 
              placeholder="******"
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="mt-4 shadow-lg transform active:scale-95">
              <LogIn size={20} />
              Entrar
            </Button>
          </form>
        </Card>
        
        <p className="text-center text-pink-200 text-xs mt-8 opacity-70">
          © 2024 Calculadora Preciosa Lucrativa
        </p>
      </div>
    </div>
  );
};
