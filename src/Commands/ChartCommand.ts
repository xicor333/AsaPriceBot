import { CommandInteraction, MessageEmbed,MessageAttachment, ApplicationCommand, Constants, Message } from "discord.js";
import { BasicCommand } from "./BasicCommand";
import { TinychartAPI } from "../tinychartAPI";
import { Asset, Pool, TimeQuery } from "../tinychart";
import mergeImages from "merge-images"
import puppeteer, { Puppeteer, WaitTask } from "puppeteer";
import canvas from "canvas";

const timeOptions=[
  { name: "1m" , value: 1 }, 
  { name: "3m" , value: 3 }, 
  { name: "5m" , value: 5 }, 
  { name: "15m", value: 7 }, 
  { name: "30m", value: 9 }, 
  { name: "1h" , value: 2 }, 
  { name: "4h" , value: 4 }, 
  { name: "12h", value: 6 }, 
  { name: "1d" , value: 8 }, 
  { name: "7d" , value: 10},
]

export class ChartCommand extends BasicCommand {
  constructor() {
    super(["tcc","chart"]);
  }
  async runCommand(interaction: CommandInteraction): Promise<void> {
    const { commandName, options } = interaction;

    const asa: string = options.getString("asa");
    const timeNumber: number = options.getNumber("time");
    const dex: string | null = options.getString("dex");
    const ee: boolean = options.getBoolean("ee");

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
          const browser = await puppeteer.launch({headless: true});  
          const page = await browser.newPage();      
          await page.setViewport({
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
          isLandscape: true
          })
          await page.goto(url);                      


          await page.waitForTimeout(800); 

          await page.mouse.click(1140, 200, {button: "left"}  );
          
          await page.mouse.move(1140, 280);

          await page.mouse.wheel({deltaY: (timeNumber % 2 > 0 ) ?  - 1000 : 1000});

          const x = 1128;
          const yDelta = 32;
          const yStart = ((timeNumber % 2 > 0 ) ?   271 : 233);
          const timeWait = 200;
          
          switch(timeNumber){
            case (1) :
              
              await page.mouse.click(x, yStart + yDelta, {button: "left"}  );
              await page.waitForTimeout(timeWait);
              break;
            case (3) :
              await page.mouse.click(x, yStart + yDelta * 2, {button: "left"}  );
              await page.waitForTimeout(timeWait);
              break;
            case (5) :
              await page.mouse.click(x, yStart + yDelta * 3, {button: "left"}  );
              await page.waitForTimeout(timeWait);
              break;
            case (7) :
              await page.mouse.click(x, yStart + yDelta * 4, {button: "left"}  );
              await page.waitForTimeout(timeWait);
              break;
            case (9) :
              await page.mouse.click(x, yStart + yDelta * 6, {button: "left"}  );
              await page.waitForTimeout(timeWait);
              break;
            case (2) :
              await page.mouse.click(x, yStart + yDelta, {button: "left"}  );
              await page.waitForTimeout(timeWait);
              break;
            case (4) :
              await page.mouse.click(x, yStart + yDelta * 2, {button: "left"}  );
              await page.waitForTimeout(timeWait);
              break;            
            case (6) :
              await page.mouse.click(x, yStart + yDelta * 3, {button: "left"}  );
              await page.waitForTimeout(timeWait);
              break;
            case (8) :
              await page.mouse.click(x, yStart + yDelta * 6, {button: "left"}  );
              await page.waitForTimeout(timeWait);
              break;
            case (10) :
              await page.mouse.click(x, yStart + yDelta * 7, {button: "left"}  );
              await page.waitForTimeout(timeWait);
              break;}
            
          await page.screenshot({
            path: `${chart.targetAsset.id}.png`,
            clip: {x: 199, y: 195, width: 1130, height: 820}});
        
          await browser.close();          

           
        }                  
        await Screenshot();

        if(ee){
          const pctChange: boolean = ((chart.pools[0].price - chart.pools[0].price24h) >= 0 ? true:false)
          if(pctChange){
            mergeImages([`${chart.targetAsset.id}.png`, "./easter_egg/bera1.png", "./easter_egg/bera2.png"])
          }

          else{
            mergeImages([`${chart.targetAsset.id}.png`, "./easter_egg/bera1.png", "./easter_egg/bera2.png"])
          }
        }
        
        const file = new MessageAttachment(`${chart.targetAsset.id}.png`)
        const timeName:string = timeOptions.find(o => o.value == timeNumber).name
        const embed = {
            title:`${chart.targetAsset.name} - ${timeName}`,
            image: {url: `attachment://${chart.targetAsset.id}.png`}, 
            url:url


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
            type: Constants.ApplicationCommandOptionTypes.NUMBER,
            choices: timeOptions
          },
          this.dexArgument(),
          {
            name: "ee",
            description: "Easter Egg",
            required: false,
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
          }
        ],
      },)
    }
    return cmds;
  }
}
