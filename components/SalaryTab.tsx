
import React, { useState } from 'react';
import { DollarSign, Calendar, Package, TrendingUp, Save, HelpCircle, Info, Target, Gem, Wallet, ShoppingBag } from 'lucide-react';
import { Button, Input, Card, ResultCard } from './ui/Components';
import { storageService } from '../services/storage';
import { User } from '../types';

interface SalaryTabProps {
  user: User;
}

export const SalaryTab: React.FC<SalaryTabProps> = ({ user }) => {
  const [targetSalary, setTargetSalary] = useState<string>('');
  const [margin, setMargin] = useState<string>('');
  const [avgTicket, setAvgTicket] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [message, setMessage] = useState<string>('');

  const marginOptions = [
    { label: 'Atacado 50%', value: 50 },
    { label: 'Varejo Barato 80%', value: 80 },
    { label: 'Varejo Médio 100%', value: 100 },
    { label: 'Varejo Premium 120%', value: 120 },
  ];

  const ticketOptions = [
    { label: 'Peças Baratas (R$ 15)', value: 15 },
    { label: 'Peças Médias (R$ 30)', value: 30 },
    { label: 'Peças Premium (R$ 50)', value: 50 },
  ];

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const salary = parseFloat(targetSalary);
    const margPercentage = parseFloat(margin);
    const ticket = parseFloat(avgTicket);

    if (!salary || !margPercentage || !ticket) {
      setMessage("Por favor, preencha todos os campos corretamente.");
      return;
    }

    // CORREÇÃO DO CÁLCULO:
    // A margem informada é Markup (sobre o custo).
    // Fórmula: PreçoVenda = Custo * (1 + Margem/100)
    // Portanto: Custo = PreçoVenda / (1 + Margem/100)
    
    const markupMultiplier = 1 + (margPercentage / 100);
    const estimatedCost = ticket / markupMultiplier;
    const profitPerPiece = ticket - estimatedCost;
    
    if (profitPerPiece <= 0.01) {
      setMessage("Verifique os valores. Com essa margem e ticket, o lucro parece zerado.");
      return;
    }

    // Quantidade de peças necessárias para atingir a meta de LUCRO (Salary)
    const piecesPerMonth = Math.ceil(salary / profitPerPiece);
    const piecesPerWeek = Math.ceil(piecesPerMonth / 4);
    const piecesPerDay = Math.ceil(piecesPerMonth / 30);
    
    // Cálculos Financeiros
    // Faturamento total necessário = Peças * Preço Cheio (Ticket)
    const totalMonthlyRevenue = piecesPerMonth * ticket; 
    
    // Investimento Total Necessário = Peças * Custo da Peça
    const totalInvestment = piecesPerMonth * estimatedCost;

    // Lucro total mensal previsto (pode ser levemente maior que a meta devido ao arredondamento das peças)
    const projectedMonthlyProfit = piecesPerMonth * profitPerPiece;
    
    const dailyProfitGoal = salary / 30; // Meta diária de lucro
    const dailyRevenueGoal = totalMonthlyRevenue / 30; // Meta diária de vendas (faturamento)

    setResult({
      profitPerPiece,
      piecesPerMonth,
      piecesPerWeek,
      piecesPerDay,
      dailyRevenueGoal,
      dailyProfitGoal,
      totalMonthlyRevenue,
      totalInvestment,
      projectedMonthlyProfit,
      ticket // Valor médio por peça explicitly
    });
    setMessage('');
  };

  const handleSave = () => {
    if (!result) return;
    
    storageService.saveSimulation(user.email, {
      id: Date.now().toString(),
      type: 'salary',
      date: new Date().toISOString(),
      inputs: {
        targetSalary: parseFloat(targetSalary),
        margin: parseFloat(margin),
        avgTicket: parseFloat(avgTicket)
      },
      results: result
    });
    alert("Simulação salva com sucesso!");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Faça seu Salário</h2>
        <p className="text-pink-600 font-medium mt-1">
          "Defina sua meta, faça seu plano e execute todos os dias."
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Seu esforço merece um salário planejado. Descubra quantas peças você precisa vender para chegar lá.
        </p>
      </div>

      <Card className="border-t-4 border-t-pink-500">
        <form onSubmit={handleCalculate} className="space-y-6">
          {/* Target Salary */}
          <div>
            <Input
              label="Quanto você quer ganhar de LUCRO por mês? (R$)"
              type="number"
              step="0.01"
              placeholder="Ex: 3000.00"
              value={targetSalary}
              onChange={(e) => setTargetSalary(e.target.value)}
              required
            />
            
            {/* Explanation Block: Profit vs Revenue */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
              <div className="flex items-start gap-2">
                <Info className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                <div className="text-sm text-blue-800 space-y-2">
                  <p className="font-semibold">Entenda a diferença:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li><strong>Valor de venda:</strong> É o total que você fatura vendendo as peças (ex: vender 10 peças de R$ 50 = R$ 500 em vendas).</li>
                    <li><strong>Lucro:</strong> É o que sobra para você depois de pagar o custo das peças e as taxas (ex: se cada peça custa R$ 25 e você vende a R$ 50, seu lucro é R$ 25 por peça).</li>
                  </ul>
                  <p className="text-xs italic text-blue-600 pt-1 border-t border-blue-200">
                    "Aqui nesta calculadora, quando você coloca quanto quer ganhar por mês, estamos falando do valor de LUCRO que você quer colocar no bolso, e não apenas do total vendido."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Margin Section */}
          <div className="space-y-3">
            <Input
              label="Margem média de lucro (%) por peça"
              type="number"
              step="0.1"
              placeholder="Ex: 100"
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
              required
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

            {/* Margin Legends */}
            <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-2 border border-gray-100">
              <p><strong>Atacado 50%:</strong> Margem usada para vendas em quantidade, ideal para revendedoras que aproveitam sempre as ofertas da loja e também compram peças "bate caixa" e querem girar rápido.</p>
              <p><strong>Varejo Barato 80%:</strong> Margem usada em peças de entrada e preços atraentes, onde o giro é mais rápido.</p>
              <p><strong>Varejo Medio 100%:</strong> Margem tradicional e equilibrada do varejo, garantindo lucro saudável sem assustar o cliente.</p>
              <p><strong>Varejo Premium 120%:</strong> Margem recomendada para peças premium, novidades ou itens de maior valor percebido.</p>
            </div>
          </div>

          {/* Ticket Section */}
          <div className="space-y-3">
            <Input
              label="Ticket médio por peça (R$)"
              type="number"
              step="0.01"
              placeholder="Ex: 60.00"
              value={avgTicket}
              onChange={(e) => setAvgTicket(e.target.value)}
              required
            />

            {/* Ticket Chips */}
            <div className="flex flex-wrap gap-2">
              {ticketOptions.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setAvgTicket(opt.value.toString())}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    avgTicket === opt.value.toString()
                      ? 'bg-pink-600 text-white border-pink-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Ticket Legends */}
            <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-2 border border-gray-100">
              <p><strong>Peças Baratas (R$ 15,00):</strong> Itens de alto giro, geralmente usados em promoções, ofertas e varejo popular.</p>
              <p><strong>Peças Médias (R$ 30,00):</strong> Ticket mais comum da maioria das revendas. É o equilíbrio entre giro e margem.</p>
              <p><strong>Peças Premium (R$ 50,00):</strong> Peças de maior qualidade ou tendência. Ideal para clientes que compram roupas mais elaboradas.</p>
            </div>

             {/* How to Find Ticket Info */}
             <div className="bg-pink-50/50 p-4 rounded-lg border border-pink-100 mt-4">
              <h4 className="flex items-center gap-2 text-sm font-bold text-pink-700 mb-2">
                <HelpCircle size={14} /> Ticket Médio (R$) - Como definir?
              </h4>
              <div className="text-xs text-gray-600 space-y-2">
                <div>
                  <strong className="block text-gray-700">Se você já vende produtos:</strong>
                  <p>Para descobrir seu ticket médio, some o valor total das últimas vendas e divida pela quantidade de peças vendidas. Exemplo: Se você vendeu R$ 1.500 em 50 peças, seu ticket médio é R$ 30,00.</p>
                </div>
                <div className="mt-2">
                  <strong className="block text-gray-700">Se você ainda não vende:</strong>
                  <p>Escolha seu ticket médio com base no público que você quer atingir:</p>
                  <ul className="list-disc list-inside ml-1 mt-1 space-y-0.5">
                    <li>Público popular → peças baratas (R$ 15,00)</li>
                    <li>Público intermediário → peças médias (R$ 30,00)</li>
                    <li>Público premium → peças de maior qualidade (R$ 50,00 ou mais).</li>
                  </ul>
                  <p className="mt-1">Use o ticket que melhor representa o tipo de cliente que você deseja alcançar.</p>
                </div>
              </div>
            </div>
          </div>

          {message && <p className="text-red-500 text-sm font-medium">{message}</p>}
          
          <Button type="submit">
            <DollarSign size={20} />
            Calcular meu salário
          </Button>
        </form>
      </Card>

      {result && (
        <div className="space-y-4 animate-fade-in-up">
          
          {/* Highlighted Results */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             {/* Card: Lucro por peça */}
             <ResultCard 
              icon={<TrendingUp size={16} />}
              label="Lucro por peça (estimado)" 
              value={`R$ ${result.profitPerPiece.toFixed(2)}`} 
              highlight
            />
            {/* Card: Valor médio */}
            <ResultCard 
              icon={<Gem size={16} />}
              label="Preço de Venda (Ticket)" 
              value={`R$ ${result.ticket.toFixed(2)}`} 
            />
          </div>
          
          {/* Monthly Goals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Investimento */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col justify-between">
               <div className="text-sm text-blue-800 font-medium mb-1 flex items-center gap-2">
                  <ShoppingBag size={16} className="text-blue-600"/>
                  Investimento Necessário
               </div>
               <div className="text-xl font-bold text-blue-700">
                  R$ {result.totalInvestment.toFixed(2)}
               </div>
               <div className="text-xs text-blue-600 mt-1">(Custo total das peças)</div>
            </div>

            {/* Faturamento */}
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 flex flex-col justify-between">
               <div className="text-sm text-pink-800 font-medium mb-1 flex items-center gap-2">
                  <DollarSign size={16} className="text-pink-600"/>
                  Faturamento Mensal
               </div>
               <div className="text-xl font-bold text-pink-700">
                  R$ {result.totalMonthlyRevenue.toFixed(2)}
               </div>
               <div className="text-xs text-pink-500 mt-1">(Total em Vendas)</div>
            </div>

            {/* Lucro Total */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col justify-between sm:col-span-2">
               <div className="text-sm text-green-800 font-medium mb-1 flex items-center gap-2">
                  <Wallet size={16} className="text-green-600"/>
                  Lucro Total Mensal (Seu Salário)
               </div>
               <div className="text-2xl font-bold text-green-700">
                  R$ {result.projectedMonthlyProfit.toFixed(2)}
               </div>
               <div className="text-xs text-green-600 mt-1">Valor líquido previsto no seu bolso</div>
            </div>
          </div>

          {/* Pieces Count */}
          <ResultCard 
              icon={<Package size={16} />}
              label="Total de peças necessárias no mês" 
              value={`${result.piecesPerMonth} und`} 
          />

          {/* Daily Goals - Highlighted Complex Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 text-white shadow-lg border border-gray-700">
             <div className="flex items-center gap-2 mb-4 border-b border-gray-700 pb-3">
                <Target className="text-pink-400" size={24} />
                <div>
                  <h3 className="text-lg font-bold">Meta diária (lucro e vendas)</h3>
                  <p className="text-xs text-gray-400">Média para alcançar seu objetivo mensal</p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
                <div>
                   <p className="text-gray-400 text-xs uppercase font-bold mb-1">Lucro diário</p>
                   <p className="text-2xl font-bold text-green-400">R$ {result.dailyProfitGoal.toFixed(2)}</p>
                </div>
                <div className="sm:border-l sm:border-gray-700 sm:pl-4">
                   <p className="text-gray-400 text-xs uppercase font-bold mb-1">Vendas diárias</p>
                   <p className="text-xl font-bold text-white">R$ {result.dailyRevenueGoal.toFixed(2)}</p>
                   <p className="text-[10px] text-gray-500">(Faturamento)</p>
                </div>
                <div className="sm:border-l sm:border-gray-700 sm:pl-4">
                   <p className="text-gray-400 text-xs uppercase font-bold mb-1">Peças/Dia</p>
                   <p className="text-xl font-bold text-white">{result.piecesPerDay} <span className="text-sm font-normal text-gray-400">und</span></p>
                   <p className="text-[10px] text-gray-500">(Média)</p>
                </div>
             </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
             <p className="text-blue-700 text-sm italic">
               "Aqui você vê quanto precisa investir, vender e lucrar por mês. O investimento é o custo da mercadoria, o faturamento é a venda total, e o lucro é seu salário."
             </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
            <p className="text-green-800 font-semibold">
              "Você é capaz de bater essa meta. Organize suas ações e venda todos os dias."
            </p>
          </div>

          <Button variant="outline" onClick={handleSave}>
            <Save size={20} />
            Salvar esta simulação
          </Button>
        </div>
      )}
    </div>
  );
};
