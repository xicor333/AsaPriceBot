const Token = process.env.ASA_PRICE_BOT_TOKEN;
const APP_ID = process.env.ASA_PRICE_BOT_ID;
const GUILD_ID = process.env.GUILD_ID;
const TINYCHART_TOKEN = process.env.TINYCHART_TOKEN;
const TINYCHART_URL = process.env.TINYCHART_API_URL;
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Client, Intents, Constants } from "discord.js";
import { Asset, Pool } from "./tinychart";
import { AssetSocket } from "./AssetSocket";
import { WSPool } from "./tinychart";
import { TinychartAPI } from "./tinychartAPI";

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

let activeSockets: AssetSocket[] = [];

const commands = [
  {
    name: "price",
    description: "Replies with the price for the specified ASA",
    options: [
      {
        name: "asa",
        description: "asa name or ID",
        required: true,
        type: Constants.ApplicationCommandOptionTypes.STRING,
      },
      {
        name: "dex",
        description: "dex to grab price from",
        required: false,
        type: Constants.ApplicationCommandOptionTypes.STRING,
      },
    ],
  },
  {
    name: "info",
    description: "Replies with info about the specified ASA",
    options: [
      {
        name: "asa",
        description: "asa name or ID",
        required: true,
        type: Constants.ApplicationCommandOptionTypes.STRING,
      },
    ],
  },
  // {
  //   name: "alert",
  //   description: "Registers for a price alert on the specified ASA",
  //   options: [
  //     {
  //       name: "asa",
  //       description: "asa name or ID",
  //       required: true,
  //       type: Constants.ApplicationCommandOptionTypes.STRING,
  //     },
  //     {
  //       name: "gt",
  //       description: "Greater than",
  //       required: false,
  //       type: Constants.ApplicationCommandOptionTypes.NUMBER
  //     },
  //     {
  //       name: "lt",
  //       description: "Less than",
  //       required: false,
  //       type: Constants.ApplicationCommandOptionTypes.NUMBER
  //     },
  //     {
  //       name: "dex",
  //       description: "dex to grab price from",
  //       required: false,
  //       type: Constants.ApplicationCommandOptionTypes.STRING,
  //     },
  //   ],
  // },
  // {
  //   name:'chart',
  //   description: 'Replies with the chart for the specified ASA',
  //   options:[
  //     {
  //       name:'asa',
  //       description:'asa name or ID',
  //       required:true,
  //       type: Constants.ApplicationCommandOptionTypes.STRING
  //     },
  //     {
  //       name:'dex',
  //       description:'dex to grab price from',
  //       required:false,
  //       type:Constants.ApplicationCommandOptionTypes.STRING
  //     }
  //   ]
  // }
];

const discordRest = new REST({ version: "9" }).setToken(Token);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    // guild commands are instant, need to use these for testing purposes
    // the application commmands take up to an hour to propagate
    if (GUILD_ID) {
      await discordRest.put(Routes.applicationGuildCommands(APP_ID, GUILD_ID), {
        body: commands,
      });
    } else {
      await discordRest.put(Routes.applicationCommands(APP_ID), {
        body: commands,
      });
    }

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const { commandName, options } = interaction;

  if (commandName === "price") {
    const asa: string = options.getString("asa");
    const dex: string | null = options.getString("dex");

    await interaction.deferReply();
    try {
      TinychartAPI.getAsset(asa)
        .then(async (targetAsset) => {
          const provider = TinychartAPI.getProvider(dex, targetAsset);
          const pools: Pool[] = await TinychartAPI.getPools(
            targetAsset,
            provider
          );
          return { provider, targetAsset, pools };
        })
        .then((info) => {
          if (!info.pools || info.pools.length < 1)
            throw new Error(`No pools found for ${info.targetAsset.ticker}`);
          //find the algo -> asa pool and return the price on that pool
          const pool = TinychartAPI.getAlgoPool(info.pools);
          if (!pool) {
            throw new Error(
              `${info.targetAsset.ticker} does not have any algo pools`
            );
          }
          const pctChange =
            ((pool.price - pool.price24h) / pool.price24h) * 100;
          const pctChangeStr = pctChange.toFixed(2);
          const priceStr = pool.price.toPrecision(4);
          interaction.editReply(
            `${info.targetAsset.ticker} Price on ${info.provider} is ${priceStr} Algo (${pctChangeStr}%)`
          );
          return;
        })
        .catch((errorMsg) => {
          console.log(errorMsg);
          interaction.editReply(errorMsg.toString());
        });
    } catch (error) {
      interaction.editReply("Unknown Error");
      console.error(error);
    }
    return;
  }
  if (commandName === "info") {
    const asa = options.getString("asa");

    await interaction.deferReply();
    TinychartAPI.getAsset(asa)
      .then((asset) => {
        interaction.editReply(
          `ID: ${asset.id}\n` +
            `Name: ${asset.name}\n` +
            `Ticker: ${asset.ticker}\n` +
            `Url: ${asset.url}\n` +
            `Verified: ${asset.verified ? "Yes" : "No"}\n` +
            `Clawback: ${asset.has_clawback ? "Yes" : "No"}\n` +
            `Freeze: ${asset.has_freeze ? "Yes" : "No"}\n`
        );
      })
      .catch((errorMsg) => {
        console.log(errorMsg);
        interaction.editReply(errorMsg.toString());
      });
  }
  // if(commandName === "alert"){
  //   const asa = options.getString("asa")
  //   const gt:number|undefined = options.getNumber("gt");
  //   const lt:number|undefined = options.getNumber("lt");
  //   const dex:string = options.getString("dex");

  // if(!gt && !lt || gt && lt)
  //   return interaction.reply("Invalid parameters, must supply either gt or lt and not both");

  // await interaction.deferReply();
  // getAsset(asa).then((asset) =>
  //   getPools(asset,getProvider(dex,asset)).then((pools)=>
  //     getAlgoPool(pools)).then((pool)=>{
  // let pool:Pool={id:25096,asset_1_id:226701642};
  // activeSockets.push(new AssetSocket(pool,(wspool:WSPool)=>{
  //   console.log(wspool);
  // }))
  // interaction.editReply(`Asset alert for ${pool.id} created`)
  // })
  // ).catch(errorMsg=>{
  //   console.log(errorMsg);
  //     interaction.editReply(errorMsg.toString());
  // });

  // }
});

client.login(Token);
