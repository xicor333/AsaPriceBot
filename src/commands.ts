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
  {
    name: "help",
    description: "Replies with a list of commands",
  },
  {
    name: "tch",
    description: "Replies with a list of commands",
  },
  {
    name: "tchelp",
    description: "Replies with a list of commands",
  },
  {
    name: "price",
    description: "Replies with the price for the specified ASA",
    options: [asaArgument, dexArgument],
  },
  {
    name: "tcp",
    description: "Replies with the price for the specified ASA",
    options: [asaArgument, dexArgument],
  },
  {
    name: "tcprice",
    description: "Replies with the price for the specified ASA",
    options: [asaArgument, dexArgument],
  },
  {
    name: "info",
    description: "Replies with info about the specified ASA",
    options: [asaArgument],
  },
  {
    name: "tci",
    description: "Replies with info about the specified ASA",
    options: [asaArgument],
  },
  {
    name: "tcinfo",
    description: "Replies with info about the specified ASA",
    options: [asaArgument],
  },
  // {
  //   name: "alert",
  //   description: "Registers for a price alert on the specified ASA",
  //   options: [
  //     asaArgument,
  //     dexArgument,
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
  //     }
  //   ],
  // },
  // {
  //   name:'chart',
  //   description: 'Replies with the chart for the specified ASA',
  //   options:[
  //     asaArgument,
  //     dexArgument
  //   ]
  // }
];
