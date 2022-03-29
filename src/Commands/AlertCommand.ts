import { ApplicationCommand, CommandInteraction, Client,Message } from "discord.js";
import { BasicCommand } from "./BasicCommand";
import { TinychartAPI } from "../tinychartAPI";
import { Asset, Pool, WSPool } from "../tinychart";
import { AssetSocket } from "../AssetSocket";
import { AssetTrackerManager } from "../AssetTrackerManager";
import { TrackerTarget } from "../AssetTracker";
import { Constants } from "discord.js";
import { DBManager } from "../DBManager";
export class AlertCommand extends BasicCommand {
  m_trackerManager: AssetTrackerManager;
  m_dbManager: DBManager;
  constructor(discordClient: Client, dbManager: DBManager) {
    super(["tca","alert"]);
    this.m_dbManager = dbManager;
    this.m_trackerManager = new AssetTrackerManager(discordClient, dbManager);
  }
  runCommand(interaction: CommandInteraction): Promise<any> {
    if (interaction.options.getSubcommand() === "add") {
      return this.runAlertAddCommand(interaction);
    } else if (interaction.options.getSubcommand() === "remove") {
      return this.runAlertRemoveCommand(interaction);
    } else if (interaction.options.getSubcommand() === "clear") {
      return this.runAlertClearCommand(interaction);
    } else if (interaction.options.getSubcommand() === "list"){
      return this.runAlertListCommand(interaction);
    }
  }
  async runAlertListCommand(interaction: CommandInteraction): Promise<any> {
    const userTargets = this.m_trackerManager.getTargetsForUser(interaction.user.id );

    let fields = []
    let indx=1;
    for(const target of userTargets ){
      let priceStr = target.gt !== null ? `>${target.gt}` : `<${target.lt}`;
      fields.push({name:`${indx++}`,value:`${target.name} @ ${priceStr} `,inline:true})
    }
    let embed = {
      author:this.getEmbedAuthor(),
      title: "List of alerts",
      fields: fields
    }
    return interaction.editReply({embeds:[embed]});
  }

  async runAlertClearCommand(interaction: CommandInteraction): Promise<any> {
    this.m_trackerManager.clearTrackersForUser(interaction.user.id);
    const embed = {
      author:this.getEmbedAuthor(),
      title: `Alerts Cleared`,
      description: `All of your alerts have been cleared`,
    };
    return interaction.editReply({ embeds: [embed] });
  }

  async runAlertRemoveCommand(interaction: CommandInteraction): Promise<any> {
    const { commandName, options } = interaction;
    const asa = options.getString("asa");

    return TinychartAPI.getAsset(asa).then((asset) => {
      this.m_trackerManager.removeTrackerByAsset(asset, interaction.user.id);
      const embed = {
        author:this.getEmbedAuthor(),
        title: `Alert Removed`,
        fields: [{ name: "Asset", value: `${asset.ticker}`, inline: true }],
      };
      interaction.editReply({ embeds: [embed] });
    });
  }

  async runAlertAddCommand(interaction: CommandInteraction): Promise<any> {
    const { commandName, options } = interaction;
    const asa = options.getString("asa");
    const gt: number | undefined = options.getNumber("gt");
    const lt: number | undefined = options.getNumber("lt");
    const provider: string = options.getString("dex");
    const priv: boolean  = options.getBoolean("private");
    let target: TrackerTarget = {
      userId: interaction.user.id,
      channelId: interaction.channelId,
      gt,
      lt,
      dex:provider,
      private:priv
    };

    if ((!gt && !lt) || (gt && lt))
      return interaction.editReply(
        "Invalid parameters, must supply either greater than (gt) or less than (lt) and not both"
      );

    if (this.m_dbManager.countUserTargets(interaction.user.id) >= 5)
      return interaction.editReply(
        "No more than 5 alerts can be set at a time. please remove other alerts."
      );

    return TinychartAPI.getAsset(asa).then((asset) =>
      TinychartAPI.getPools(asset)
        .then((pools) => TinychartAPI.getAlgoPool(pools,provider))
        .then((pool: Pool) => {
          this.m_trackerManager.addAlert(target, asset, pool);
          let priceStr = target.gt !== null ? `>${target.gt}` : `<${target.lt}`;
          const embed = {
            author:this.getEmbedAuthor(),
            title: `Alert Created`,
            fields: [
              { name: "Asset", value: `${asset.ticker}`, inline: true },
              { name: "Price", value: `${priceStr}Ⱥ`, inline: true },
            ],
          };

          interaction.editReply({ embeds: [embed]});
        })
    );
  }
  buildDiscordCommands(): ApplicationCommand[] {
    let cmds = [];
    for (const name of this.m_names) {
      cmds.push({
        name: name,
        description: "Registers or removes price alert on the specified ASA",
        options: [
          {
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            name: "add",
            description: "Add a price alert",
            options: [
              this.asaArgument(),
              this.dexArgument(),
              {
                name: "gt",
                description: "Greater than",
                required: false,
                type: Constants.ApplicationCommandOptionTypes.NUMBER,
              },
              {
                name: "lt",
                description: "Less than",
                required: false,
                type: Constants.ApplicationCommandOptionTypes.NUMBER,
              },
              {
                name:"private",
                description: "Private (DM Only)",
                required: false,
                type:Constants.ApplicationCommandOptionTypes.BOOLEAN,
              }
            ],
          },
          {
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            name: "remove",
            description: "Remove a price alert",
            options: [this.asaArgument()],
          },
          {
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            name: "clear",
            description: "Remove all price alerts",
          },
          {
            type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            name: "list",
            description: "List all current alerts",
          },
        ],
      });
    }
    return cmds;
  }
}
