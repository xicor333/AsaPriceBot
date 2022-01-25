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
    return interaction.reply(
      "Available Commands:\n" +
        "Help: /help /tch or /tchelp\n" +
        "Price: /tcp or /tcprice\n" +
        "Info: /tci or /tcinfo"
    );
  }
}
