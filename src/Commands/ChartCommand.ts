import {
  CommandInteraction,
  MessageEmbed,
  MessageAttachment,
  ApplicationCommand,
  Constants,
  Message,
} from "discord.js";
import { BasicCommand } from "./BasicCommand";
import { TinychartAPI } from '../tinychartAPI';
import { Asset, Pool, TimeQuery } from "../tinychart";
import * as child_process from "child_process";
import fs from "fs";
import puppeteer, { Puppeteer, WaitTask } from "puppeteer";
import canvas, { Canvas } from "canvas";

// const timeOptions = [
//   { name: "1m", value: 1 },
//   { name: "3m", value: 3 },
//   { name: "5m", value: 5 },
//   { name: "15m", value: 7 },
//   { name: "30m", value: 9 },
//   { name: "1h", value: 2 },
//   { name: "4h", value: 4 },
//   { name: "12h", value: 6 },
//   { name: "1d", value: 8 },
//   { name: "7d", value: 10 },
// ];

export class ChartCommand extends BasicCommand {
  constructor() {
    super(["tcc", "chart"]);
  }
  async runCommand(interaction: CommandInteraction): Promise<any> {
    const { commandName, options } = interaction;

    const asa: string = options.getString("asa");
    const time: string = options.getString("time");
    // const provider: string | null = options.getString("dex");
    const inv: boolean = options.getBoolean("inv");
    const ee: boolean = options.getBoolean("ee");
    const currency:string = options.getString("currency");

    return TinychartAPI.getAsset(asa)
      .then(async (targetAsset) => {
        const pool: Pool = await TinychartAPI.getPools(targetAsset)
        .then((pools)=>TinychartAPI.getAlgoPool(pools));

        if(!pool){
          throw new Error(
            `No pools found for ${targetAsset.ticker}`);
        }
        
        
        return {targetAsset, pool};
      })

      .then(async (chart) => {
        const currencyStr = `currency=${currency?currency:"ALGO"}`
        const invStr = `invert=${inv?"true":"false"}`
        const adjustStr = `adjust=true`
        const intervalStr = `interval=${time?time.toUpperCase():"60"}`
        const toolsStr =`tools=false`
        const conf = `${currencyStr}&${invStr}&${adjustStr}&${intervalStr}&${toolsStr}`
        const url = `https://vestige.fi/widget/${chart.targetAsset.id}/chart?${conf}`
        const url2 = `https://vestige.fi/asset/${chart.targetAsset.id}`
        const Screenshot = async () => {
          const browser = await puppeteer.launch({ headless: true });

          const page = await browser.newPage();
          await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
            isLandscape: true,
          });
          await page.goto(url, { waitUntil: "networkidle0" });

          await page.screenshot({
            path: `${chart.targetAsset.id}.png`,
            clip: { x: 0, y: 0, width: 1920, height:1080 },
          });

          await browser.close();
        };
        await Screenshot();




        const getFile = async(isEaster) => {
          if(isEaster){
            const newImage = canvas.createCanvas(1130, 820);
            const context = newImage.getContext('2d');
            const background = await canvas.loadImage(`./${chart.targetAsset.id}.png`);
            context.drawImage(background, 0, 0, newImage.width, newImage.height);
            const foreground = await canvas.loadImage("./EasterEgg.png");
            context.drawImage(foreground,0, 415, 400, 400);
            return new MessageAttachment(newImage.toBuffer(), `Blapu.png`);
          }
          else{
            return new MessageAttachment(`${chart.targetAsset.id}.png`);
          }
        }

        const priceCalc = inv ? 1 / chart.pool.price : chart.pool.price;
        let priceStr =
          (priceCalc >= 10000
            ? priceCalc.toFixed(0)
            : priceCalc.toPrecision(4)) + (inv ? " Per " : "");

        const file = await getFile(ee);

        const embed = {
          author:this.getEmbedAuthor(),
          title: `${chart.targetAsset.name} - ${time.toUpperCase()} (${priceStr} Ⱥ)`,
          image: { url: (!ee) ? `attachment://${chart.targetAsset.id}.png` : "attachment://Blapu.png" },
          url: url2,
        };
        interaction.editReply({ embeds: [embed], files: [file] });
      });
  }
  buildDiscordCommands(): ApplicationCommand[] {
    let cmds = [];
    for (const name of this.m_names) {
      cmds.push({
        name: name,
        description: "Replies with a chart for the specified ASA",
        options: [
          this.asaArgument(),
          {
            name: "time",
            description: "time arguments for time related queries",
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING,
            choices: [
              { name: "1m", value: "1" },
              { name: "3m", value: "3" },
              { name: "5m", value: "5" },
              { name: "15m", value: "15" },
              { name: "30m", value: "30" },
              { name: "45m", value: "45" },
              { name: "1h", value: "60" },
              { name: "2h", value: "120" },
              { name: "3h", value: "180" },
              { name: "4h", value: "240" },
              { name: "1d", value: "1D" },
              { name: "1w", value: "1W" },
              { name: "1mo", value: "1M" },
            ],
          },
          {
            name: "inv",
            description: "Invert price",
            required: false,
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
          },
          {
            name: "currency",
            description: "Display currency",
            required: false,
            type: Constants.ApplicationCommandOptionTypes.STRING,
            choices: [
              { name: "algo", value: "ALGO" },
              { name: "usd", value: "USD" },
              { name: "eur", value: "EUR" },
              { name: "gbp", value: "GBP" },
              { name: "btc", value: "BTC" },
            ],
          },
          {
            name: "ee",
            description: "Easter Egg",
            required: false,
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
          }
        ],
      });
    }
    return cmds;
  }
}
