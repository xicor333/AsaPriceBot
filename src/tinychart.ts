export interface Asset {
  id: number;
  name: string;
  ticker: string;
  creator: string;
  reserve: string;
  decimals: number;
  verified: boolean;
  supply: string;
  circulating_supply: string;
  url: string;
  transactions: number;
  has_clawback: boolean;
  has_freeze: boolean;
  tm: boolean;
  t2: boolean;
  hs: boolean;
}

export interface Pool {
  id: number;
  created_round?: number;
  asset_1_id?: number;
  asset_2_id?: number;
  volatility?: number;
  liquidity?: number;
  address?: string;
  price?: number;
  price24h?: number;
}

export interface WSPool {
  asset: number;
  pool: number;
  timestamp: number;
  price: number;
  volume: number;
  liquidity: number;
}
export interface Provider {
  id: string;
  name: string;
  url: string;
  active: boolean;
}
