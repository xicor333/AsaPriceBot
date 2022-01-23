import { AssetSocket } from "./AssetSocket";
import { Asset, Pool, WSPool } from "./tinychart";

export interface TrackerTarget {
  id: string;
  gt?: number;
  lt?: number;
}

export class AssetTracker {
  m_asset: Asset;
  m_pool: Pool;
  m_socket: AssetSocket;
  m_targets: TrackerTarget[];
  m_targetReachedCallback: (target: TrackerTarget) => void;
  constructor(
    asset: Asset,
    pool: Pool,
    targetReachedCallback: (target: TrackerTarget) => void
  ) {
    this.m_asset = asset;
    this.m_pool = pool;
    this.m_targetReachedCallback = targetReachedCallback;
    this.m_socket = new AssetSocket(this.m_pool, (pool: WSPool) => {
      this.wsCallback(pool);
    });
  }
  wsCallback(pool: WSPool) {
    //check to see if any of our targets were reached
    //if so, do callback and remove
    for (let i = this.m_targets.length - 1; i >= 0; i--) {
      if (this.checkTarget(pool, this.m_targets[i])) {
        this.m_targetReachedCallback(this.m_targets[i]);
        this.m_targets.splice(i, 1);
      }
    }
  }
  checkTarget(pool: WSPool, target: TrackerTarget): boolean {
    if (target.gt !== undefined && pool.price > target.gt) return true;
    if (target.lt !== undefined && pool.price < target.lt) return true;
  }
  addTarget(target: TrackerTarget) {
    this.m_targets.push(target);
  }
}