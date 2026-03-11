export interface CashFlowForecast {
  tenantId: string;
  currentCashPosition: number;
  forecast30Day: number;
  forecast60Day: number;
  forecast90Day: number;
  avgDailyInflow: number;
  avgDailyOutflow: number;
  riskLevel: string;
  generatedDate: string;
}

export interface ScenarioRequest {
  tenantId: string;
  scenarioName: string;
  revenueChangePercent: number;
  expenseChangePercent: number;
  interestRateChange?: number;
  projectionMonths: number;
}

export interface ScenarioResult {
  tenantId: string;
  scenarioName: string;
  baselineNetIncome: number;
  projectedNetIncome: number;
  projectedCashFlow: number;
  impactOnCash: number;
  impactPercent: number;
  summary: string;
}

export interface MarketValuation {
  tenantId: string;
  totalHoldings: number;
  totalCostBasis: number;
  totalMarketValue: number;
  totalUnrealizedGainLoss: number;
  gainLossPercent: number;
  valuationDate: string;
  holdings: HoldingValuation[];
}

export interface HoldingValuation {
  symbol: string;
  holdingName: string;
  holdingType: string;
  quantity: number;
  costBasis: number;
  currentPrice: number;
  marketValue: number;
  unrealizedGainLoss: number;
  gainLossPercent: number;
}

export interface TransactionAnomaly {
  transactionId: number;
  tenantId: string;
  anomalyType: string;
  description: string;
  amount: number;
  expectedRange: number;
  confidenceScore: number;
  severity: string;
}

export interface MarketSentiment {
  symbol: string;
  headline: string;
  source: string;
  sentimentScore: string;
  summary: string;
  publishedDate: string;
}
