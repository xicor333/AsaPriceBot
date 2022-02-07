import { CommandInteraction, MessageEmbed,MessageAttachment, ApplicationCommand, Constants, Message } from "discord.js";
import { BasicCommand } from "./BasicCommand";
import { TinychartAPI } from "../tinychartAPI";
import { Asset, Pool, TimeQuery } from "../tinychart";
import * as child_process from "child_process";
import fs from  "fs";
import puppeteer from "puppeteer";

export class ChartCommand extends BasicCommand {
  constructor() {
    super(["tcc","chart"]);
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
        
        const url = `https://tinychart.org/asset/${chart.targetAsset.id}`

        const Screenshot = async () => {             
          const browser = await puppeteer.launch();  
          const page = await browser.newPage();      
          await page.setViewport({
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
          isLandscape: true
          })
          await page.goto(url);                      

          await page.$x('//*[@id="react-select-5-input"]')


          await page.screenshot({
            path: `${chart.targetAsset.id}.png`,
            clip: {x: 199, y: 195, width: 1130, height: 820}
        })

          await browser.close();          

          
        }                  
        await Screenshot();

        /*switch(time) {
          case "1M":
            time_query.start = (Math.floor( Date.now()/1000) - (60 * 60)) 
            console.log(time_query.start);
            time_query.end = Math.floor( Date.now()/1000)
            console.log(time_query.end);
            time_query.candle_type = "1M"
            break
          case "1H":
            time_query.start = (Math.floor( Date.now()/1000) - ( 60 * 60 * 24))
            time_query.end = Math.floor( Date.now()/1000)
            time_query.candle_type = "1H";
            break
          
          case "1D":
            time_query.start = (Math.floor( Date.now()/1000) - (60 * 60 * 24 * 7))
            time_query.end = Math.floor( Date.now()/1000)
            time_query.candle_type = "1D";
            break;

          default:{
            throw new Error("There was a problem wiht fetching the data");
            break
          }
        }

        const tinyChartData = await TinychartAPI.getChartData(chart.pool.id, time_query.start, time_query.end, time_query.candle_type);
        if (!tinyChartData){
            throw new Error(
                `There was a problem fetching the data.`
            );
        
        }



        fs.writeFile("output.json", JSON.stringify(tinyChartData), function(err){
          if (err) throw err;
        });



        const child = child_process.exec('python chartcreator.py')
        await new Promise( (resolve) => {child.on('close', resolve) })  */     

        const file = new MessageAttachment(`${chart.targetAsset.id}.png`)

        const embed = {
            title:`Chart`,
            image: {url: `attachment://${chart.targetAsset.id}.png`}, 

        }
        interaction.editReply({embeds:[embed], files: [file]});
        
      });
  }
  buildDiscordCommands():ApplicationCommand[]{
    let cmds=[];
    for(const name of this.m_names){
      cmds.push( {
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
              { name: "Hour", value: "1M"}, 
              { name: "Day", value: "1H"},
              { name: "Week", value: "1D"},
            ]
          },
          this.dexArgument(),
          {
            name: "inv",
            description: "Invert price",
            required: false,
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
          }
        ],
      },)
    }
    return cmds;
  }
}
