
export interface User {
  email: string;
  name?: string;
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
    dailyRevenueGoal: number; // Keeps legacy name for Daily Revenue (Sales)
    // New detailed fields
    totalMonthlyRevenue: number;
    projectedMonthlyProfit: number; // Total Profit
    totalInvestment: number; // New field: Cost of Goods Sold total
    dailyProfitGoal: number;
  };
}

export interface PricingSimulation {
  id: string;
  type: 'pricing';
  subtype?: string; // Optional now, kept for legacy data compatibility
  date: string;
  inputs: {
    cost: number;
    margin: number; // Unified margin input
    cardRate: number;
  };
  results: {
    priceCash: number;
    priceCard: number;
    profitCash: number;
    profitCard: number;
    suggestedPromoPrice?: number; 
    difference?: number;
    // New fields for Embedded Rate Strategy
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
