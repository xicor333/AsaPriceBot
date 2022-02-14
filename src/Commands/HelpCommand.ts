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
    };

    return interaction.reply({ embeds: [embed] });
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
