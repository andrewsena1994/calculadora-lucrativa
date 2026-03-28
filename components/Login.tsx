import React, { useState } from 'react';
import { User } from '../types';
import { storageService } from '../services/storage';
import { Button, Input, Card } from './ui/Components';
import { LogIn, Gem, UserPlus } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (isRegister) {
      if (!name) {
        setError("Por favor, digite seu nome.");
        return;
      }
      if (password !== confirmPassword) {
        setError("As senhas não conferem.");
        return;
      }
    }

    setLoading(true);
    
    try {
      let user;
      if (isRegister) {
        user = await storageService.register(email, password, name);
      } else {
        user = await storageService.login(email, password);
      }
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Erro ao tentar entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="bg-white w-24 h-24 rounded-full mb-4 flex items-center justify-center shadow-lg ring-4 ring-pink-400/30">
            <Gem className="text-pink-500 w-12 h-12 drop-shadow-sm" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-md">Calculadora Preciosa</h1>
          <p className="text-pink-100 text-sm md:text-base">
            "Transforme sua revenda em um salário previsível todos os meses."
          </p>
        </div>

        <Card className="shadow-2xl">
          <div className="flex justify-center mb-6 border-b border-gray-100 pb-2">
            <button 
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`px-4 py-2 font-medium text-sm transition-colors ${!isRegister ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Entrar
            </button>
            <button 
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`px-4 py-2 font-medium text-sm transition-colors ${isRegister ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Criar Conta
            </button>
          </div>

          <h2 className="text-xl font-semibold text-center mb-6 text-gray-800">
            {isRegister ? 'Crie sua conta grátis' : 'Bem-vinda de volta'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <Input 
                label="Nome completo" 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                placeholder="Seu nome"
              />
            )}

            <Input 
              label="E-mail" 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
            
            <Input 
              label="Senha" 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)} 
              placeholder="******"
            />

            {isRegister && (
              <Input 
                label="Confirmar senha" 
                type="password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)} 
                placeholder="Repita sua senha"
              />
            )}
            
            {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded border border-red-100">{error}</p>}
            
            <Button type="submit" className="mt-4 shadow-lg transform active:scale-[0.99]" disabled={loading}>
              {loading ? 'Carregando...' : (
                isRegister ? (
                  <> <UserPlus size={20} /> Cadastrar </>
                ) : (
                  <> <LogIn size={20} /> Entrar com E-mail </>
                )
              )}
            </Button>
          </form>
        </Card>
        
        <p className="text-center text-pink-200 text-xs mt-8 opacity-70">
          © 2024 Calculadora Preciosa Lucrativa - Modo Local
        </p>
      </div>
    </div>
  );
};
