import { Constants } from "discord.js";

const dexArgument = {
  name: "dex",
  description: "dex to grab price from",
  required: false,
  type: Constants.ApplicationCommandOptionTypes.STRING,
  choices: [
    { name: "Tinyman", value: "T2" },
    { name: "Tinyman (old)", value: "TM" },
    { name: "Humble Swap", value: "HS" },
  ],
};

const asaArgument = {
  name: "asa",
  description: "asa name or ID",
  required: true,
  type: Constants.ApplicationCommandOptionTypes.STRING,
};

const timeArgument = {
  name: "time",
  description: "time arguments for time related queries",
  required: true,
  type: Constants.ApplicationCommandOptionTypes.STRING,
  choices: [
    { name: "1 Minute", value: "1M"}, 
    { name: "1 Hour", value: "1H"},
    { name: "1 Day", value: "1"},
  ]
}

export const commands = [
  // {
  //   name:'chart',
  //   description: 'Replies with the chart for the specified ASA',
  //   options:[
  //     asaArgument,
  //     dexArgument
  //   ]
  // }
];
