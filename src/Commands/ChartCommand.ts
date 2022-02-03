import { CommandInteraction, MessageEmbed,MessageAttachment, ApplicationCommand, Constants, Message } from "discord.js";
import { BasicCommand } from "./BasicCommand";
import { TinychartAPI } from "../tinychartAPI";
import { Asset, Pool } from "../tinychart";
import * as child_process from "child_process";
import fs from  "fs";

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
      .then((info) => {
        if (!info.pools || info.pools.length < 1)
          throw new Error(`No pools found for ${info.targetAsset.ticker} on ${info.provider}`);
        //find the algo -> asa pool and return the price on that pool
        const pool = TinychartAPI.getAlgoPool(info.pools);
        if (!pool) {
          throw new Error(
            `${info.targetAsset.ticker} does not have any algo pools`
          ); }
        return {pool};
        })
      .then(async (chart) => {
        const tinyChartData = await TinychartAPI.getChartData(chart.pool.id, time);
        if (!tinyChartData){
            throw new Error(
                `There was a problem fetching the data.`
            );
        
        }
        fs.writeFile("output.json", JSON.stringify(tinyChartData), function(err){
          if (err) throw err;
        });



        const child = child_process.exec('python chartcreator.py')
        await new Promise( (resolve) => {child.on('close', resolve) })       

        const file = new MessageAttachment('testingChart.png')

        const embed = {
            title:`Chart`,
            image: {url: 'attachment://testingChart.png'}, 
            
            footer:{
               // text:`From ${info.provider}\n${icons}`
            }
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
            description: "simple time request for data",
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING,
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
