import { AssetTracker, TrackerTarget } from './AssetTracker';
import { Asset, Pool } from "./tinychart";
import { Client, TextChannel, User } from "discord.js";
import { ChannelType } from "discord-api-types";
import { DBManager } from "./DBManager";
import { TinychartAPI } from "./tinychartAPI";
var idCounter = 0;

export class AssetTrackerManager {
  m_assetTrackers: AssetTracker[];
  m_discordClient: Client;
  m_dbManager: DBManager;
  constructor(discordClient: Client, dbManager: DBManager) {
    this.m_assetTrackers = [];
    this.m_discordClient = discordClient;
    this.m_dbManager = dbManager;
    this.createTargetsFromDB();
  }
  //get all targets from the DB and add them all
  async createTargetsFromDB(): Promise<void> {
    let trackerTargets: TrackerTarget[] = this.m_dbManager.getAllTargets();
    for (const target of trackerTargets) {
      const tracker = this.getTrackerForAsset(target.asset_id, target.pool_id);
      tracker.addTarget(target);
    }
  }
  //do checks and then add the tracker if it passes
  addAlert(target: TrackerTarget, asset: Asset, pool: Pool): boolean {
    //get the tracker
    const tracker = this.getTrackerForAsset(asset.id, pool.id);

    //TODO use the database for an actual id
    target.name = asset.name;
    target.asset_id = asset.id;
    target.pool_id = pool.id;
    //add the target, set the id
    this.m_dbManager.addTarget(target);
    tracker.addTarget(target);
    return true;
  }
  //return the tracker for the asset
  //if none exist, create one
  private getTrackerForAsset(assetId: number, poolId: number) {
    //find the asset tracker
    let tracker = this.m_assetTrackers.find((t) => t.assetId() === assetId);
    //we dont have at tracker for this asset, so we need to add one
    if (!tracker) {
      tracker = new AssetTracker(
        assetId,
        poolId,
        (target: TrackerTarget, price: number) =>
          this.onTrackerReached(target, price)
      );
      this.m_assetTrackers.push(tracker);
    }
    return tracker;
  }

  private deleteTracker(trackerIndx: number) {
    console.log("Deleting tracker");
    this.m_assetTrackers[trackerIndx].destroy();
    delete this.m_assetTrackers[trackerIndx];
    this.m_assetTrackers.splice(trackerIndx, 1);
  }
  //returns all trackers for the specified user id
  getTargetsForUser(userId:string) : TrackerTarget[] {
    let trackers:TrackerTarget[] = [];
    for(const tracker of this.m_assetTrackers){
      trackers.push(...tracker.getUserTargets(userId))
    }
    return trackers;
  }

  //clears all trackers associated with this user id
  clearTrackersForUser(userId: string) {
    for (let i = this.m_assetTrackers.length - 1; i >= 0; i--) {
      //remove all targets that this user has for the asset
      this.m_assetTrackers[i].removeUserTargets(userId);
      //if no targets remain, delete and remove
      if (!this.m_assetTrackers[i].hasTargets()) {
        this.deleteTracker(i);
      }
    }
    this.m_dbManager.removeUserTargets(userId);
  }
  removeTrackerByAsset(asset: Asset, userId: string) {
    //get the tracker id from the database for this user and asset pair
    const targetsToRemove = this.m_dbManager.removeTargetByAsset(
      userId,
      asset.id
    );
    for (const targetId of targetsToRemove) {
      this.removeTrackerTarget(targetId);
    }
  }
  //removes the specified tracker
  removeTrackerTarget(targetId: number) {
    console.log("Remove tracker target "+targetId)
    //find the tracker that has this tracker id
    const indx = this.m_assetTrackers.findIndex((e) => e.hasTarget(targetId));
    if (indx < 0) throw new Error("Tracker does not exist");
    else {
      console.log("Target found, removing")
      this.m_assetTrackers[indx].removeTarget(targetId);
      //remove the tracker if it has no targets left
      if (!this.m_assetTrackers[indx].hasTargets()) {
        console.log("Deleting tracker "+this.m_assetTrackers[indx].m_assetId)
        this.deleteTracker(indx);
      }
    }
    //remove the tracker from the database as well
  }
  onTrackerReached(target: TrackerTarget, price: number) {
    console.log("Tracker Reached: "+target.id+" Price: "+price);
    let tracker = this.m_assetTrackers.find((t) => t.assetId() === target.asset_id);
    if(!tracker)
      return;
    console.log("Tracker found");
    
    if(!tracker.hasTarget(target.id))
      return;
    console.log("Target found")
    
    this.removeTrackerTarget(target.id);
    this.m_dbManager.removeTargetById(target.id);
    const priceStr = price.toPrecision(4);
        const embed = {
          title: `Price Alert`,
          footer:{
            text:`ID: ${target.id}`
          },
          fields: [
            { name: "User", value: `<@${target.userId}>`, inline: true },
            { name: "Asset", value: `${target.name}`, inline: true },
            { name: "Price", value: `${priceStr}Ⱥ`, inline: true },
          ],
        };
    if(!target.private){
      this.m_discordClient.channels
      .fetch(target.channelId)
      .then((channel: TextChannel) => {
        if(channel)
          channel.send({ embeds: [embed] });
      });
    }
    
    this.m_discordClient.users
      .fetch(target.userId)
      .then((user:User)=>{
        if(user)
          user.send({embeds:[embed]});
      })
    
  }
}
