import { AssetTracker, TrackerTarget } from './AssetTracker';
import { Asset,Pool } from './tinychart';

export class AssetTrackerManager{
    m_assetTrackers:AssetTracker[]
    constructor()
    {
        this.m_assetTrackers =[];
    }
    //do checks and then add the tracker if it passes
    addAlert(target:TrackerTarget,asset:Asset,pool:Pool):boolean{
        //get the tracker
        const tracker = this.getTrackerForAsset(asset,pool);
        //if the tracker isnt currently tracking this target, add it
        if(!tracker.hasTarget(target)){
            tracker.addTarget(target);
        }
        return true;
    }
    //return the tracker for the asset
    //if none exist, create one
    private getTrackerForAsset(asset:Asset,pool:Pool){
        //find the asset tracker
        let tracker = this.m_assetTrackers.find(t =>t.assetId() ===asset.id)
        //we dont have at tracker for this asset, so we need to add one
        if(!tracker){
            tracker = new AssetTracker(asset,pool,(target:TrackerTarget)=>this.onTrackerReached(target));
            this.m_assetTrackers.push(tracker)
        }
        return tracker;
    }
    //clears all trackers associated with this user id
    clearTrackersForUser(userId:string){

    }
    //removes the specified tracker
    removeTracker(userId:string,trackerId:string){

    }
    onTrackerReached(target:TrackerTarget)
    {
        console.log("Target Reached:"+target)
    }
}