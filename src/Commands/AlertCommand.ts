import { ApplicationCommand, CommandInteraction, Client } from 'discord.js';
import { BasicCommand } from "./BasicCommand";
import { TinychartAPI } from "../tinychartAPI";
import { Asset, Pool, WSPool } from "../tinychart";
import { AssetSocket } from "../AssetSocket";
import { AssetTrackerManager } from '../AssetTrackerManager';
import { TrackerTarget } from '../AssetTracker';
import { Constants } from "discord.js";
export class AlertCommand extends BasicCommand {
  m_trackerManager:AssetTrackerManager
  constructor(discordClient:Client) {
    super(["tca"]);
    this.m_trackerManager = new AssetTrackerManager(discordClient);
  }
  runCommand(interaction: CommandInteraction): Promise<void> {
    if(interaction.options.getSubcommand() === "add"){
      return this.runPriceAddCommand(interaction);
    }
    else if (interaction.options.getSubcommand() === "remove" ){
      return this.runPriceRemoveCommand(interaction);
    }
    else if (interaction.options.getSubcommand() === "clear"){
      return this.runPriceClearCommand(interaction);
    }

  }

  async runPriceClearCommand(interaction:CommandInteraction):Promise<void>{
    this.m_trackerManager.clearTrackersForUser(interaction.user.id);
    const embed = {
      title:`Alerts Cleared`,
      description:`All of your alerts have been cleared`
    }
    return interaction.reply({embeds:[embed]})
  }

  async runPriceRemoveCommand(interaction:CommandInteraction):Promise<void>{
    const { commandName, options } = interaction;
    const asa = options.getString("asa");

    await interaction.deferReply();
    return TinychartAPI.getAsset(asa).then((asset) => {
      this.m_trackerManager.removeTrackerByAsset(asset,interaction.user.id)
      const embed = {
        title:`Alert Removed`,
        fields:[
            {name:"Asset",value:`${asset.ticker}`,inline:true},
        ]
      }
      interaction.editReply({embeds:[embed]})
    });
  }

  async runPriceAddCommand(interaction: CommandInteraction):Promise<void>{
    const { commandName, options } = interaction;
    const asa = options.getString("asa");
    const gt: number | undefined = options.getNumber("gt");
    const lt: number | undefined = options.getNumber("lt");
    const dex: string = options.getString("dex");
    let target:TrackerTarget = {
      userId:interaction.user.id,
      guildId:interaction.guildId,
      channelId:interaction.channelId,
      gt,
      lt,
      dex
    };

    if(!gt && !lt || gt && lt)
        return interaction.reply("Invalid parameters, must supply either gt or lt and not both");

    await interaction.deferReply();
    return TinychartAPI.getAsset(asa).then((asset) =>
    TinychartAPI.getPools(asset,TinychartAPI.getProvider(dex,asset)).then((pools)=>
        TinychartAPI.getAlgoPool(pools)).then((pool:Pool)=>{
        this.m_trackerManager.addAlert(target,asset,pool)
        let priceStr = target.gt!==null?`>${target.gt}`:`<${target.lt}`
        const embed = {
          title:`Alert Created`,
          fields:[
              {name:"Asset",value:`${asset.ticker}`,inline:true},
              {name:"Price",value:`${priceStr}Ⱥ`,inline:true},
          ]
      }

        interaction.editReply({embeds:[embed]})
        })
    )
  }
  buildDiscordCommands():ApplicationCommand[]{


    let cmds=[];
    for(const name of this.m_names){
      cmds.push({
        name: name,
        description: "Registers or removes price alert on the specified ASA",
        options:[
          {
            type:Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            name:"add",
            description:"Add a price alert",
            options: [
              this.asaArgument(),
              this.dexArgument(),
              {
                name: "gt",
                description: "Greater than",
                required: false,
                type: Constants.ApplicationCommandOptionTypes.NUMBER
              },
              {
                name: "lt",
                description: "Less than",
                required: false,
                type: Constants.ApplicationCommandOptionTypes.NUMBER
              }
            ],
          },
          {
            type:Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            name:"remove",
            description:"Remove a price alert",
            options:[
              this.asaArgument()
            ]
          },
          {
            type:Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            name:"clear",
            description:"Remove all price alerts"
          }
        ]
      },)
    }
    return cmds;
  }
}
