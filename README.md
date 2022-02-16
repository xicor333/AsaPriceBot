# AsaPriceBot

Discord bot for getting ASA prices from TinyChart

## Commands

| Name  | Command 1 | Command 2 | Status   |
| ----- | --------- | --------- | -------- |
| Help  | /tch      | /help     | Complete |
| Price | /tcp      | /price    | Complete |
| Info  | /tci      | /info     | Complete |
| Chart | /tcc      | /chart    | Complete |
| Alert | /tca      | /alert    | Complete |

### Help

Replies with a list of available commands

### Price

Replies with the price of the token in algo and the 24hr % change

| Argument | Description           | Options  |
| -------- | --------------------- | -------- |
| asa      | Id or name of the ASA |          |
| dex      | the code of the dex   | TM,T2,HS |
| inv      | Invert the price      |          |

### Info

Replies with basic asset info about the token

| Argument | Description           | Options |
| -------- | --------------------- | ------- |
| asa      | Id or name of the ASA |         |

### Chart

| Argument | Description           | Options                |
| -------- | --------------------- | ---------------------- |
| asa      | Id or name of the ASA |                        |
| dex      | The code of the dex   | TM,T2,HS               |
| time     | Timeframe for chart   | 1m,5m,15m,30m,1h,1d,1w |
| inv      | Invert the chart      |                        |


### Alert

| Name   | Description       |
| ------ | ----------------- |
| add    | Adds an alert     |
| remove | Removes an alert  |
| clear  | Clears all alerts |
| list   | Lists all alerts  |

###### Add

| Argument | Description                  | Options  |
| -------- | ---------------------------- | -------- |
| asa      | Id or name of the ASA        |          |
| dex      | the code of the dex          | TM,T2,HS |
| lt       | Alert when the value < input |          |
| gt       | Alert when value > input     |          |
| private  | Only send alert in DM        |          |

###### Remove

| Argument | Description           | Options |
| -------- | --------------------- | ------- |
| asa      | Id or name of the ASA |         |

###### Clear

No arguments

###### List

No arguments
