import { Pool, Asset } from "./tinychart";
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
    return TINYCHART_URL + `/asset/${asset_id}/pools/${provider_id}`;
  }
  export function getSearchNameCmd(query_name): string {
    return TINYCHART_URL + `/assets/search?query=${query_name}`;
  }
  export function getAssetCmd(asset_id): string {
    return TINYCHART_URL + `/asset/${asset_id}`;
  }
  export function getProvider(inputDex, asset): string {
    //get the asset's prefered dex if it's not specified
    if (!inputDex) return getPreferredProvider(asset);
    else {
      if (!["TM", "T2", "HS"].includes(inputDex)) {
        throw new Error("Invalid Dex: Options are: TM,T2,HS");
      }
    }
    return inputDex;
  }
  export function getPreferredProvider(asset) {
    if (asset.t2) return "T2";
    else if (asset.hs) return "HS";
    return "TM";
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
}
