import { AssetSocket } from "./AssetSocket";
import { Asset, Pool, WSPool } from "./tinychart";

export interface TrackerTarget {
  id?: string;
  userId: string;
  guildId:string;
  channelId:string;
  gt?: number;
  lt?: number;
  dex?:string;
  name?:string;
}

export class AssetTracker {
  m_asset: Asset;
  m_socket: AssetSocket;
  m_targets: TrackerTarget[];
  m_targetReachedCallback: (target: TrackerTarget,price:number) => void;
  constructor(
    asset: Asset,
    pool: Pool,
    targetReachedCallback: (target: TrackerTarget,price:number) => void
  ) {
    this.m_asset = asset;
    this.m_targetReachedCallback = targetReachedCallback;
    this.m_targets = [];

    this.m_socket = new AssetSocket(pool, (pool: WSPool) => {
      this.wsCallback(pool);
    });
  }
  destroy(){
    this.m_socket.destroy()
    delete this.m_socket;
  }
  assetId(): string {
    return this.m_asset.id;
  }
  wsCallback(pool: WSPool) {
    //check to see if any of our targets were reached
    //if so, do callback. will get removed by manager
    for (let i = this.m_targets.length - 1; i >= 0; i--) {
      if (this.checkTarget(pool, this.m_targets[i])) {
        this.m_targetReachedCallback(this.m_targets[i],pool.price);
      }
    }
  }
  checkTarget(pool: WSPool, target: TrackerTarget): boolean {
    if (target.gt !== null && (pool.price > target.gt)){
      return true;
    } 
    if (target.lt !== null && (pool.price < target.lt)){
      return true;
    } 
  }
  addTarget(target: TrackerTarget) {
    this.m_targets.push(target);
  }
  hasTargets(): boolean {
    return this.m_targets.length > 0;
  }
  hasTarget(targetId: string): boolean {
    return this.m_targets.find((e) => e.id == targetId) != undefined;
  }
  removeTarget(targetId: string)
  {
    const indx = this.m_targets.findIndex((e)=>e.id == targetId);
    if(indx>=0)
      this.m_targets.splice(indx,1)
  }
  removeUserTargets(userId:string)
  {
    this.m_targets = this.m_targets.filter((e)=>e.userId !== userId);
  }
}
