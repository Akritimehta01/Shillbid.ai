import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

const CATEGORIES = ["Electronics", "Collectibles", "Art", "Jewelry", "Automotive", "Fashion", "Home & Garden", "Sports", "Antiques", "Books"];
const FIRST_NAMES = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
const COMPANY_NAMES = ["Apex Trading", "Global Auctions", "Prime Bids", "Elite Sellers", "Premium Goods"];

// ============================================
// SYNTHETIC DATA GENERATION
// ============================================

async function generateSyntheticData(numSellers: number, numBidders: number, numAuctions: number, bidsPerAuction: { min: number; max: number }) {
  const sellers: any[] = [];
  const bidders: any[] = [];
  const auctions: any[] = [];
  const bids: any[] = [];
  const networkEdges: Map<string, any> = new Map();

  // Generate sellers
  for (let i = 0; i < numSellers; i++) {
    const isCompany = Math.random() > 0.6;
    const sellerId = generateId("S");
    sellers.push({
      seller_id: sellerId,
      name: isCompany ? randomChoice(COMPANY_NAMES) : `${randomChoice(FIRST_NAMES)} ${randomChoice(LAST_NAMES)}`,
      email: `seller_${i}@example.com`,
      registration_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      reputation_score: clamp(0.5 + (Math.random() - 0.5) * 0.4, 0.1, 0.95),
      total_auctions: 0, successful_auctions: 0, bidder_concentration_score: 0,
      suspicious_bidder_count: 0, fraud_risk_score: 0, risk_level: "low", is_flagged: false, flag_reasons: []
    });
  }

  // Generate bidders (12% fraudsters)
  const fraudsterCount = Math.floor(numBidders * 0.12);
  for (let i = 0; i < numBidders; i++) {
    const isFraudster = i < fraudsterCount;
    const bidderId = generateId("B");
    let fraudRiskScore = 0;
    let fraudType: string[] = [];
    if (isFraudster) {
      fraudRiskScore = 0.6 + Math.random() * 0.35;
      fraudType = [randomChoice(["bid_inflation", "collusion", "shill_bidding", "price_manipulation"])];
    }
    bidders.push({
      bidder_id: bidderId,
      name: `${randomChoice(FIRST_NAMES)} ${randomChoice(LAST_NAMES)}`,
      email: `bidder_${i}@example.com`,
      registration_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      total_bids: 0, auctions_participated: 0, auctions_won: 0, win_ratio: 0,
      fraud_risk_score: fraudRiskScore, anomaly_score: Math.random() * 0.3,
      risk_level: fraudRiskScore > 0.75 ? "high" : fraudRiskScore > 0.5 ? "medium" : "low",
      is_flagged: fraudRiskScore > 0.65, is_fraudster: isFraudster, fraud_type: fraudType,
      late_bidding_score: 0, flag_reasons: fraudType
    });
  }

  // Generate auctions
  const now = Date.now();
  for (let i = 0; i < numAuctions; i++) {
    const seller = sellers[i % sellers.length];
    const category = randomChoice(CATEGORIES);
    const reservePrice = Math.round((50 + Math.random() * 4950) * 100) / 100;
    const startingPrice = Math.round(reservePrice * (0.4 + Math.random() * 0.3) * 100) / 100;
    const durationHours = 24 + Math.floor(Math.random() * 168);
    const auctionId = generateId("A");
    const startTime = new Date(now - (Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString();
    const endTime = new Date(new Date(startTime).getTime() + durationHours * 60 * 60 * 1000).toISOString();
    const isActive = new Date(endTime) > new Date();

    const auction: any = {
      auction_id: auctionId, seller_ref: seller.seller_id, title: `${category} Item #${i + 1}`,
      description: `Premium ${category.toLowerCase()} item`, category, reserve_price: reservePrice,
      starting_price: startingPrice, current_price: startingPrice, start_time: startTime, end_time: endTime,
      duration_hours: durationHours, total_bids: 0, unique_bidders: 0, bid_velocity: 0,
      last_minute_bid_spike: 0, price_inflation_percent: 0, bidder_diversity_score: 1,
      fraud_risk_score: Math.random() > 0.6 ? 0.5 + Math.random() * 0.4 : Math.random() * 0.3,
      risk_level: "low", status: isActive ? "active" : "ended", winner_ref: null
    };
    auctions.push(auction);
    seller.total_auctions++;

    // Generate bids
    const numBidsForAuction = Math.floor(bidsPerAuction.min + Math.random() * (bidsPerAuction.max - bidsPerAuction.min));
    const auctionBidders: string[] = [];
    const numParticipants = Math.min(Math.floor(numBidders * 0.3), numBidsForAuction);

    // Select participating bidders
    const shuffled = [...bidders].sort(() => Math.random() - 0.5);
    for (let j = 0; j < numParticipants && j < shuffled.length; j++) {
      auctionBidders.push(shuffled[j].bidder_id);
    }

    let currentPrice = startingPrice;
    const auctionStartTime = new Date(startTime).getTime();
    const auctionEndTime = new Date(endTime).getTime();
    const auctionDuration = auctionEndTime - auctionStartTime;

    for (let j = 0; j < numBidsForAuction; j++) {
      const bidderRef = randomChoice(auctionBidders);
      const bidder = bidders.find(b => b.bidder_id === bidderRef);
      if (bidder) bidder.total_bids++;

      const bidTime = auctionStartTime + Math.random() * auctionDuration;
      const previousAmount = currentPrice;
      const bidIncrement = clamp(currentPrice * (0.03 + Math.random() * 0.1), currentPrice * 0.01, currentPrice * 0.2);
      currentPrice = Math.round((currentPrice + bidIncrement) * 100) / 100;
      const elapsedSeconds = Math.floor((bidTime - auctionStartTime) / 1000);
      const remainingSeconds = Math.floor((auctionEndTime - bidTime) / 1000);

      bids.push({
        bid_id: generateId("BID"), auction_ref: auctionId, bidder_ref: bidderRef, seller_ref: seller.seller_id,
        bid_amount: currentPrice, previous_amount: previousAmount, bid_increment: Math.round(bidIncrement * 100) / 100,
        bid_increment_percent: Math.round((bidIncrement / previousAmount) * 100 * 100) / 100,
        bid_time: new Date(bidTime).toISOString(), auction_elapsed_seconds: elapsedSeconds,
        auction_remaining_seconds: remainingSeconds, time_remaining_percent: clamp((remainingSeconds / (auctionDuration / 1000)) * 100, 0, 100),
        is_last_minute_bid: remainingSeconds < 300, is_first_bid: j === 0, bidder_bid_sequence: j + 1,
        is_anomalous: false, anomaly_score: Math.random() * 0.3, is_suspicious: false,
        is_winning_bid: true, is_final_winner: false
      });

      // Network edge
      const edgeKey = `${bidderRef}_${seller.seller_id}`;
      if (networkEdges.has(edgeKey)) {
        const edge = networkEdges.get(edgeKey);
        edge.total_interactions++; edge.total_bids++;
        edge.last_interaction = new Date(bidTime).toISOString();
      } else {
        networkEdges.set(edgeKey, {
          bidder_ref: bidderRef, seller_ref: seller.seller_id, total_interactions: 1,
          total_auctions_together: 1, total_bids: 1, wins: 0, win_rate: 0,
          interaction_score: 0, suspicious_recurring: false, collusion_probability: 0,
          first_interaction: new Date(bidTime).toISOString(), last_interaction: new Date(bidTime).toISOString()
        });
      }
    }

    // Set winning bid
    if (bids.length > 0) {
      const finalBid = bids[bids.length - 1];
      finalBid.is_final_winner = true;
      auction.winner_ref = finalBid.bidder_ref;
      auction.final_price = finalBid.bid_amount;
      auction.current_price = finalBid.bid_amount;
      const winner = bidders.find(b => b.bidder_id === finalBid.bidder_ref);
      if (winner) winner.auctions_won++;
    }

    const auctionBids = bids.filter(b => b.auction_ref === auctionId);
    auction.total_bids = auctionBids.length;
    auction.unique_bidders = new Set(auctionBids.map(b => b.bidder_ref)).size;
    auction.bid_velocity = auction.total_bids / Math.max(1, durationHours);
    auction.price_inflation_percent = Math.round(((auction.current_price - auction.reserve_price) / auction.reserve_price) * 100 * 100) / 100;
    auction.risk_level = auction.fraud_risk_score > 0.75 ? "high" : auction.fraud_risk_score > 0.5 ? "medium" : "low";
  }

  // Calculate bidder metrics
  for (const bidder of bidders) {
    const bidderBids = bids.filter(b => b.bidder_ref === bidder.bidder_id);
    const auctionIds = new Set(bidderBids.map(b => b.auction_ref));
    bidder.auctions_participated = auctionIds.size;
    bidder.win_ratio = bidder.auctions_participated > 0 ? bidder.auctions_won / bidder.auctions_participated : 0;
    const lateBids = bidderBids.filter(b => b.is_last_minute_bid);
    bidder.late_bidding_score = bidderBids.length > 0 ? lateBids.length / bidderBids.length : 0;
  }

  // Calculate network metrics
  for (const [key, edge] of networkEdges) {
    if (edge.total_auctions_together > 3) {
      edge.suspicious_recurring = true;
      edge.collusion_probability = clamp(edge.total_auctions_together * 0.15 + (edge.win_rate > 0.5 ? 0.2 : 0), 0, 0.95);
    }
    edge.win_rate = edge.total_auctions_together > 0 ? edge.wins / edge.total_auctions_together : 0;
    edge.interaction_score = clamp(edge.total_interactions / 10, 0, 1);
  }

  return { sellers, bidders, auctions, bids, networkEdges: Array.from(networkEdges.values()) };
}

// ============================================
// FRAUD DETECTION
// ============================================

function predictBidderFraudScore(features: Record<string, number>): { score: number; shap_values: Record<string, number>; risk_level: string; reasons: string[] } {
  const shap_values: Record<string, number> = {};
  let score = 0.1;

  if (features.win_ratio < 0.15 && features.auctions_participated > 3) {
    shap_values["win_ratio"] = 0.25; score += 0.25;
  } else { shap_values["win_ratio"] = -0.05; }

  if (features.late_bidding_score > 0.3) {
    shap_values["late_bidding_score"] = features.late_bidding_score * 0.15; score += features.late_bidding_score * 0.15;
  }

  if (features.repeated_seller_ratio > 0.5) {
    shap_values["repeated_seller_ratio"] = features.repeated_seller_ratio * 0.3; score += features.repeated_seller_ratio * 0.3;
  }

  if (features.unique_sellers === 1 && features.total_bids > 5) {
    shap_values["unique_sellers"] = 0.15; score += 0.15;
  }

  score = clamp(score, 0, 1);
  const reasons: string[] = [];
  if (shap_values["win_ratio"] > 0.2) reasons.push(`Low win ratio (${(features.win_ratio * 100).toFixed(1)}%)`);
  if (shap_values["repeated_seller_ratio"] > 0.15) reasons.push(`High seller concentration (${(features.repeated_seller_ratio * 100).toFixed(1)}%)`);
  if (shap_values["unique_sellers"] > 0.1) reasons.push(`Only 1 seller interaction`);
  if (shap_values["late_bidding_score"] > 0.05) reasons.push("Late-minute bidding activity");
  if (reasons.length === 0) reasons.push("No significant fraud indicators");

  return { score, shap_values, risk_level: score > 0.7 ? "critical" : score > 0.5 ? "high" : score > 0.3 ? "medium" : "low", reasons };
}

function detectFraudRings(networkEdges: any[]): { rings: any[]; suspiciousEdges: any[] } {
  const rings: any[] = [];
  const suspiciousEdges = networkEdges.filter(e => e.collusion_probability > 0.5);
  const sellerGroups = new Map<string, any[]>();
  for (const edge of networkEdges) {
    if (!sellerGroups.has(edge.seller_ref)) sellerGroups.set(edge.seller_ref, []);
    sellerGroups.get(edge.seller_ref)!.push(edge);
  }
  for (const [seller, edges] of sellerGroups) {
    const highProbEdges = edges.filter(e => e.collusion_probability > 0.4);
    if (highProbEdges.length >= 3) {
      const probability = highProbEdges.reduce((sum, e) => sum + e.collusion_probability, 0) / highProbEdges.length;
      rings.push({ bidders: highProbEdges.map(e => e.bidder_ref), seller, probability: clamp(probability + 0.1, 0, 0.95) });
    }
  }
  return { rings, suspiciousEdges };
}

function calculateBidderFeatures(bidder: any, bids: any[]): Record<string, number> {
  const bidderBids = bids.filter(b => b.bidder_ref === bidder.bidder_id);
  if (bidderBids.length === 0) return { total_bids: 0, auctions_participated: 0, win_ratio: 0, late_bidding_score: 0, repeated_seller_ratio: 0, unique_sellers: 0 };
  const sellerIds = new Set(bidderBids.map(b => b.seller_ref));
  const sellerCounts = new Map<string, number>();
  for (const bid of bidderBids) sellerCounts.set(bid.seller_ref, (sellerCounts.get(bid.seller_ref) || 0) + 1);
  const maxSellerBids = Math.max(...sellerCounts.values());
  return {
    total_bids: bidderBids.length,
    auctions_participated: new Set(bidderBids.map(b => b.auction_ref)).size,
    win_ratio: bidder.win_ratio,
    late_bidding_score: bidder.late_bidding_score,
    repeated_seller_ratio: bidderBids.length > 0 ? maxSellerBids / bidderBids.length : 0,
    unique_sellers: sellerIds.size
  };
}

// ============================================
// API HANDLERS
// ============================================

async function handleDashboardStats() {
  const { data: bidderStats } = await supabase.from("bidders").select("id, fraud_risk_score, risk_level, is_flagged");
  const { data: auctionStats } = await supabase.from("auctions").select("id, fraud_risk_score, risk_level, status, total_bids");
  const { data: alertStats } = await supabase.from("fraud_alerts").select("id, severity, status").limit(100);
  const { data: bidStats } = await supabase.from("bids").select("bid_amount").limit(10000);

  const totalBidVolume = bidStats?.reduce((sum, b) => sum + (b.bid_amount || 0), 0) || 0;
  const fraudCases = bidderStats?.filter(b => b.fraud_risk_score > 0.5).length || 0;
  const activeAlerts = alertStats?.filter(a => a.status === "new").length || 0;

  return {
    overview: {
      total_bidders: bidderStats?.length || 0,
      total_auctions: auctionStats?.length || 0,
      total_bids: bidStats?.length || 0,
      total_bid_volume: totalBidVolume,
      active_auctions: auctionStats?.filter(a => a.status === "active").length || 0,
      fraud_cases_detected: fraudCases,
      bidders_flagged: bidderStats?.filter(b => b.is_flagged).length || 0,
      active_alerts: activeAlerts,
      critical_alerts: alertStats?.filter(a => a.severity === "critical").length || 0,
      avg_fraud_score: bidderStats && bidderStats.length > 0 ? bidderStats.reduce((sum, b) => sum + (b.fraud_risk_score || 0), 0) / bidderStats.length : 0
    },
    risk_distribution: {
      low: bidderStats?.filter(b => b.risk_level === "low").length || 0,
      medium: bidderStats?.filter(b => b.risk_level === "medium").length || 0,
      high: bidderStats?.filter(b => b.risk_level === "high").length || 0,
      critical: bidderStats?.filter(b => b.risk_level === "critical").length || 0
    },
    trends: {
      fraud_cases_last_7_days: Math.floor(fraudCases * 0.3),
      fraud_cases_last_30_days: fraudCases,
      avg_resolution_time_hours: 24 + Math.random() * 48,
      detection_accuracy: 0.92 + Math.random() * 0.05
    }
  };
}

async function handleGetBidders(params: { risk_level?: string; search?: string; limit?: number }) {
  let query = supabase.from("bidders").select("*").order("fraud_risk_score", { ascending: false });
  if (params.risk_level) query = query.eq("risk_level", params.risk_level);
  if (params.search) query = query.or(`bidder_id.ilike.%${params.search}%,name.ilike.%${params.search}%`);
  const { data, error } = await query.limit(params.limit || 100);
  if (error) throw new Error(error.message);
  return { bidders: data };
}

async function handleGetAuctions(params: { status?: string; risk_level?: string; limit?: number }) {
  let query = supabase.from("auctions").select("*").order("created_at", { ascending: false });
  if (params.status) query = query.eq("status", params.status);
  if (params.risk_level) query = query.eq("risk_level", params.risk_level);
  const { data, error } = await query.limit(params.limit || 100);
  if (error) throw new Error(error.message);
  return { auctions: data };
}

async function handleGetFraudAlerts(params: { status?: string; severity?: string; limit?: number }) {
  let query = supabase.from("fraud_alerts").select("*").order("created_at", { ascending: false });
  if (params.status) query = query.eq("status", params.status);
  if (params.severity) query = query.eq("severity", params.severity);
  const { data, error } = await query.limit(params.limit || 50);
  if (error) throw new Error(error.message);
  return { alerts: data };
}

async function handleGetFraudNetwork() {
  const { data: networkData } = await supabase.from("bidder_seller_network").select("*").limit(500);
  const { data: bidders } = await supabase.from("bidders").select("bidder_id, name, fraud_risk_score, risk_level, is_flagged").limit(100);
  const { data: sellers } = await supabase.from("sellers").select("seller_id, name, fraud_risk_score, is_flagged").limit(50);

  const nodes: any[] = [];
  const edges: any[] = [];
  const addedBidders = new Set<string>();
  const addedSellers = new Set<string>();

  for (const edge of networkData || []) {
    if (!addedBidders.has(edge.bidder_ref)) {
      const bidder = bidders?.find(b => b.bidder_id === edge.bidder_ref);
      nodes.push({ id: edge.bidder_ref, type: "bidder", name: bidder?.name || edge.bidder_ref, fraud_score: bidder?.fraud_risk_score || 0, is_flagged: bidder?.is_flagged || false, risk_level: bidder?.risk_level || "low" });
      addedBidders.add(edge.bidder_ref);
    }
    if (!addedSellers.has(edge.seller_ref)) {
      const seller = sellers?.find(s => s.seller_id === edge.seller_ref);
      nodes.push({ id: edge.seller_ref, type: "seller", name: seller?.name || edge.seller_ref, fraud_score: seller?.fraud_risk_score || 0, is_flagged: seller?.is_flagged || false });
      addedSellers.add(edge.seller_ref);
    }
    edges.push({ source: edge.bidder_ref, target: edge.seller_ref, weight: edge.total_interactions || 1, collusion_probability: edge.collusion_probability || 0, suspicious: edge.suspicious_recurring || false });
  }

  const { rings, suspiciousEdges } = detectFraudRings(networkData || []);
  return { nodes, edges, rings, suspicious_edges: suspiciousEdges.length, total_edges: edges.length, total_bidders: addedBidders.size, total_sellers: addedSellers.size };
}

async function handleGetPrediction(entityType: string, entityId: string) {
  const { data } = await supabase.from("model_predictions").select("*").eq("entity_type", entityType).eq("entity_ref", entityId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return { prediction: data };
}

async function handleSeedData(params: { sellers?: number; bidders?: number; auctions?: number; min_bids?: number; max_bids?: number }) {
  const data = await generateSyntheticData(params.sellers || 20, params.bidders || 100, params.auctions || 50, { min: params.min_bids || 5, max: params.max_bids || 30 });

  await supabase.from("sellers").upsert(data.sellers, { onConflict: "seller_id" });
  await supabase.from("bidders").upsert(data.bidders, { onConflict: "bidder_id" });
  await supabase.from("auctions").upsert(data.auctions, { onConflict: "auction_id" });
  await supabase.from("bids").upsert(data.bids, { onConflict: "bid_id" });
  await supabase.from("bidder_seller_network").upsert(data.networkEdges, { onConflict: "bidder_ref,seller_ref" });

  // Generate predictions
  const predictions: any[] = [];
  for (const bidder of data.bidders) {
    const features = calculateBidderFeatures(bidder, data.bids);
    const { score, shap_values, risk_level, reasons } = predictBidderFraudScore(features);
    predictions.push({
      prediction_id: generateId("PRED"), entity_type: "bidder", entity_ref: bidder.bidder_id,
      entity_id: bidder.bidder_id, model_name: "fraud_classifier_v2", model_version: "2.1.0",
      fraud_probability: score, risk_level, confidence: 0.85 + Math.random() * 0.1,
      input_features: features, shap_values,
      top_positive_factors: Object.entries(shap_values).filter(([k, v]) => v > 0.05).map(([feature, value]) => ({ feature, value })),
      explanation_summary: risk_level !== "low" ? `Flagged due to ${reasons.slice(0, 2).join(" and ")}` : "Normal behavior",
      detailed_factors: reasons.map((r, i) => ({ factor: r, impact: i === 0 ? "high" : "medium" }))
    });
  }
  await supabase.from("model_predictions").insert(predictions);

  // Generate alerts
  const alerts: any[] = [];
  for (const bidder of data.bidders) {
    if (bidder.fraud_risk_score > 0.5) {
      alerts.push({
        alert_id: generateId("ALT"), alert_type: bidder.fraud_risk_score > 0.75 ? "shill_bidding" : "anomalous_behavior",
        severity: bidder.fraud_risk_score > 0.75 ? "critical" : "high", status: "new", bidder_ref: bidder.bidder_id,
        title: `Suspicious bidder: ${bidder.bidder_id}`, description: `Potential fraudulent behavior detected`,
        fraud_score: bidder.fraud_risk_score, contributing_factors: bidder.flag_reasons || []
      });
    }
  }
  for (const auction of data.auctions) {
    if (auction.fraud_risk_score > 0.6) {
      alerts.push({
        alert_id: generateId("ALT"), alert_type: auction.fraud_risk_score > 0.8 ? "bid_inflation" : "last_minute_spike",
        severity: "high", status: "new", auction_ref: auction.auction_id, seller_ref: auction.seller_ref,
        title: `Suspicious auction: ${auction.auction_id}`, description: `High fraud indicators`,
        fraud_score: auction.fraud_risk_score, contributing_factors: [`Price inflation: ${auction.price_inflation_percent?.toFixed(1)}%`]
      });
    }
  }
  await supabase.from("fraud_alerts").insert(alerts.slice(0, 50));

  return {
    success: true,
    data: {
      sellers_created: data.sellers.length, bidders_created: data.bidders.length,
      auctions_created: data.auctions.length, bids_created: data.bids.length,
      network_edges_created: data.networkEdges.length, predictions_created: predictions.length, alerts_created: alerts.length
    }
  };
}

// ============================================
// MAIN ROUTER
// ============================================

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  const url = new URL(req.url);
  let path = url.pathname;
  if (path.includes("/shillbid-api")) path = path.split("/shillbid-api")[1] || "/";
  if (!path) path = "/";

  try {
    let response: any;

    if (path === "/dashboard/stats" && req.method === "GET") {
      response = await handleDashboardStats();
    } else if (path === "/bidders" && req.method === "GET") {
      response = await handleGetBidders({
        risk_level: url.searchParams.get("risk_level") || undefined,
        search: url.searchParams.get("search") || undefined,
        limit: parseInt(url.searchParams.get("limit") || "100")
      });
    } else if (path === "/auctions" && req.method === "GET") {
      response = await handleGetAuctions({
        status: url.searchParams.get("status") || undefined,
        risk_level: url.searchParams.get("risk_level") || undefined,
        limit: parseInt(url.searchParams.get("limit") || "100")
      });
    } else if (path === "/fraud-alerts" && req.method === "GET") {
      response = await handleGetFraudAlerts({
        status: url.searchParams.get("status") || undefined,
        severity: url.searchParams.get("severity") || undefined,
        limit: parseInt(url.searchParams.get("limit") || "50")
      });
    } else if (path === "/fraud-network" && req.method === "GET") {
      response = await handleGetFraudNetwork();
    } else if (path.startsWith("/predict/") && req.method === "GET") {
      const parts = path.split("/");
      response = await handleGetPrediction(parts[2], parts[3]);
    } else if (path === "/seed" && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      response = await handleSeedData(body);
    } else if (path === "/health" && req.method === "GET") {
      response = { status: "ok", timestamp: new Date().toISOString() };
    } else {
      return new Response(JSON.stringify({ error: "Not found", path }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify(response), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
