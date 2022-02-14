import { ApplicationCommand, CommandInteraction } from "discord.js";
import { BasicCommand } from "./BasicCommand";
import { TinychartAPI } from "../tinychartAPI";
import { Asset } from "../tinychart";

export class InfoCommand extends BasicCommand {
  constructor() {
    super(["tci", "info"]);
  }
  async runCommand(interaction: CommandInteraction): Promise<any> {
    const { commandName, options } = interaction;
    const asa = options.getString("asa");

    return TinychartAPI.getAsset(asa).then((asset) => {
      const icons = this.footerIcons(asset);
      const embed = {
        author:this.getEmbedAuthor(),
        title: `Info For ${asset.name}`,
        fields: [
          { name: "ID", value: `${asset.id}`, inline: true },
          { name: "Name", value: `${asset.name}`, inline: true },
          { name: "Ticker", value: `${asset.ticker}`, inline: true },
          {
            name: "Verified",
            value: ` ${asset.verified ? "Yes" : "No"}`,
            inline: true,
          },
          {
            name: "Clawback",
            value: ` ${asset.has_clawback ? "Yes" : "No"}`,
            inline: true,
          },
          {
            name: "Freeze",
            value: ` ${asset.has_freeze ? "Yes" : "No"}`,
            inline: true,
          },
          {
            name: "Url",
            value: `${asset.url.length > 0 ? asset.url : "No Url"}`,
          },
        ],
        footer: {
          text: `${icons}`,
        },
      };
      interaction.editReply({ embeds: [embed] });
    });
  }
  buildDiscordCommands(): ApplicationCommand[] {
    let cmds = [];
    for (const name of this.m_names) {
      cmds.push({
        name: name,
        description: "Replies with info about the specified ASA",
        options: [this.asaArgument()],
      });
    }
    return cmds;
  }
}
