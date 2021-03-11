# Daml Prediction Market
This repository contains a toy [Daml-based](http://daml.com/) prediction market. 
A prediction market is a market where predictions (about whether real-life events will happen or not) can be traded against money. You can think of it as a sports betting market, but for non-sports events (e.g. who will win the next presidency).

Concretely, this repository contains
- a Daml model for the main market functionality.
- Daml triggers to implement certain core processes which cannot be modelled in the Daml model itself (initialize the event resolution, payout holders of correct predictions).
- A React UI based on the `create-daml-app` template.

## Demo
You can watch a Demo of everything in action here: 



## Running yourself
### Requirements
If you want to try out this demo for yourself, you will first need to make sure you have the following applications installed:
- [Daml Connect version 1.9.0 or greater](https://docs.daml.com/getting-started/installation.html)
- [Canton version v0.21.0 or greater](https://www.canton.io/docs/stable/user-manual/general_information.html)
- [npm](https://www.npmjs.com/)

### Setup and running of scripts
Make sure that you update the path to the Canton binary in the script `canton/start_canton.sh`. 

After that, you will need 5 terminals windows and then run the following commands in order: 

Terminal window #1:
```
daml build
canton/start_canton.sh
```

Terminal window #2:
```
canton/run_script.sh
daml codegen js .daml/dist/prediction-0.0.1.dar -o ui/daml.js
cd ui
npm install
npm start
```

Terminal window #3: 
```
daml json-api \
    --ledger-host localhost \
    --ledger-port 5011 \
    --http-port 7575 \
    --allow-insecure-tokens
```

Go back to terminal window #1 (Canton should have started by now), and run:
```
participant1.parties.list(filterParty="Market").head.party.filterString
```

Then proceed to terminal window #4, and run this command but replace `Market::122...48c` with the output you just received:
```
daml trigger --dar .daml/dist/prediction-0.0.1.dar --trigger-name ResolutionTrigger:eventResolution --ledger-host localhost --ledger-port 5011 --ledger-party Market::122026d39ea23ac263db446864ad2365792404219210bb4eb95d718eb2c6e239b9be
```

Again, replace `Market::122...48c`, then use terminal window #5: 
```
daml trigger --dar .daml/dist/prediction-0.0.1.dar --trigger-name PayoutTrigger:escrowPayout --ledger-host localhost --ledger-port 5011 --ledger-party Market::122026d39ea23ac263db446864ad2365792404219210bb4eb95d718eb2c6e239b9be
```