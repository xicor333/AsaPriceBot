const Token = process.env.ASA_PRICE_BOT_TOKEN;
const APP_ID = process.env.ASA_PRICE_BOT_ID
const GUILD_ID = process.env.GUILD_ID;
const TINYCHART_TOKEN = process.env.TINYCHART_TOKEN
const TINYCHART_URL = process.env.TINYCHART_API_URL
import {REST} from '@discordjs/rest'
import {Routes} from 'discord-api-types/v9';
import {Client,Intents,Constants} from 'discord.js';
import {got} from 'got';

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const baseOpts = {
  resolveBodyOnly:true,
  responseType:'json',
  headers:{
    "x-api-key":TINYCHART_TOKEN
  }
}

function getPoolsCmd(asset_id,provider_id)
{
  return TINYCHART_URL+`/asset/${asset_id}/pools/${provider_id}`
}
function getSearchNameCmd(query_name)
{
  return TINYCHART_URL+`/assets/search?query=${query_name}`
}
function getAssetCmd(asset_id)
{
  return TINYCHART_URL+`/asset/${asset_id}`
}
function getProvider(inputDex,asset)
{
  //get the asset's prefered dex if it's not specified
  if(!inputDex)
    return getPreferredProvider(asset)
  else
  {
    if(!["TM","T2","HS"].includes(inputDex))
    {  
      throw new Error("Invalid Dex: Options are: TM,T2,HS")
    }
  }
  return inputDex;
}
function getPreferredProvider(asset)
{
  if(asset.t2)
    return "T2";
  else if(asset.hs)
    return "HS"
  return "TM";
}
// give each command 10s before we just skip it and error out
function runCommand(url)
{
  return Promise.race([timeoutPromise(),got.get(url,baseOpts)]);
}
function timeoutPromise(){
  return new Promise((resolve,reject)=>{
    setTimeout(reject,10000,"Timeout grabbing data, Try again")
  });
}
function getAsset(idOrName)
{
  if(isNaN(idOrName))
    return getAssetByName(idOrName);
  else
    return getAssetById(idOrName);
}
function getAssetById(id)
{
  return runCommand(getAssetCmd(id)).then((asset)=>{
    //TODO currently returning a 404 when there is a bad asset id
    return asset;
  });
}
//get the asset by name
function getAssetByName(name)
{
  return runCommand(getSearchNameCmd(name)).then((assets)=>{
    //if it returns no assets, respond with an error
    if(!assets || assets.length<1)
      throw new Error(`No Asset found for ${asa}`)
    return assets[0];
  })
}
const commands = [
  {
  name:'price',
  description: 'Replies with the price for the specified ASA',
  options:[
    {
      name:'asa',
      description:'asa name or ID',
      required:true,
      type: Constants.ApplicationCommandOptionTypes.STRING
    },
    {
      name:'dex',
      description:'dex to grab price from',
      required:false,
      type:Constants.ApplicationCommandOptionTypes.STRING
    }
  ]
},
{
  name:'info',
  description:'Replies with info about the specified ASA',
  options:[
    {
      name:'asa',
      description:'asa name or ID',
      required:true,
      type:Constants.ApplicationCommandOptionTypes.STRING
    }
  ]
}
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

const discordRest = new REST({ version: '9' }).setToken(Token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    
    // guild commands are instant, need to use these for testing purposes
    // the application commmands take up to an hour to propagate
    if(GUILD_ID)
    {
      await discordRest.put(
        Routes.applicationGuildCommands(APP_ID,GUILD_ID),
        { body: commands },
      );
    }
    else
    {
       await discordRest.put(
        Routes.applicationCommands(APP_ID),
        { body: commands },
      );
    }
  

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  const {commandName,options} = interaction;


  if(commandName === 'price'){
    const asa= options.getString('asa');
    const dex = options.getString('dex');

    await interaction.deferReply();
    try{
      
      getAssetByName(asa).then(async (targetAsset)=>{
        const provider = getProvider(dex,targetAsset)
        const pools = await runCommand(getPoolsCmd(targetAsset.id,provider))
        return {provider,targetAsset,pools}
      }).then((info)=>{
        if(!info.pools || info.pools.length<1)
          throw new Error(`No pools found for ${info.targetAsset.ticker}`)
          //find the algo -> asa pool and return the price on that pool
        for(let i=0;i<info.pools.length;i++)
        {
          const pool = info.pools[i];
          //pool asset 2 is null/0 when it's algo
          if(!pool.asset_2_id)
          {
            interaction.editReply(`${info.targetAsset.ticker} Price on ${info.provider} is ${pool.price.toPrecision(4)} Algo`)
            return;
          }
        }
        throw new Error(`${info.targetAsset.ticker} does not have any algo pools`)
      })
      .catch((errorMsg)=>{
        console.log(errorMsg);
        interaction.editReply(errorMsg.toString());
      });
    }
    catch(error){
      interaction.editReply("Unknown Error");
      console.error(error);
    }
    return;
  }
  if(commandName === 'info')
  {
    const asa= options.getString('asa');

    await interaction.deferReply();
    getAsset(asa).then((asset)=>{
      interaction.editReply(
`ID: ${asset.id}
Name: ${asset.name}
Ticker: ${asset.ticker}
Url: ${asset.url}
Verified: ${asset.verified?"Yes":"No"}
Clawback: ${asset.clawback?"Yes":"No"}
Freeze: ${asset.freeze?"Yes":"No"}`
        )
    }).catch((errorMsg)=>{
      console.log(errorMsg)
      interaction.editReply(errorMsg.toString())
    })
  }

});

client.login(Token);
