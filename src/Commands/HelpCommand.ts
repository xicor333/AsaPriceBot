import { CommandInteraction } from "discord.js";
import { BasicCommand } from "./BasicCommand";
export class HelpCommand extends BasicCommand {
  constructor() {
    super(["help", "tch", "tcHelp"]);
  }
  checkCommandName(name: string): boolean {
    return this.m_names.includes(name);
  }
  runCommand(interaction: CommandInteraction): Promise<void> {

    const embed = {
        title:"Available Commands",
        fields:[
            {name:"Help",value:"/help /tch or /tchelp",inline:true},
            {name:"Price",value:"/tcp or /tcprice",inline:true},
            {name:"Info",value:"/tci or /tcinfo",inline:true},
        ],
        
    }

    return interaction.reply({embeds:[embed]});
  }
}
