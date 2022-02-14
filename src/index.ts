const Token = process.env.ASA_PRICE_BOT_TOKEN;
const APP_ID = process.env.ASA_PRICE_BOT_ID;
const GUILD_ID = process.env.GUILD_ID;
const TINYCHART_TOKEN = process.env.TINYCHART_TOKEN;
const TINYCHART_URL = process.env.TINYCHART_API_URL;
import "dotenv/config";
import express from "express";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Client, Intents, Constants } from "discord.js";
import { Asset, Pool, Provider } from "./tinychart";
import { TinychartAPI } from "./tinychartAPI";
import { commands } from "./commands";
import { BasicCommand } from "./Commands/BasicCommand";
import { InfoCommand } from "./Commands/InfoCommand";
import { HelpCommand } from "./Commands/HelpCommand";
import { PriceCommand } from "./Commands/PriceCommand";
import { AlertCommand } from "./Commands/AlertCommand";
import { ChartCommand } from "./Commands/ChartCommand";
import { DBManager } from "./DBManager";
import cluster from "cluster";


if (cluster.isPrimary) {
  cluster.fork();

  cluster.on('exit', function(worker, code, signal) {
    cluster.fork();
  });
}

if (cluster.isWorker) {

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const dbManager = new DBManager();

let providers: Provider[] = [];

const slashCommands: BasicCommand[] = [
  new HelpCommand(),
  new InfoCommand(),
  new PriceCommand(),
  new AlertCommand(client, dbManager),
  new ChartCommand(),
];

async function updateCommands() {
  try {
    console.log("Grabbing providers from tinychart " + new Date());
    const newProviders = await TinychartAPI.getProviders();
    //only update the commands if the providers have changed
    if (JSON.stringify(newProviders) == JSON.stringify(providers)) return;

    providers = newProviders;

    let commandsToAdd = JSON.parse(JSON.stringify(commands));
    for (const cmd of slashCommands) {
      cmd.setProviders(providers);
      commandsToAdd.push(...cmd.buildDiscordCommands());
    }

    console.log("Started refreshing application (/) commands.");
    // guild commands are instant, need to use these for testing purposes
    // the application commmands take up to an hour to propagate
    if (GUILD_ID) {
      console.log("Adding Guild Commands");
      await discordRest.put(Routes.applicationGuildCommands(APP_ID, GUILD_ID), {
        body: commandsToAdd,
      });
    } else {
      console.log("Adding application commands");
      await discordRest.put(Routes.applicationCommands(APP_ID), {
        body: commandsToAdd,
      });
    }

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}

const discordRest = new REST({ version: "9" }).setToken(Token);

(async () => {
  await updateCommands();
})();

//check if the providers have changed every hour
const updateInterval = setInterval(() => updateCommands(), 60 * 60 * 1000);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  
  await interaction.deferReply();
  const commandToRun = slashCommands.find((c) =>
    c.checkCommandName(interaction.commandName)
  );
  if (!commandToRun) {
    interaction.editReply("Invalid Command");
    return;
  }

  commandToRun.runCommand(interaction).catch((errorMsg) => {
    console.log(errorMsg);
    if(interaction.deferred){
      interaction.editReply(errorMsg.toString());
    }
  });
});

client.login(Token);
}
