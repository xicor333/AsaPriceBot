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
}

export interface Pool {
  id: number;
  token_id?:number;
  application_id?:number;
  provider?:string;
  created_round?: number;
  asset_1_id?: number;
  asset_2_id?: number;
  volatility?: number;
  liquidity?: number;
  address?: string;
  price?: number;
  price1h?:number;
  price24h?: number;
  volume_1_24h?: number;
  volume_2_24h?: number;
  fee?: number;
  token_ratio?: number;
  last_traded?: number;
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


export interface PriceData {
  timestamp: number;
  price: number;
}

export interface TimeQuery{
  start: number;
  end: number;
  candle_type: string;
}
