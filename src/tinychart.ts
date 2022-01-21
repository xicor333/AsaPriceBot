export interface Asset {
  id: string;
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
