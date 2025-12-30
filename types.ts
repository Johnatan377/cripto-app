
export type UserTier = 'free' | 'premium';

export type PaymentMethod = 'credit_card' | 'apple_pay' | 'google_pay';
export type PaymentStatus = 'idle' | 'pending' | 'processing' | 'success' | 'error';

export interface CreditCardInfo {
  number: string;
  expiry: string;
  cvv: string;
  holderName: string;
}

export interface UserAccount {
  id: string;
  email: string;
  isLoggedIn: boolean;
  provider: 'google' | 'email' | null;
  cardInfo?: CreditCardInfo;
  subscriptionActiveUntil?: number; // Timestamp
  role?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  pixKey?: string;
  qrCode?: string;
}

export type AlertType = 'above' | 'below' | 'percent_change';

export interface Alert {
  id: string;
  assetId: string;
  symbol: string;
  type: AlertType;
  targetValue: number;
  currency: 'usd' | 'brl' | 'eur';
  isActive: boolean;
  createdAt: number;
  triggeredAt?: number;
}

export interface PortfolioItem {
  assetId: string;
  quantity: number;
  buyPrice?: number;
  buyDate?: string;
  image?: string;
  name?: string;
}

export interface PortfolioData {
  id: string;
  name: string;
  symbol: string;
  image: string;
  quantity: number;
  current_price: number;
  price_change_percentage_24h: number;
  buyPrice: number;
  totalValue: number;
  totalCost: number;
  pnlValue: number;
  pnlPercentage: number;
  allocation: number;
  sparkline?: number[];
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  currentPrice: number;
  change24h: number;
}

export interface PortfolioStats {
  totalBalance: number;
  totalChangePercent: number;
  totalChange24h: number;
}

export interface AnalysisResult {
  riskScore: number;
  marketSentiment: string;
  summary: string;
  suggestions: string[];
}

export type AppTheme = 'black' | 'matrix' | 'neon' | 'sunset' | 'game' | 'gold' | 'ocean' | 'dracula' | 'forest' | 'blue' | 'purple' | 'white' | 'yellow' | 'tetris';

export interface UserSettings {
  coinGeckoApiKey: string;
  currency: 'usd' | 'brl' | 'eur';
  theme: AppTheme;
  language: 'pt' | 'en';
  privacyMode: boolean;
  tier: UserTier;
  subscription_source?: 'stripe' | 'promo_code';
  promo_code_used?: string;
  subscription_active_since?: string;
}

export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

export interface CoinSearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
}

export interface ThemeStyle {
  bg: string;
  card: string;
  text: string;
  subText: string;
  border: string;
  accent: string;
  accentHover: string;
  accentText?: string;
  iconColor: string;
  gradient: string;
  specialEffect?: string;
}

export interface AirdropProject {
  id: string;
  created_at?: string;
  title_pt: string;
  title_en: string;
  description_pt: string;
  description_en: string;
  content_pt: string;
  content_en: string;
  category: 'DeFi' | 'NFT' | 'GameFi' | 'Infra' | 'Wallet' | 'L2' | 'Testnet' | 'Node' | 'Outros';
  status: 'Ativo' | 'Expirado' | 'Em Breve' | 'Confirmado' | 'Rumor' | 'Active' | 'Inativo' | 'Inactive';
  image_url: string;
  banner_url: string;
  video_url?: string;
  reward_potential: 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto';
  cost: 'Grátis' | 'Baixo Custo' | 'Alto Custo';
  chain: string;
  step_count?: number;
  discord_url?: string;
  twitter_url?: string;
  telegram_url?: string;
  project_url?: string;
}

export interface AirdropStep {
  date?: string;
  title?: string;
  content: string;
  image_url?: string;
  link_url?: string;
  link_text?: string;
}

export interface TickerAnnouncement {
  id: string;
  content_pt: string;
  content_en: string;
  icon?: string;
  priority: number;
  active: boolean;
  created_at: string;
}

export interface MissionLog {
  id?: string;
  moeda: string;
  quantidade: number;
  // Optional entries for dual-token protocols (LPs, Lending)
  moeda2?: string;
  quantidade2?: number;
  nomeProtocolo: string;
  categoria: string;
  wallet: string;
  protocolUrl?: string;
  timestamp?: number;
  color?: string;
}
