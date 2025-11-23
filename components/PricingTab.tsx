import React, { useState } from 'react';
import { Calculator, CreditCard, Save, Tag, Coins, Info, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button, Input, Card } from './ui/Components';
import { storageService } from '../services/storage';
import { User, PricingSimulation } from '../types';

interface PricingTabProps {
  user: User;
}

export const PricingTab: React.FC<PricingTabProps> = ({ user }) => {
  // Inputs
  const [cost, setCost] = useState<string>('');
  const [margin, setMargin] = useState<string>('');
  const [cardRate, setCardRate] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Result
  const [result, setResult] = useState<PricingSimulation['results'] | null>(null);

  const marginOptions = [
    { label: 'Atacado 50%', value: 50 },
    { label: 'Varejo Barato 80%', value: 80 },
    { label: 'Varejo Médio 100%', value: 100 },
    { label: 'Varejo Premium 120%', value: 120 },
  ];

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const c = parseFloat(cost);
    const m = parseFloat(margin);
    const rate = parseFloat(cardRate);

    if (!c || isNaN(m) || isNaN(rate)) return;

    // --- 1. STANDARD CALCULATION ---
    
    // Desired profit based on margin %
    const profitDesired = c * (m / 100);

    // Price Cash = Cost + Desired Profit
    const priceCash = c + profitDesired;

    // --- 2. SIMPLE CARD STRATEGY (Price same as Cash) ---
    // In this strategy, the customer pays the same price as cash.
    // The rate is deducted from the profit.
    const priceCard = priceCash; 
    
    // Amount Received = PriceCard * (1 - rate)
    const amountReceived = priceCard * (1 - rate / 100);
    
    // Profit Card = Amount Received - Cost
    const profitCard = amountReceived - c;

    // Difference (Cash Profit vs Card Profit)
    const difference = (priceCash - c) - profitCard;

    // Profit Cash
    const profitCash = priceCash - c;

    // Suggestion: Promo Price (~5-10% discount on cash price)
    const suggestedPromoPrice = priceCash * 0.95; 

    // --- 3. EMBEDDED RATE CALCULATION (Margin Preservation) ---
    // Logic: We want the Net Amount Received to equal (Cost + Desired Profit)
    // NetReceived = PriceEmbedded * (1 - rate)
    // PriceEmbedded = (Cost + Desired Profit) / (1 - rate)
    
    const priceCardEmbedded = (c + profitDesired) / (1 - rate / 100);
    const receivedEmbedded = priceCardEmbedded * (1 - rate / 100);
    const profitCardEmbedded = receivedEmbedded - c;

    setResult({
      priceCash,
      priceCard,
      profitCash,
      profitCard,
      difference,
      suggestedPromoPrice,
      priceCardEmbedded,
      receivedEmbedded,
      profitCardEmbedded
    });
  };

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      await storageService.saveSimulation(user, {
        id: Date.now().toString(),
        type: 'pricing',
        date: new Date().toISOString(),
        inputs: {
          cost: parseFloat(cost),
          margin: parseFloat(margin),
          cardRate: parseFloat(cardRate)
        },
        results: result
      });
      alert("Simulação de precificação salva com sucesso!");
    } catch (e) {
      alert("Erro ao salvar simulação.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Precificação Inteligente</h2>
        <p className="text-pink-600 font-medium mt-1">"Cada etiqueta bem feita é um passo a mais para o seu salário dos sonhos."</p>
      </div>

      <Card className="border-t-4 border-t-pink-500">
        <form onSubmit={handleCalculate} className="space-y-6">
          {/* Cost Input */}
          <Input
            label="Preço de custo do produto (R$)"
            type="number"
            step="0.01"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            required
            placeholder="Ex: 25.00"
          />

          {/* Margin Section */}
          <div className="space-y-3">
            <Input
              label="Margem de lucro desejada (%)"
              type="number"
              step="1"
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
              required
              placeholder="Ex: 100"
            />
            
            {/* Margin Chips */}
            <div className="flex flex-wrap gap-2">
              {marginOptions.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setMargin(opt.value.toString())}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    margin === opt.value.toString()
                      ? 'bg-pink-600 text-white border-pink-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Margin Legend */}
            <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-2 border border-gray-100">
              <p><strong>Atacado 50%:</strong> Margem usada para vendas de peças "bate caixa", clientes que compram toda semana, ideal para girar rápido.</p>
              <p><strong>Varejo Barato 80%:</strong> Perfeito para peças populares, ofertas e produtos de forte giro.</p>
              <p><strong>Varejo Medio 100%:</strong> Margem equilibrada do varejo tradicional. Gera lucro saudável.</p>
              <p><strong>Varejo Premium 120%:</strong> Indicado para peças premium, novidades ou itens de valor agregado.</p>
            </div>
          </div>

          {/* Card Rate */}
          <div className="space-y-2">
            <Input
              label="Média de taxa do cartão (%)"
              type="number"
              step="0.01"
              value={cardRate}
              onChange={(e) => setCardRate(e.target.value)}
              required
              placeholder="Ex: 10"
            />
            <p className="text-xs text-gray-500">
              A taxa varia conforme bandeira, máquina e número de parcelas. Quanto mais parcelas, maior a taxa. Aqui você usa uma média estimada para calcular seus preços com segurança.
            </p>
          </div>

          <Button type="submit">
            <Calculator size={20} />
            Calcular Preços
          </Button>
        </form>
      </Card>

      {result && (
        <div className="space-y-6 animate-fade-in-up">
          
          {/* Standard Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cash Scenario */}
            <div className="bg-white rounded-xl shadow-sm border border-pink-100 overflow-hidden">
              <div className="bg-pink-50 px-4 py-3 border-b border-pink-100">
                <h4 className="font-bold text-pink-800 flex items-center gap-2">
                  <Coins size={18} /> Venda à Vista
                </h4>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs uppercase text-gray-500 font-semibold">Preço Sugerido</p>
                  <p className="text-2xl font-bold text-gray-900">R$ {result.priceCash.toFixed(2)}</p>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs uppercase text-gray-500 font-semibold">Seu Lucro Real</p>
                  <p className="text-xl font-bold text-green-600">R$ {result.profitCash.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Simple Card Scenario */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                  <CreditCard size={18} /> Venda no Cartão (Simples)
                </h4>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs uppercase text-gray-500 font-semibold">Preço cobrado (sem taxa embutida)</p>
                  <p className="text-2xl font-bold text-gray-900">R$ {result.priceCard.toFixed(2)}</p>
                </div>
                
                <div className="pt-2 pb-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Valor que você recebe:</p>
                    <p className="font-semibold text-gray-700">R$ {(result.priceCard * (1 - (parseFloat(cardRate)/100))).toFixed(2)}</p>
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-500 font-semibold">Lucro no cartão (simples)</p>
                  <p className={`text-xl font-bold ${result.profitCard < result.profitCash ? 'text-amber-600' : 'text-blue-600'}`}>
                    R$ {result.profitCard.toFixed(2)}
                  </p>
                </div>

                <div className="mt-2 pt-2 text-xs text-gray-500 leading-tight">
                  Na opção Simples, o cliente paga o mesmo preço do à vista. A taxa do cartão é descontada do seu lucro.
                </div>
              </div>
            </div>
          </div>

          {/* Embedded Rate Strategy */}
          <div className="bg-indigo-50 rounded-xl border border-indigo-200 overflow-hidden">
            <div className="bg-indigo-100 px-4 py-3 border-b border-indigo-200 flex items-center justify-between">
              <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                <ShieldCheck size={18} /> Opção: Taxa Embutida
              </h4>
              <span className="text-[10px] font-bold bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full uppercase tracking-wide">Margem Cheia</span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <p className="text-xs uppercase text-indigo-400 font-bold mb-1">Preço no Cartão (Taxa Embutida)</p>
                    <p className="text-3xl font-bold text-indigo-900">R$ {result.priceCardEmbedded?.toFixed(2)}</p>
                    <p className="text-xs text-indigo-600 mt-1">Preço maior para cobrir a taxa.</p>
                 </div>
                 <div className="flex flex-col justify-center md:border-l md:border-indigo-200 md:pl-6">
                    <div className="mb-2">
                      <p className="text-xs text-indigo-500">Valor recebido após taxa:</p>
                      <p className="font-semibold text-indigo-900">R$ {result.receivedEmbedded?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-indigo-500">Lucro no cartão (Margem mantida):</p>
                      <p className="font-bold text-green-600 text-lg">R$ {result.profitCardEmbedded?.toFixed(2)}</p>
                    </div>
                 </div>
              </div>
              <div className="mt-4 pt-4 border-t border-indigo-200 text-xs text-indigo-700 leading-relaxed flex items-start gap-2">
                <Info size={14} className="mt-0.5 flex-shrink-0" />
                <p>
                  Nesse cenário, a taxa do cartão é colocada em cima do valor do produto. 
                  Assim, mesmo pagando a taxa, você continua lucrando a mesma porcentagem que escolheu.
                </p>
              </div>
            </div>
          </div>

          {/* Discount Suggestion */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Tag size={18} className="text-pink-400" /> Sugestão de Desconto à Vista
              </h4>
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                Para incentivar mais vendas no dinheiro, você pode oferecer o produto por aproximadamente <span className="text-white font-bold">R$ {result.suggestedPromoPrice?.toFixed(2)}</span> à vista.
                Isso dá um desconto leve e ainda mantém um lucro saudável.
              </p>
              <div className="inline-block bg-white/10 px-3 py-1 rounded text-xs text-pink-200">
                ~5% de desconto sobre o preço à vista calculado
              </div>
            </div>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-pink-500 rounded-full opacity-20 blur-xl"></div>
          </div>

          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            <Save size={20} />
            {isSaving ? 'Salvando...' : 'Salvar esta precificação'}
          </Button>
        </div>
      )}
    </div>
  );
};