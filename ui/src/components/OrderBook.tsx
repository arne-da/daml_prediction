// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Main } from '@daml.js/prediction';
import { BuyProposal, Iou, Participant, Prediction, PredictionOwnership, SellProposal } from '@daml.js/prediction/lib/Main';
import { useLedger, useParty, useStreamQueries } from '@daml/react';
import { ContractId } from '@daml/types';
import React, { useEffect, useState } from 'react';
import { Button, Input, Tab, Table } from 'semantic-ui-react';
import { publicContext } from './App';

type Props = {
  event: Main.Event
}

// Utility function to create map of 'key -> values matching key', from an array of values 
function groupBy(list: Array<Object>, keyGetter: (item: any) => any): Map<any, Array<any>> {
  const map = new Map();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}

/**
 * Possibly the most React component. Contains the logic for querying Sell/BuyProposals of a given event, and displaying them in a order book
 * */

const OrderBook: React.FC<Props> = ({event} ) => {
  const publicLedger = publicContext.useLedger();
  const [showDiv, setShowDiv] = React.useState(false);

  const sellProposals = publicContext.useStreamQueries(SellProposal).contracts;
  const buyProposals = publicContext.useStreamQueries(BuyProposal).contracts;
  const sellCIdsAndContracts = sellProposals.map(prop => [prop.contractId, prop.payload] as const);
  const buyCIdsAndContracts = buyProposals.filter(prop => JSON.stringify(prop.payload.prediction.event) === JSON.stringify(event)).map(prop => [prop.contractId, prop.payload] as const);

  const [buysAndIous, setIous] = useState(([] as [ContractId<BuyProposal>, BuyProposal, Iou][]));
  const [sellsAndOwnerships, setOwnerships] = useState(([] as [ContractId<SellProposal>, SellProposal, PredictionOwnership][]));

  async function queryPredictionOwnerships(cIdsAndContracts: (readonly [ContractId<SellProposal>, SellProposal])[]) {
    const newOwnerships = cIdsAndContracts.map(async cidAndContract => {
      const [cid, contract] = cidAndContract;
      const predOwnership = await publicLedger.exercise(SellProposal.ShowPredictionToPublic, cid, [])
        .then(res => res[0]);
      if (JSON.stringify(predOwnership.prediction.event) === JSON.stringify(event))
        return [cid, contract, predOwnership] as [ContractId<SellProposal>, SellProposal, PredictionOwnership];
    })
    if (newOwnerships === undefined) return;
    else{
      Promise.all(newOwnerships).then(res => res.filter(x => x != undefined) as [ContractId<Main.SellProposal>, Main.SellProposal, Main.PredictionOwnership][]).then(ownerships => setOwnerships(ownerships));
    }
    
  }

  async function queryIous(cIdsAndContracts: (readonly [ContractId<BuyProposal>, BuyProposal])[]) {
    const hashtagPromise = cIdsAndContracts.map(async cidAndContract => {
      const [cid, contract] = cidAndContract;
      const iou = await publicLedger.exercise(BuyProposal.ShowIouToPublic, cid, [])
        .then(res => res[0]);
      return [cid, contract, iou] as [ContractId<BuyProposal>, BuyProposal, Iou];
    });
    Promise.all(hashtagPromise).then((ious) => setIous(ious));
  }


  useEffect(() => { queryPredictionOwnerships(sellCIdsAndContracts) }, [sellProposals]);
  useEffect(() => { queryIous(buyCIdsAndContracts) }, [buyProposals]); //buyCIdsAndContracts
  const yesNoSells: Map<boolean, [ContractId<SellProposal>, SellProposal, PredictionOwnership][]> = groupBy(sellsAndOwnerships, proposalAndOwnership => proposalAndOwnership[2].prediction.eventOccurs)
  const yesNoBuys: Map<boolean, [ContractId<BuyProposal>, BuyProposal, Iou][]> = groupBy(buysAndIous, propAndIou => propAndIou[1].prediction.eventOccurs)



  const yesSells: [ContractId<Main.SellProposal>, Main.SellProposal][] | undefined = yesNoSells.get(true)?.map(trpl => [trpl[0], trpl[1]] as [ContractId<SellProposal>, SellProposal]);
  const yesBuys: [ContractId<Main.BuyProposal>, Main.BuyProposal, Main.Iou][] | undefined = yesNoBuys.get(true);

  const noSells: [ContractId<Main.SellProposal>, Main.SellProposal][] | undefined = yesNoSells.get(false)?.map(trpl => [trpl[0], trpl[1]] as [ContractId<SellProposal>, SellProposal]);
  const noBuys: [ContractId<Main.BuyProposal>, Main.BuyProposal, Main.Iou][] | undefined = yesNoBuys.get(false);

  const newYesBuyRows = BuyRows({buys: yesBuys});
  const newYesSellRows = SellRows({sells: yesSells});
  const newNoBuyRows = BuyRows({buys: noBuys});
  const newNoSellRows = SellRows({sells: noSells});

  // open orders are rendered inside this table 
  const renderTable = (sellRows: JSX.Element[], buyRows: JSX.Element[]) => {
    return <Tab.Pane attached={false}>
    <Table celled selectable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Offer Qty</Table.HeaderCell>
          <Table.HeaderCell>Price</Table.HeaderCell>
          <Table.HeaderCell>Accept</Table.HeaderCell>
          <Table.HeaderCell>Accept Qty</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sellRows}
      </Table.Body>
      <Table.Body>
        {buyRows}
      </Table.Body>
    </Table>
  </Tab.Pane>
  }

  const panes =
    [
      {
        menuItem: 'YES', render: () => renderTable(newYesSellRows, newYesBuyRows)
      },
      { menuItem: 'NO', render: () => renderTable(newNoSellRows, newNoBuyRows) }]
      
  const orderbook = <> <br /> <Tab menu={{ attached: false }} panes={panes} /> </>
  return (
    <div>
      <Button type="submit" value="Show" onClick={() => setShowDiv(!showDiv)}>View order book</Button>
      {showDiv ? orderbook : null}
    </div>
  );
};

