import { CommandInteraction, MessageEmbed } from "discord.js";
import { BasicCommand } from "./BasicCommand";
import { TinychartAPI } from "../tinychartAPI";
import { Asset, Pool } from "../tinychart";

export class PriceCommand extends BasicCommand {
  constructor() {
    super(["tcp", "tcPrice","price"]);
  }
  async runCommand(interaction: CommandInteraction): Promise<void> {
    const { commandName, options } = interaction;

    const asa: string = options.getString("asa");
    const dex: string | null = options.getString("dex");

    await interaction.deferReply();
    return TinychartAPI.getAsset(asa)
      .then(async (targetAsset) => {
        const provider = TinychartAPI.getProvider(dex, targetAsset);
        const pools: Pool[] = await TinychartAPI.getPools(
          targetAsset,
          provider
        );
        return { provider, targetAsset, pools };
      })
      .then((info) => {
        if (!info.pools || info.pools.length < 1)
          throw new Error(`No pools found for ${info.targetAsset.ticker}`);
        //find the algo -> asa pool and return the price on that pool
        const pool = TinychartAPI.getAlgoPool(info.pools);
        if (!pool) {
          throw new Error(
            `${info.targetAsset.ticker} does not have any algo pools`
          );
        }
        const pctChange = ((pool.price - pool.price24h) / pool.price24h) * 100;
        const pctChangeStr = (pctChange<0?"":"+")+pctChange.toFixed(2);
        const priceStr = pool.price.toPrecision(4);
        const embed = {
            title:`${info.targetAsset.name}`,
            fields:[
                {name:"Asset",value:`${info.targetAsset.ticker}`,inline:true},
                {name:"Price",value:`${priceStr}Ⱥ`,inline:true},
                {name:"Change",value:`${pctChangeStr}%`,inline:true}
            ],
            footer:{
                text:`From ${info.provider}`
            }
        }
        // interaction.editReply(
        //   `${info.targetAsset.ticker} Price on ${info.provider} is ${priceStr} <a>(${pctChangeStr}%)`
        // );
        interaction.editReply({embeds:[embed]});
      });
  }
}
