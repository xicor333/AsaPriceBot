import { AssetSocket } from "./AssetSocket";
import { Asset, Pool, WSPool } from "./tinychart";

export interface TrackerTarget {
  id?: number;
  userId: string;
  channelId: string;
  gt?: number;
  lt?: number;
  dex?: string;
  name?: string;
  asset_id?: number;
  pool_id?: number;
  hit?:boolean;
}

export class AssetTracker {
  m_assetId: number;
  m_socket: AssetSocket;
  m_targets: TrackerTarget[];
  m_targetReachedCallback: (target: TrackerTarget, price: number) => void;
  constructor(
    assetId: number,
    poolId: number,
    targetReachedCallback: (target: TrackerTarget, price: number) => void
  ) {
    this.m_assetId = assetId;
    this.m_targetReachedCallback = targetReachedCallback;
    this.m_targets = [];

    this.m_socket = new AssetSocket(this.m_assetId, poolId, (pool: WSPool) => {
      this.wsCallback(pool);
    });
  }
  destroy() {
    this.m_socket.destroy();
    delete this.m_socket;
  }
  assetId(): number {
    return this.m_assetId;
  }
  wsCallback(pool: WSPool) {
    //check to see if any of our targets were reached
    //if so, do callback. will get removed by manager
    for (let i = this.m_targets.length - 1; i >= 0; i--) {
      if (this.checkTarget(pool, this.m_targets[i]) && !this.m_targets[i].hit) {
        this.m_targets[i].hit =true;
        this.m_targetReachedCallback(this.m_targets[i], pool.price);
      }
    }
  }
  checkTarget(pool: WSPool, target: TrackerTarget): boolean {
    if (target.gt !== null && pool.price > target.gt) {
      return true;
    }
    if (target.lt !== null && pool.price < target.lt) {
      return true;
    }
  }
  addTarget(target: TrackerTarget) {
    this.m_targets.push(target);
  }
  hasTargets(): boolean {
    return this.m_targets.length > 0;
  }
  hasTarget(targetId: number): boolean {
    return this.m_targets.find((e) => e.id == targetId) != undefined;
  }
  removeTarget(targetId: number) {
    const indx = this.m_targets.findIndex((e) => e.id == targetId);
    if (indx >= 0) {
      this.m_targets.splice(indx, 1);
    }
  }
  removeUserTargets(userId: string) {
    this.m_targets = this.m_targets.filter((e) => e.userId !== userId);
  }
  getUserTargets(userId: string): TrackerTarget[]{
    return this.m_targets.filter((e) => e.userId == userId)
  }
}
