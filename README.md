# AsaPriceBot

Discord bot for getting ASA prices from tinychart

## Commands

| Name  | Command 1 | Command 2 | Status      |
| ----- | --------- | --------- | ----------- |
| Help  | /tch      | /tchelp   | Complete    |
| Price | /tcp      | /tcprice  | Complete    |
| Info  | /tci      | /tcinfo   | Complete    |
| Chart | /tcc      | tcchart   | In Progress |
| Alert | /tca      | /tcalert  | In Progress |

### Help

Replies with a list of available commands

### Price

Replies with the price of the token in algo and the 24hr % change

| Argument | Description           | Options  |
| -------- | --------------------- | -------- |
| asa      | Id or name of the ASA |          |
| dex      | the code of the dex   | TM,T2,HS |

### Info

Replies with basic asset info about the token

| Argument | Description           | Options |
| -------- | --------------------- | ------- |
| asa      | Id or name of the ASA |         |

### Chart (Not complete)

| Argument | Description           | Options                |
| -------- | --------------------- | ---------------------- |
| asa      | Id or name of the ASA |                        |
| dex      | The code of the dex   | TM,T2,HS               |
| time     | Timeframe for chart   | 1m,5m,15m,30m,1h,1d,1w |

### Alert (Not complete)

| Argument | Description                  | Options  |
| -------- | ---------------------------- | -------- |
| asa      | Id or name of the ASA        |          |
| dex      | the code of the dex          | TM,T2,HS |
| lt       | Alert when the value < input |          |
| gt       | Alert when value > input     |          |
