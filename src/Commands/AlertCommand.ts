import { ApplicationCommand, CommandInteraction, Client } from "discord.js";
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
  runCommand(interaction: CommandInteraction): Promise<void> {
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
  async runAlertListCommand(interaction: CommandInteraction): Promise<void> {
    const userTargets = this.m_trackerManager.getTargetsForUser(interaction.user.id );

    let fields = []
    let indx=1;
    for(const target of userTargets ){
      let priceStr = target.gt !== null ? `>${target.gt}` : `<${target.lt}`;
      fields.push({name:`${indx++}`,value:`${target.name} @ ${priceStr} `,inline:true})
    }
    let embed = {
      title: "List of alerts",
      fields: fields
    }
    return interaction.reply({embeds:[embed]});
  }

  async runAlertClearCommand(interaction: CommandInteraction): Promise<void> {
    this.m_trackerManager.clearTrackersForUser(interaction.user.id);
    const embed = {
      title: `Alerts Cleared`,
      description: `All of your alerts have been cleared`,
    };
    return interaction.reply({ embeds: [embed] });
  }

  async runAlertRemoveCommand(interaction: CommandInteraction): Promise<void> {
    const { commandName, options } = interaction;
    const asa = options.getString("asa");

    await interaction.deferReply();
    return TinychartAPI.getAsset(asa).then((asset) => {
      this.m_trackerManager.removeTrackerByAsset(asset, interaction.user.id);
      const embed = {
        title: `Alert Removed`,
        fields: [{ name: "Asset", value: `${asset.ticker}`, inline: true }],
      };
      interaction.editReply({ embeds: [embed] });
    });
  }

  async runAlertAddCommand(interaction: CommandInteraction): Promise<void> {
    const { commandName, options } = interaction;
    const asa = options.getString("asa");
    const gt: number | undefined = options.getNumber("gt");
    const lt: number | undefined = options.getNumber("lt");
    const dex: string = options.getString("dex");
    let target: TrackerTarget = {
      userId: interaction.user.id,
      channelId: interaction.channelId,
      gt,
      lt,
      dex,
    };

    if ((!gt && !lt) || (gt && lt))
      return interaction.reply(
        "Invalid parameters, must supply either greater than (gt) or less than (lt) and not both"
      );

    if (this.m_dbManager.countUserTargets(interaction.user.id) >= 5)
      return interaction.reply(
        "No more than 5 alerts can be set at a time. please remove other alerts."
      );

    await interaction.deferReply();
    return TinychartAPI.getAsset(asa).then((asset) =>
      TinychartAPI.getPools(asset, this.getProvider(dex, asset))
        .then((pools) => TinychartAPI.getAlgoPool(pools))
        .then((pool: Pool) => {
          this.m_trackerManager.addAlert(target, asset, pool);
          let priceStr = target.gt !== null ? `>${target.gt}` : `<${target.lt}`;
          const embed = {
            title: `Alert Created`,
            fields: [
              { name: "Asset", value: `${asset.ticker}`, inline: true },
              { name: "Price", value: `${priceStr}Ⱥ`, inline: true },
            ],
          };

          interaction.editReply({ embeds: [embed] });
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
