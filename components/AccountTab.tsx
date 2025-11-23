import React, { useEffect, useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, User as UserIcon } from 'lucide-react';
import { storageService } from '../services/storage';
import { User, Simulation, PricingSimulation } from '../types';
import { Button, Card } from './ui/Components';

interface AccountTabProps {
  user: User;
}

export const AccountTab: React.FC<AccountTabProps> = ({ user }) => {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [user.email]);

  const loadData = async () => {
    setLoading(true);
    const data = await storageService.getSimulations(user);
    setSimulations(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta simulação?")) {
      await storageService.deleteSimulation(user, id);
      loadData();
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Isso apagará TODO o seu histórico. Tem certeza?")) {
      await storageService.clearAllSimulations(user);
      loadData();
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (isoString: string) => {
    // Check if it is a Firestore Timestamp (seconds) or ISO String
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Data inválida';

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderPricingDetails = (sim: PricingSimulation) => {
    // Handle both legacy (subtype) and new unified format
    const marginValue = sim.inputs.margin !== undefined ? sim.inputs.margin : (sim.inputs as any).marginOrMultiplier;
    const isLegacy = sim.subtype !== undefined;
    const displayMargin = isLegacy && sim.subtype === 'popular' ? `x${marginValue}` : `${marginValue}%`;

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>Custo: <strong>R$ {sim.inputs.cost.toFixed(2)}</strong></div>
          <div>Margem: <strong>{displayMargin}</strong></div>
          <div>Taxa Cartão: <strong>{sim.inputs.cardRate}%</strong></div>
          <div>Preço Vista: <strong>R$ {sim.results.priceCash.toFixed(2)}</strong></div>
          <div className="text-green-600">Lucro Vista: <strong>R$ {sim.results.profitCash.toFixed(2)}</strong></div>
          <div className="text-amber-600">Lucro Cartão (Simples): <strong>R$ {sim.results.profitCard.toFixed(2)}</strong></div>
        </div>

        {sim.results.priceCardEmbedded && (
          <div className="p-2 bg-indigo-50 rounded border border-indigo-100 text-indigo-900 text-xs mt-2">
            <div className="font-bold mb-1">Opção Taxa Embutida:</div>
            <div className="grid grid-cols-2 gap-2">
               <span>Preço: <strong>R$ {sim.results.priceCardEmbedded.toFixed(2)}</strong></span>
               <span>Lucro: <strong>R$ {sim.results.profitCardEmbedded?.toFixed(2)}</strong></span>
            </div>
          </div>
        )}

        {sim.results.suggestedPromoPrice && (
          <div className="p-2 bg-pink-50 rounded border border-pink-100 text-pink-800 text-xs">
            Sugestão Promo: <strong>R$ {sim.results.suggestedPromoPrice.toFixed(2)}</strong>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-pink-600 to-pink-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-full">
            <UserIcon size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold">Minha Conta</h2>
        </div>
        <p className="text-pink-100">Olá, {user.email}</p>
        <div className="mt-4 pt-4 border-t border-pink-400/50 text-sm italic opacity-90">
          "Quem se organiza, lucra mais. Continue ajustando seus preços e suas metas."
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Simulações Salvas ({simulations.length})</h3>
        {simulations.length > 0 && (
          <button onClick={handleClearAll} className="text-xs text-red-600 hover:text-red-800 underline">
            Apagar tudo
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Carregando histórico...</div>
      ) : simulations.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">Você ainda não salvou nenhuma simulação.</p>
          <p className="text-gray-400 text-sm">Vá para as outras abas e comece a calcular!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {simulations.map((sim) => (
            <Card key={sim.id} className="!p-0 overflow-hidden">
              <div 
                className="p-4 flex justify-between items-center cursor-pointer bg-white hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(sim.id)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                      sim.type === 'salary' ? 'bg-purple-100 text-purple-700' : 'bg-pink-100 text-pink-700'
                    }`}>
                      {sim.type === 'salary' ? 'Salário' : 'Precificação'}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(sim.date)}</span>
                  </div>
                  <p className="font-medium text-gray-800 mt-1 text-sm sm:text-base">
                    {sim.type === 'salary' 
                      ? `Meta Lucro: R$ ${sim.inputs.targetSalary.toFixed(2)}` 
                      : `Produto: R$ ${sim.inputs.cost.toFixed(2)} ➔ Venda: R$ ${sim.results.priceCash.toFixed(2)}`
                    }
                  </p>
                </div>
                <div className="text-gray-400 pl-2">
                  {expandedId === sim.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {expandedId === sim.id && (
                <div className="bg-gray-50 p-4 border-t border-gray-100 text-sm space-y-3">
                  {sim.type === 'salary' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div>Margem: <strong>{sim.inputs.margin}%</strong></div>
                      <div>Ticket Médio: <strong>R$ {sim.inputs.avgTicket}</strong></div>
                      <div>Peças/Mês: <strong>{sim.results.piecesPerMonth}</strong></div>
                      
                      <div className="col-span-2 border-t border-gray-100 pt-2 mt-1 space-y-1">
                        <div className="text-blue-700">Investimento Necessário: <strong>R$ {sim.results.totalInvestment ? sim.results.totalInvestment.toFixed(2) : '---'}</strong></div>
                        <div className="text-pink-700">Faturamento Estimado: <strong>R$ {sim.results.totalMonthlyRevenue.toFixed(2)}</strong></div>
                        <div className="text-green-700 text-base">Lucro Mensal: <strong>R$ {sim.results.projectedMonthlyProfit ? sim.results.projectedMonthlyProfit.toFixed(2) : (sim.results.piecesPerMonth * sim.results.profitPerPiece).toFixed(2)}</strong></div>
                      </div>
                    </div>
                  ) : renderPricingDetails(sim as PricingSimulation)}
                  
                  <div className="pt-2 flex justify-end border-t border-gray-200 mt-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(sim.id); }}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs font-semibold py-2"
                    >
                      <Trash2 size={14} /> Excluir simulação
                    </button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};