import {
  CommandInteraction,
  MessageEmbed,
  MessageAttachment,
  ApplicationCommand,
  Constants,
  Message,
} from "discord.js";
import { BasicCommand } from "./BasicCommand";
import { TinychartAPI } from "../tinychartAPI";
import { Asset, Pool, TimeQuery } from "../tinychart";
import * as child_process from "child_process";
import fs from "fs";
import puppeteer, { Puppeteer, WaitTask } from "puppeteer";
import canvas from "canvas";

const timeOptions = [
  { name: "1m", value: 1 },
  { name: "3m", value: 3 },
  { name: "5m", value: 5 },
  { name: "15m", value: 7 },
  { name: "30m", value: 9 },
  { name: "1h", value: 2 },
  { name: "4h", value: 4 },
  { name: "12h", value: 6 },
  { name: "1d", value: 8 },
  { name: "7d", value: 10 },
];

export class ChartCommand extends BasicCommand {
  constructor() {
    super(["tcc", "chart"]);
  }
  async runCommand(interaction: CommandInteraction): Promise<void> {
    const { commandName, options } = interaction;

    const asa: string = options.getString("asa");
    const time: string = options.getString("time");
    const dex: string | null = options.getString("dex");
    const inv: boolean = options.getBoolean("inv");

    await interaction.deferReply();
    return TinychartAPI.getAsset(asa)
      .then(async (targetAsset) => {
        const provider = this.getProvider(dex, targetAsset);
        const pools: Pool[] = await TinychartAPI.getPools(
          targetAsset,
          provider
        );
        return { provider, targetAsset, pools };
      })

      .then(async (chart) => {
        const url = `https://tinychart.org/asset/${chart.targetAsset.id}`;
        const conf = `{"viewType":"${time.toUpperCase()}","ema12":false,"ema26":false,"tooltip":false,"reverse":${
          inv ? "true" : "false"
        },"scale":"linear","candles":100}`;
        const Screenshot = async () => {
          const browser = await puppeteer.launch({ headless: true });

          const page = await browser.newPage();
          await page.evaluateOnNewDocument(
            (args) => {
              localStorage.clear();
              const conf = `{"viewType":"${args.time.toUpperCase()}","ema12":false,"ema26":false,"tooltip":false,"reverse":${
                args.inv ? "true" : "false"
              },"scale":"linear","candles":100}`;
              localStorage.setItem("tc-chart-config", conf);
              if (args.dex)
                localStorage.setItem(
                  "tc2-provider",
                  `"${args.dex.toUpperCase()}"`
                );
            },
            { dex, time, inv }
          );
          await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
            isLandscape: true,
          });
          await page.goto(url, { waitUntil: "networkidle0" });

          await page.screenshot({
            path: `${chart.targetAsset.id}.png`,
            clip: { x: 199, y: 195, width: 1130, height: 820 },
          });

          await browser.close();
        };
        await Screenshot();

        const file = new MessageAttachment(`${chart.targetAsset.id}.png`);

        const embed = {
          title: `${chart.targetAsset.name} - ${time.toUpperCase()}`,
          image: { url: `attachment://${chart.targetAsset.id}.png` },
          url: url,
          footer: {
            text: `From ${
              dex?this.getProviderFromId(dex).name:"Default"
            }`,
          },
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
              { name: "1m", value: "1m" },
              { name: "3m", value: "3m" },
              { name: "5m", value: "5m" },
              { name: "15m", value: "15m" },
              { name: "30m", value: "30m" },
              { name: "1h", value: "1h" },
              { name: "4h", value: "4h" },
              { name: "12h", value: "12h" },
              { name: "1d", value: "1d" },
              { name: "7d", value: "7d" },
            ],
          },
          this.dexArgument(),
          {
            name: "inv",
            description: "Invert price",
            required: false,
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
          },
        ],
      });
    }
    return cmds;
  }
}
