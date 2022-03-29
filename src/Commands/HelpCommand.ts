import { ApplicationCommand, CommandInteraction } from "discord.js";
import { BasicCommand } from "./BasicCommand";
const version = "3_29_22"
export class HelpCommand extends BasicCommand {
  constructor() {
    super(["help", "tch"]);
  }
  checkCommandName(name: string): boolean {
    return this.m_names.includes(name);
  }
  runCommand(interaction: CommandInteraction): Promise<any> {
    const embed = {
      author:this.getEmbedAuthor(),
      title: "Available Commands",
      fields: [
        { name: "Help", value: "/help or /tch", inline: true },
        { name: "Price", value: "/tcp or /price", inline: true },
        { name: "Info", value: "/tci or /info", inline: true },
        { name: "Alert", value: "/tca or /alert", inline: true },
        { name: "Chart", value: "/tcc or /chart", inline:true},
        { name: "For More Info", value:"https://github.com/xicor333/AsaPriceBot"}
      ],
      footer: {
        text: `Version: ${version}`,
      },
    };

    return interaction.editReply({ embeds: [embed] });
  }
  buildDiscordCommands(): ApplicationCommand[] {
    let cmds = [];
    for (const name of this.m_names) {
      cmds.push({
        name: name,
        description: "Replies with a list of commands",
      });
    }
    return cmds;
  }
}
