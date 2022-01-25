import { CommandInteraction } from "discord.js";
export abstract class BasicCommand {
  m_names: string[];
  constructor(names: string[]) {
    this.m_names = names;
  }
  checkCommandName(name: string): boolean {
    return this.m_names.includes(name);
  }
  abstract runCommand(interaction: CommandInteraction): Promise<void>;
}
