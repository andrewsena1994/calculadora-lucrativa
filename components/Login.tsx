import React, { useState } from 'react';
import { User } from '../types';
import { storageService } from '../services/storage';
import { isFirebaseConfigured } from '../services/firebase';
import { Button, Input, Card } from './ui/Components';
import { LogIn, Gem, UserPlus, Github } from 'lucide-react';

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

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await storageService.loginWithGoogle();
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Erro no login com Google.");
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

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Ou continue com</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
          </form>
        </Card>
        
        <p className="text-center text-pink-200 text-xs mt-8 opacity-70">
          © 2024 Calculadora Preciosa Lucrativa
        </p>
      </div>
    </div>
  );
};