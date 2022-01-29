import { AssetTracker, TrackerTarget } from "./AssetTracker";
import { Asset, Pool } from "./tinychart";
import { Client, TextChannel } from 'discord.js';
import { ChannelType } from "discord-api-types";
var idCounter=0;

export class AssetTrackerManager {
  m_assetTrackers: AssetTracker[];
  m_discordClient:Client
  constructor(discordClient:Client) {
    this.m_assetTrackers = [];
    this.m_discordClient = discordClient;
  }
  //do checks and then add the tracker if it passes
  addAlert(target: TrackerTarget, asset: Asset, pool: Pool): boolean {
    //get the tracker
    const tracker = this.getTrackerForAsset(asset, pool);

    //TODO use the database for an actual id
    target.id=(++idCounter)+""
    target.name = asset.name;
    tracker.addTarget(target);
    return true;
  }
  //return the tracker for the asset
  //if none exist, create one
  private getTrackerForAsset(asset: Asset, pool: Pool) {
    //find the asset tracker
    let tracker = this.m_assetTrackers.find((t) => t.assetId() === asset.id);
    //we dont have at tracker for this asset, so we need to add one
    if (!tracker) {
      tracker = new AssetTracker(asset, pool, (target: TrackerTarget,price:number) =>
        this.onTrackerReached(target,price)
      );
      this.m_assetTrackers.push(tracker);
    }
    return tracker;
  }

  private deleteTracker(trackerIndx:number) {
    this.m_assetTrackers[trackerIndx].destroy();
    delete this.m_assetTrackers[trackerIndx];
    this.m_assetTrackers.splice(trackerIndx,0);
  }
  //clears all trackers associated with this user id
  clearTrackersForUser(userId: string) {
    for(let i=this.m_assetTrackers.length-1;i>=0;i--)
    {
      //remove all targets that this user has for the asset
      this.m_assetTrackers[i].removeUserTargets(userId)
      //if no targets remain, delete and remove
      if(!this.m_assetTrackers[i].hasTargets()){
        this.deleteTracker(i);
      }
    }
  }
  removeTrackerByAsset(asset:Asset,userId:string){
    //get the tracker id from the database for this user and asset pair
    // this.removeTrackerTarget(id)
  }
  //removes the specified tracker
  removeTrackerTarget(targetId: string) {
    //find the tracker that has this tracker id
   const indx = this.m_assetTrackers.findIndex(e=>e.hasTarget(targetId))

    if(indx<0)
      throw new Error("Tracker does not exist")
    else{
      this.m_assetTrackers[indx].removeTarget(targetId)
      //remove the tracker if it has no targets left
      if(!this.m_assetTrackers[indx].hasTargets()){
        this.deleteTracker(indx)
      }
    }
     //remove the tracker from the database as well
  }
  onTrackerReached(target: TrackerTarget,price:number) {
    this.m_discordClient.channels.fetch(target.channelId).then((channel:TextChannel)=>{
        const priceStr = price.toPrecision(4);
        const embed = {
          title:`Price Alert`,
          fields:[
              {name:"User",value:`<@${target.userId}>`,inline:true},
              {name:"Asset",value:`${target.name}`,inline:true},
              {name:"Price",value:`${priceStr}Ⱥ`,inline:true},
          ]
      }
        channel.send({embeds:[embed]})
    })
    this.removeTrackerTarget(target.id);
  }
}
