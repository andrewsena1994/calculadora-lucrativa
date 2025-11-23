
export interface User {
  email: string;
  name?: string;
  uid?: string; // Firebase User ID
}

export interface SalarySimulation {
  id: string;
  type: 'salary';
  date: string;
  inputs: {
    targetSalary: number;
    margin: number;
    avgTicket: number;
  };
  results: {
    profitPerPiece: number;
    piecesPerMonth: number;
    piecesPerWeek: number;
    piecesPerDay: number;
    dailyRevenueGoal: number; 
    totalMonthlyRevenue: number;
    projectedMonthlyProfit: number;
    totalInvestment: number;
    dailyProfitGoal: number;
  };
}

export interface PricingSimulation {
  id: string;
  type: 'pricing';
  subtype?: string; 
  date: string;
  inputs: {
    cost: number;
    margin: number; 
    cardRate: number;
  };
  results: {
    priceCash: number;
    priceCard: number;
    profitCash: number;
    profitCard: number;
    suggestedPromoPrice?: number; 
    difference?: number;
    priceCardEmbedded?: number;
    receivedEmbedded?: number;
    profitCardEmbedded?: number;
  };
}

export type Simulation = SalarySimulation | PricingSimulation;

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}