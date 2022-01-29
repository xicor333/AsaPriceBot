import { ApplicationCommand, CommandInteraction } from "discord.js";
import { BasicCommand } from "./BasicCommand";
export class HelpCommand extends BasicCommand {
  constructor() {
    super(["help", "tch"]);
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
  buildDiscordCommands():ApplicationCommand[]{
    let cmds=[];
    for(const name of this.m_names){
      cmds.push( {
        name: name,
        description: "Replies with a list of commands",
      })
    }
    return cmds;
  }
}
