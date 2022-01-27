import { CommandInteraction } from "discord.js";
import { Asset } from '../tinychart';
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
  abstract runCommand(interaction: CommandInteraction): Promise<void>;
}
