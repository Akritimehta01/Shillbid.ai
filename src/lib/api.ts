const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const API_URL = `${SUPABASE_URL}/functions/v1/shillbid-api`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
};

export interface DashboardStats {
  overview: {
    total_bidders: number;
    total_auctions: number;
    total_bids: number;
    total_bid_volume: number;
    active_auctions: number;
    fraud_cases_detected: number;
    bidders_flagged: number;
    active_alerts: number;
    critical_alerts: number;
    avg_fraud_score: number;
  };
  risk_distribution: { low: number; medium: number; high: number; critical: number };
  trends: {
    fraud_cases_last_7_days: number;
    fraud_cases_last_30_days: number;
    avg_resolution_time_hours: number;
    detection_accuracy: number;
  };
}

export interface Bidder {
  id: string;
  bidder_id: string;
  name: string;
  email: string;
  registration_date: string;
  total_bids: number;
  auctions_participated: number;
  auctions_won: number;
  win_ratio: number;
  fraud_risk_score: number;
  anomaly_score: number;
  risk_level: string;
  is_flagged: boolean;
  flag_reasons: string[];
  late_bidding_score: number;
}

export interface Auction {
  id: string;
  auction_id: string;
  seller_ref: string;
  title: string;
  category: string;
  reserve_price: number;
  starting_price: number;
  final_price: number;
  current_price: number;
  start_time: string;
  end_time: string;
  duration_hours: number;
  total_bids: number;
  unique_bidders: number;
  bid_velocity: number;
  price_inflation_percent: number;
  fraud_risk_score: number;
  risk_level: string;
  is_flagged: boolean;
  status: string;
  winner_ref: string | null;
}

export interface FraudAlert {
  id: string;
  alert_id: string;
  alert_type: string;
  severity: string;
  status: string;
  auction_ref: string | null;
  bidder_ref: string | null;
  seller_ref: string | null;
  title: string;
  description: string;
  fraud_score: number;
  contributing_factors: string[];
  created_at: string;
}

export interface NetworkNode {
  id: string;
  type: 'bidder' | 'seller';
  name: string;
  fraud_score: number;
  is_flagged: boolean;
  risk_level?: string;
}

export interface NetworkEdge {
  source: string;
  target: string;
  weight: number;
  collusion_probability: number;
  suspicious: boolean;
}

export interface FraudNetwork {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  rings: Array<{ bidders: string[]; seller: string; probability: number }>;
  suspicious_edges: number;
  total_edges: number;
  total_bidders: number;
  total_sellers: number;
}

export interface Prediction {
  id: string;
  prediction_id: string;
  entity_type: string;
  entity_ref: string;
  model_name: string;
  model_version: string;
  fraud_probability: number;
  risk_level: string;
  confidence: number;
  input_features: Record<string, number>;
  shap_values: Record<string, number>;
  top_positive_factors: Array<{ feature: string; value: number }>;
  explanation_summary: string;
  detailed_factors: Array<{ factor: string; impact: string }>;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_URL}/dashboard/stats`, { headers });
  if (!response.ok) throw new Error('Failed to fetch dashboard stats');
  return response.json();
}

export async function fetchBidders(params: { risk_level?: string; search?: string; limit?: number }): Promise<{ bidders: Bidder[] }> {
  const queryParams = new URLSearchParams();
  if (params.risk_level) queryParams.append('risk_level', params.risk_level);
  if (params.search) queryParams.append('search', params.search);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  const response = await fetch(`${API_URL}/bidders?${queryParams}`, { headers });
  if (!response.ok) throw new Error('Failed to fetch bidders');
  return response.json();
}

export async function fetchAuctions(params: { status?: string; risk_level?: string; limit?: number }): Promise<{ auctions: Auction[] }> {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.risk_level) queryParams.append('risk_level', params.risk_level);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  const response = await fetch(`${API_URL}/auctions?${queryParams}`, { headers });
  if (!response.ok) throw new Error('Failed to fetch auctions');
  return response.json();
}

export async function fetchFraudAlerts(params: { status?: string; severity?: string; limit?: number }): Promise<{ alerts: FraudAlert[] }> {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.severity) queryParams.append('severity', params.severity);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  const response = await fetch(`${API_URL}/fraud-alerts?${queryParams}`, { headers });
  if (!response.ok) throw new Error('Failed to fetch alerts');
  return response.json();
}

export async function fetchFraudNetwork(): Promise<FraudNetwork> {
  const response = await fetch(`${API_URL}/fraud-network`, { headers });
  if (!response.ok) throw new Error('Failed to fetch network');
  return response.json();
}

export async function fetchPrediction(entityType: string, entityId: string): Promise<{ prediction: Prediction | null }> {
  const response = await fetch(`${API_URL}/predict/${entityType}/${entityId}`, { headers });
  if (!response.ok) throw new Error('Failed to fetch prediction');
  return response.json();
}