type PropsBuy = {
  buys: [ContractId<Main.BuyProposal>, Main.BuyProposal, Main.Iou][] | undefined;
}

// component which queries and returns the buyproposals to be displayed in the order book 
const BuyRows = ({ buys }: PropsBuy) => {
  const descendingBuyProposals = buys?.sort((i1, i2) => parseFloat(i1[2].amount) < parseFloat(i2[2].amount) ? 1 : -1);

  const ownedPredictions = useStreamQueries(PredictionOwnership).contracts;
  const buyRows: JSX.Element[] = [];
  const ledger = useLedger();
  const publicLedger = publicContext.useLedger();
  const user = useParty();
  const currentParticipant = useStreamQueries(Participant, () => [{ user }]).contracts[0]?.payload;

  async function onSellClick(buyProposal: ContractId<BuyProposal>, soughtPred: Prediction) {
    // if someone wants to accept a buyProposal, he needs to own a prediction of the appropriate type
    const ownership = ownedPredictions.find(res => {
      const prediction = res.payload.prediction;
      return JSON.stringify(prediction) === JSON.stringify(soughtPred)
    });

    if (ownership === undefined) alert("You don't own a prediction of the appropriate type to sell.");
    else {
      try {
        await ledger.exercise(BuyProposal.AcceptBuyProposal, buyProposal, { seller: currentParticipant, offeredPredictionCId: ownership.contractId});
        console.log("prediction has been sold")
        alert("Prediction has been sold successfully");
      } catch (error) { alert("Received an error while executing buy order: " + error); console.log("error", error); }
    }
  };

  if (descendingBuyProposals) {
    const groupedBuyProposals: Map<number, [ContractId<BuyProposal>, BuyProposal, Iou][]> = groupBy(descendingBuyProposals, item => parseFloat(item[2].amount));

    groupedBuyProposals.forEach((value: [ContractId<BuyProposal>, BuyProposal, Iou][], key: number) => {
      const row = <Table.Row key={key}>
        <Table.Cell>{value.length}</Table.Cell>
        <Table.Cell positive>{key}</Table.Cell>

        <Table.Cell><Button onClick={() => onSellClick(value[0][0], value[0][1].prediction)}>Sell</Button></Table.Cell>
        <Table.Cell><Input id={"buy" + { key }} value='1' type="number" /></Table.Cell>
      </Table.Row>;
      buyRows.push(row);
    })
  }

  return buyRows;
}


type PropsSell = {
  sells: [ContractId<Main.SellProposal>, Main.SellProposal][] | undefined;
}

// component which queries and returns the sellproposals to be displayed in the order book 
const SellRows = ({ sells }: PropsSell) => {
  const descendingSellProposal = sells?.sort((prop1, prop2) => parseFloat(prop1[1].price) < parseFloat(prop2[1].price) ? 1 : -1);

  const sellRows: JSX.Element[] = [];

  if (descendingSellProposal) {
    const groupedSellProposals: Map<number, [ContractId<SellProposal>, SellProposal][]> = groupBy(descendingSellProposal, item => parseFloat(item[1].price));

    groupedSellProposals.forEach((value: [ContractId<SellProposal>, SellProposal][], price: number) => {
      const row = <Table.Row key={price}>
        <Table.Cell>{value.length}</Table.Cell>
        <Table.Cell error>{price}</Table.Cell>
        <Table.Cell><Button onClick={() => onBuyClick(value[0][0], price)}>Buy</Button></Table.Cell>
        <Table.Cell><Input value='1' type="number" /></Table.Cell>
      </Table.Row>;
      sellRows.push(row);
    });
  }

  const user = useParty()
  const currentParticipant = useStreamQueries(Participant, () => [{ user }]).contracts[0]?.payload;
  const myIous = useStreamQueries(Iou).contracts;

  const ledger = useLedger();

  async function onBuyClick(sellProposal: ContractId<SellProposal>, price: number) {
    // if someone wants to accept a sellProposal, he needs to own an Iou larger than the ask price
    const payment = myIous.find(iou => parseFloat(iou.payload.amount) >= price)
    if (payment === undefined) alert("You don't have enough currency left to accept this sell offer");
    else {
      try {
        console.log("we here");
        if (parseFloat(payment.payload.amount) > price) {
          console.log("splitting");
          const [ious, _] = await ledger.exercise(Iou.Split, payment.contractId, { newAmount: "" + price });
          await ledger.exercise(SellProposal.AcceptSellProposal, sellProposal, { buyer: currentParticipant, iouCId: ious._1 });
        } else {
          console.log("not splitting");
          await ledger.exercise(SellProposal.AcceptSellProposal, sellProposal, { buyer: currentParticipant, iouCId: payment.contractId });
        }
        alert("Buy order has been executed");
      } catch (error) { alert("Received an error while executing buy order: " + error); console.log("error", error); }
    }
  };

  return sellRows;
}
export default OrderBook;