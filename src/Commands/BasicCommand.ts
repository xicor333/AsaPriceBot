import { ApplicationCommand, CommandInteraction } from "discord.js";
import { Asset, Provider } from "../tinychart";
import { Constants } from "discord.js";
export abstract class BasicCommand {
  m_names: string[];
  m_providers: Provider[];
  constructor(names: string[]) {
    this.m_names = names;
  }
  checkCommandName(name: string): boolean {
    return this.m_names.includes(name);
  }
  footerIcons(asset: Asset) {
    let icons = "";
    icons += asset.verified ? "🛡️" : "";
    icons += asset.has_freeze ? "❄️" : "";
    icons += asset.has_clawback ? "🦝" : "";
    return icons;
  }
  asaArgument() {
    return {
      name: "asa",
      description: "asa name or ID",
      required: true,
      type: Constants.ApplicationCommandOptionTypes.STRING,
    };
  }
  dexArgument() {
    let choices = [];
    for (const provider of this.m_providers) {
      choices.push({ name: provider.name, value: provider.id });
    }

    return {
      name: "dex",
      description: "dex to grab price from",
      required: false,
      type: Constants.ApplicationCommandOptionTypes.STRING,
      choices:
        choices.length > 0
          ? choices
          : [
              { name: "Tinyman", value: "T2" },
              { name: "Tinyman (old)", value: "TM" },
              { name: "Humble Swap", value: "HS" },
            ],
    };
  }

  validDexOptions(): string[] {
    let dexes: string[] = [];
    for (const provider of this.m_providers) {
      dexes.push(provider.id);
    }
    return dexes;
  }
  setProviders(providers: Provider[]) {
    this.m_providers = providers;
  }
  getProvider(inputDex, asset): string {
    //get the asset's prefered dex if it's not specified
    if (!inputDex) return this.getPreferredProvider(asset);
    else {
      if (!this.validDexOptions().includes(inputDex)) {
        throw new Error(
          `Invalid Dex: Options are: ${this.validDexOptions().join(",")}`
        );
      }
    }
    return inputDex;
  }
  getPreferredProvider(asset) {
    //if we have providers, prioritize by later added
    for (let i = this.m_providers.length - 1; i >= 0; i--) {
      const dexId = this.m_providers[i].name;
      if (asset[dexId.toLowerCase()] || asset[dexId]) return dexId;
    }
    // if for some reason we have no providers, go back to default
    if (asset.t2 || asset.T2) return "T2";
    else if (asset.hs || asset.HS) return "HS";
    return "TM";
  }
  getProviderFromId(id: string) {
    return this.m_providers.find((e) => e.id == id);
  }

  abstract runCommand(interaction: CommandInteraction): Promise<void>;
  abstract buildDiscordCommands(): ApplicationCommand[];
}
