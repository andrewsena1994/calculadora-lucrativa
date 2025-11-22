
import React, { useState, useEffect } from 'react';
import { User } from './types';
import { storageService } from './services/storage';
import { Login } from './components/Login';
import { SalaryTab } from './components/SalaryTab';
import { PricingTab } from './components/PricingTab';
import { AccountTab } from './components/AccountTab';
import { LogOut, DollarSign, Tag, User as UserIcon, Gem } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = storageService.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    storageService.logout();
    setUser(null);
    setActiveTab(0);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-pink-50 text-pink-600">Carregando...</div>;

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-600">
               <Gem size={18} />
            </div>
            <span className="font-bold text-gray-800 hidden sm:block">Calculadora Preciosa</span>
          </div>
          <button 
            onClick={handleLogout}
            className="text-gray-500 hover:text-pink-600 flex items-center gap-1 text-sm font-medium transition-colors"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-3xl mx-auto px-4">
          <nav className="flex space-x-1" aria-label="Tabs">
            {[
              { name: 'Faça seu Salário', icon: <DollarSign size={18} /> },
              { name: 'Precificação', icon: <Tag size={18} /> },
              { name: 'Minha Conta', icon: <UserIcon size={18} /> },
            ].map((tab, index) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(index)}
                className={`
                  flex-1 py-3 px-1 text-center border-b-2 font-medium text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition-colors
                  ${activeTab === index
                    ? 'border-pink-500 text-pink-600 bg-pink-50/50 rounded-t-md'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.icon}
                <span className={`${activeTab === index ? 'block' : 'hidden sm:block'}`}>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto max-w-3xl px-4 py-6">
        {/* Dynamic Tab Content */}
        <div className="bg-transparent">
          {activeTab === 0 && <SalaryTab user={user} />}
          {activeTab === 1 && <PricingTab user={user} />}
          {activeTab === 2 && <AccountTab user={user} />}
        </div>

        {/* Footer Motivation */}
        <div className="mt-12 text-center pb-8">
          <p className="text-gray-400 text-xs italic">
            {activeTab === 0 && "Planejamento é a chave do sucesso."}
            {activeTab === 1 && "Preço certo, lucro constante, mente tranquila."}
            {activeTab === 2 && "Você não vende só roupas, você constrói sonhos."}
          </p>
        </div>
      </main>
    </div>
  );
};

export default App;
