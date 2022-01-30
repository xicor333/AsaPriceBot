import { Database } from "better-sqlite3";
import * as BSQ3 from "better-sqlite3";

import { TrackerTarget } from "./AssetTracker";

const SQLITE_DB = process.env.SQLITE_DB;
export class DBManager {
  m_db: Database;

  constructor() {
    this.m_db = new BSQ3.default(SQLITE_DB);
    this.updateToLatestVersion();
  }
  destroy() {
    this.m_db.close();
  }
  getDBVersion(): number {
    const version: number = this.m_db.pragma("user_version", { simple: true });
    console.log("DB Version: " + version);
    return version;
  }
  updateToLatestVersion() {
    let version = this.getDBVersion();
    if (version < 1) this.updateToV1();
  }
  updateToV1() {
    console.log("update to v1");
    const stmt = this.m_db.prepare(
      "CREATE TABLE targets(" +
        "id INTEGER PRIMARY KEY," +
        "user_id TEXT NOT NULL," +
        "channel_id TEXT NOT NULL," +
        "gt REAL," +
        "lt REAL," +
        "dex TEXT," +
        "asset_id INTEGER NOT NULL," +
        "pool_id INTEGER NOT NULL," +
        "asset_name TEXT NOT NULL" +
        ")"
    );
    stmt.run();
    this.m_db.pragma("user_version=1");
  }

  addTarget(target: TrackerTarget) {
    const stmt = this.m_db.prepare(
      "INSERT INTO targets (user_id,channel_id,gt,lt,dex,asset_id,pool_id,asset_name)" +
        "VALUES(:user_id,:channel_id,:gt,:lt,:dex,:asset_id,:pool_id,:asset_name)"
    );
    const info = stmt.run({
      user_id: target.userId,
      channel_id: target.channelId,
      gt: target.gt,
      lt: target.lt,
      dex: target.dex,
      asset_id: target.asset_id,
      pool_id: target.pool_id,
      asset_name: target.name,
    });
    target.id = <number>info.lastInsertRowid;
  }
  removeUserTargets(userId: string) {
    const stmt = this.m_db.prepare(
      "DELETE FROM targets WHERE user_id=:user_id"
    );
    stmt.run({
      user_id: userId,
    });
  }
  removeTargetByAsset(user_id: string, asset_id: number): number[] {
    const getStmt = this.m_db.prepare(
      "SELECT id FROM targets WHERE user_id=:user_id AND asset_id=:asset_id"
    );
    const rows = getStmt.all({
      user_id: user_id,
      asset_id: asset_id,
    });
    let targets: number[] = [];
    for (const row of rows) {
      targets.push(row.id);
    }

    const stmt = this.m_db.prepare(
      "DELETE FROM targets WHERE user_id=:user_id AND asset_id=:asset_id"
    );
    stmt.run({
      user_id: user_id,
      asset_id: asset_id,
    });
    return targets;
  }
  removeTargetById(target_id: number) {
    const stmt = this.m_db.prepare("DELETE FROM targets WHERE id=:target_id");
    stmt.run({
      target_id: target_id,
    });
  }
  countUserTargets(user_id: string): number {
    const stmt = this.m_db.prepare(
      "SELECT COUNT(*) AS count FROM targets WHERE user_id=:user_id"
    );
    let row = stmt.get({
      user_id: user_id,
    });
    return row.count;
  }
  getAllTargets(): TrackerTarget[] {
    const stmt = this.m_db.prepare(
      "SELECT id,user_id,channel_id,gt,lt,dex,asset_id,pool_id,asset_name FROM targets"
    );
    const rows = stmt.all();
    let targets: TrackerTarget[] = [];
    for (const row of rows) {
      targets.push({
        id: row.id,
        userId: row.user_id,
        channelId: row.channel_id,
        gt: row.gt,
        lt: row.lt,
        dex: row.dex,
        asset_id: row.asset_id,
        pool_id: row.pool_id,
        name: row.asset_name,
      });
    }
    return targets;
  }
}
