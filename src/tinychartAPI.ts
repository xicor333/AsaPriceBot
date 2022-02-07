import { Pool, Asset, Provider, PriceData } from "./tinychart";
import axios, { AxiosError, AxiosResponse } from "axios";

const TINYCHART_TOKEN = process.env.TINYCHART_TOKEN;
const TINYCHART_URL = process.env.TINYCHART_API_URL;
const baseOpts = {
  headers: {
    "x-api-key": TINYCHART_TOKEN,
  },
};

export module TinychartAPI {
  export function getPoolsCmd(asset_id, provider_id): string {
    return encodeURI(TINYCHART_URL + `/asset/${asset_id}/pools/${provider_id}`);
  }
  export function getSearchNameCmd(query_name): string {
    return encodeURI(TINYCHART_URL + `/assets/search?query=${query_name}`);
  }
  export function getAssetCmd(asset_id): string {
    return encodeURI(TINYCHART_URL + `/asset/${asset_id}`);
  }
  export function getProvidersCmd(): string {
    return encodeURI(TINYCHART_URL + `/providers`);
  }

  export function getChartCmd(pool_id: number, start: number, end: number, type:string) {
    return encodeURI(TINYCHART_URL + `/pool/${pool_id}/prices?start=${start}&end=${end}&type=${type}`);
  }

  export function handleAxiosRequest(url): Promise<any> {
    return axios.get(url, baseOpts).then((result) => result.data);
  }
  // give each command 10s before we just skip it and error out
  export function runCommand(url): Promise<any> {
    return Promise.race([timeoutPromise(), handleAxiosRequest(url)]);
  }
  export function timeoutPromise() {
    return new Promise((resolve, reject) => {
      setTimeout(reject, 10000, "Timeout grabbing data, Try again");
    });
  }
  export function getAsset(idOrName): Promise<Asset> {
    if (isNaN(idOrName)) return getAssetByName(idOrName);
    else return getAssetById(idOrName);
  }
  export function getAssetById(id): Promise<Asset> {
    return runCommand(getAssetCmd(id)).then((asset) => {
      //TODO currently returning a 404 when there is a bad asset id
      return asset;
    });
  }
  //get the asset by name
  export function getAssetByName(name): Promise<Asset> {
    return runCommand(getSearchNameCmd(name)).then((assets) => {
      //if it returns no assets, respond with an error
      if (!assets || assets.length < 1)
        throw new Error(`No Asset found for ${name}`);
      return assets[0];
    });
  }
  export function getPools(asset: Asset, provider: string): Promise<Pool[]> {
    return runCommand(getPoolsCmd(asset.id, provider));
  }
  export function getAlgoPool(pools: Pool[]): Pool | undefined {
    if (!pools || pools.length < 1) return undefined;

    //find the algo -> asa pool and return the price on that pool
    return pools.find((p) => !p.asset_2_id);
  }
  export function getProviders(): Promise<Provider[]> {
    return runCommand(getProvidersCmd()).then((providers) => {
      if (!providers || providers.length < 1)
        throw new Error("No providers found");
      return providers;
    });
  }

  export function getChartData(poolId: number, start: number, end: number, type:string) {
    return runCommand(getChartCmd(poolId, start,end, type)).then((price_data) => {
      if (!price_data)
        throw new Error("No data found");
      return price_data;
    });
  }
}
