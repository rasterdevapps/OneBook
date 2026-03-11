import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CashFlowForecast,
  ScenarioRequest,
  ScenarioResult,
  MarketValuation,
  TransactionAnomaly,
  MarketSentiment
} from '../models/ai.models';

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly http = inject(HttpClient);

  getForecast(tenantId: string): Observable<CashFlowForecast> {
    return this.http.get<CashFlowForecast>(`/api/forecast?tenantId=${tenantId}`);
  }

  runScenario(request: ScenarioRequest): Observable<ScenarioResult> {
    return this.http.post<ScenarioResult>('/api/forecast/scenario', request);
  }

  getPortfolioValuation(tenantId: string): Observable<MarketValuation> {
    return this.http.get<MarketValuation>(`/api/market/valuation?tenantId=${tenantId}`);
  }

  getAnomalies(tenantId: string): Observable<TransactionAnomaly[]> {
    return this.http.get<TransactionAnomaly[]>(`/api/anomalies?tenantId=${tenantId}`);
  }

  getMarketSentiment(tenantId: string): Observable<MarketSentiment[]> {
    return this.http.get<MarketSentiment[]>(`/api/market/sentiment?tenantId=${tenantId}`);
  }

  getDigitalAssets(tenantId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/digital-assets?tenantId=${tenantId}`);
  }
}
