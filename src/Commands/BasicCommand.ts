import { ApplicationCommand, CommandInteraction } from "discord.js";
import { Asset } from '../tinychart';
import { Constants } from "discord.js";
export abstract class BasicCommand {
  m_names: string[];
  constructor(names: string[]) {
    this.m_names = names;
  }
  checkCommandName(name: string): boolean {
    return this.m_names.includes(name);
  }
  footerIcons(asset:Asset){
    let icons="";
    icons += asset.verified?"🛡️":"";
    icons += asset.has_freeze?"❄️":"";
    icons += asset.has_clawback?"🦝":""; 
    return icons;
  }
  asaArgument(){
    return {
      name: "asa",
      description: "asa name or ID",
      required: true,
      type: Constants.ApplicationCommandOptionTypes.STRING,
    };
  }
  dexArgument(){
    return {
      name: "dex",
      description: "dex to grab price from",
      required: false,
      type: Constants.ApplicationCommandOptionTypes.STRING,
      choices: [
        { name: "Tinyman", value: "T2" },
        { name: "Tinyman (old)", value: "TM" },
        { name: "Humble Swap", value: "HS" },
      ],
    };
  }

  abstract runCommand(interaction: CommandInteraction): Promise<void>;
  abstract buildDiscordCommands():ApplicationCommand[];
}
