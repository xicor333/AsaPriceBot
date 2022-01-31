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
