import {
  CommandInteraction,
  MessageEmbed,
  MessageAttachment,
  ApplicationCommand,
  Constants,
} from "discord.js";
import { BasicCommand } from "./BasicCommand";
import { TinychartAPI } from "../tinychartAPI";
import { Asset, Pool } from "../tinychart";

export class PriceCommand extends BasicCommand {
  constructor() {
    super(["tcp", "price"]);
  }
  async runCommand(interaction: CommandInteraction): Promise<any> {
    const { commandName, options } = interaction;

    const asa: string = options.getString("asa");
    const provider: string | null = options.getString("dex");
    const inv: boolean = options.getBoolean("inv");

    return TinychartAPI.getAsset(asa)
      .then(async (targetAsset) => {
        const pools: Pool[] = await TinychartAPI.getPools(
          targetAsset
        );
        return { provider, targetAsset, pools };
      })
      .then((info) => {
        if (!info.pools || info.pools.length < 1)
          if(provider) {
            throw new Error(
              `No pools found for ${info.targetAsset.ticker} on ${
                this.getProviderFromId(info.provider).name
              }`
            );
          } else {
            throw new Error(
              `No pools found for ${info.targetAsset.ticker}`
            );
          }
          
        //find the algo -> asa pool and return the price on that pool
        const pool = TinychartAPI.getAlgoPool(info.pools,provider);
        if (!pool) {
          throw new Error(
            `${info.targetAsset.ticker} does not have any algo pools`
          );
        }
        const pctChange = ((pool.price - pool.price24h) / pool.price24h) * 100;
        const pctChangeStr = (pctChange < 0 ? "" : "+") + pctChange.toFixed(2);
        const priceCalc = inv ? 1 / pool.price : pool.price;
        let priceStr =
          (priceCalc >= 10000
            ? priceCalc.toFixed(0)
            : priceCalc.toPrecision(4)) + (inv ? " Per " : "");
        const icons = this.footerIcons(info.targetAsset);
        const embed = {
          author:this.getEmbedAuthor(),
          title: `${info.targetAsset.name}`,
          fields: [
            {
              name: "Asset",
              value: `${info.targetAsset.ticker}`,
              inline: true,
            },
            { name: "Price", value: `${priceStr}Ⱥ`, inline: true },
            { name: "Change", value: `${pctChangeStr}%`, inline: true },
          ],
          footer: {
            text: `From ${
              this.getProviderFromId(pool.provider).name
            }\n${icons}`,
          },
        };
        // interaction.editReply(
        //   `${info.targetAsset.ticker} Price on ${info.provider} is ${priceStr} <a>(${pctChangeStr}%)`
        // );
        interaction.editReply({ embeds: [embed] });
      });
  }
  buildDiscordCommands(): ApplicationCommand[] {
    let cmds = [];
    for (const name of this.m_names) {
      cmds.push({
        name: name,
        description: "Replies with the price for the specified ASA",
        options: [
          this.asaArgument(),
          this.dexArgument(),
          {
            name: "inv",
            description: "Invert price",
            required: false,
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
          },
        ],
      });
    }
    return cmds;
  }
}
