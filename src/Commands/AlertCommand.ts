import { CommandInteraction } from "discord.js";
import { BasicCommand } from "./BasicCommand";
import { TinychartAPI } from "../tinychartAPI";
import { Asset, Pool, WSPool } from "../tinychart";
import { AssetSocket } from "../AssetSocket";
let activeSockets: AssetSocket[] = [];
export class AlertCommand extends BasicCommand {
  constructor() {
    super(["tca", "tcAlert"]);
  }
  async runCommand(interaction: CommandInteraction): Promise<void> {
    const { commandName, options } = interaction;

    const asa = options.getString("asa");
    const gt: number | undefined = options.getNumber("gt");
    const lt: number | undefined = options.getNumber("lt");
    const dex: string = options.getString("dex");

    return interaction.reply("Command not available");
    // if(!gt && !lt || gt && lt)
    //     return interaction.reply("Invalid parameters, must supply either gt or lt and not both");

    // await interaction.deferReply();
    // TinychartAPI.getAsset(asa).then((asset) =>
    // TinychartAPI.getPools(asset,TinychartAPI.getProvider(dex,asset)).then((pools)=>
    //     TinychartAPI.getAlgoPool(pools)).then((pool:Pool)=>{

    // activeSockets.push(new AssetSocket(pool,(wspool:WSPool)=>{
    // }))
    // interaction.editReply(`Asset alert for ${pool.id} created`)
    // })
    // )
  }
}
