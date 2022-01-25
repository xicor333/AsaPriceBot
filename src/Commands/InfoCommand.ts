import { CommandInteraction } from "discord.js";
import { BasicCommand } from "./BasicCommand";
import { TinychartAPI } from "../tinychartAPI";
import { Asset } from "../tinychart";

export class InfoCommand extends BasicCommand {
  constructor() {
    super(["tci", "tcInfo"]);
  }
  async runCommand(interaction: CommandInteraction): Promise<void> {
    const { commandName, options } = interaction;
    const asa = options.getString("asa");

    await interaction.deferReply();
    return TinychartAPI.getAsset(asa).then((asset) => {
      interaction.editReply(
        `ID: ${asset.id}\n` +
          `Name: ${asset.name}\n` +
          `Ticker: ${asset.ticker}\n` +
          `Url: ${asset.url}\n` +
          `Verified: ${asset.verified ? "Yes" : "No"}\n` +
          `Clawback: ${asset.has_clawback ? "Yes" : "No"}\n` +
          `Freeze: ${asset.has_freeze ? "Yes" : "No"}\n`
      );
    });
  }
}
