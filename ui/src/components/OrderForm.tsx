// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Main } from '@daml.js/prediction';
import { Iou, Participant, PredictionOwnership } from '@daml.js/prediction/lib/Main';
import { useLedger, useStreamQueries } from '@daml/react';
import { ContractId } from '@daml/types';
import React, { useState } from 'react';
import { Button, Checkbox, Form } from 'semantic-ui-react';
import { publicContext } from './App';

type Props = {
  event: Main.Event
}

const optionsOutcome = [
  { key: 'y', text: 'Yes', value: true },
  { key: 'n', text: 'No', value: false }
]
const optionsBuySell = [
  { key: 'b', text: 'Buy', value: true },
  { key: 's', text: 'Sell', value: false }
]

const optionsMarketLimit = [
  { key: 'l', text: 'Limit', value: "Limit" },
  { key: 'm', text: 'Market', value: false, disabled: true }
]

const optionsExpiration = [
  { key: 'd', text: 'DAYS', value: 'days' },
  { key: 'h', text: 'HOURS', value: 'hours' },
  { key: 'm', text: 'MINUTES', value: 'minutes' },
]

/**
 * React component for the form field to create a buy or sell proposal (order) 
**/
const OrderForm: React.FC<Props> = ({ event }) => {
  const [showExpiration, setShowExpiration] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState('0.5');
  const [eventOccurs, setEventOccurs] = useState(true);
  const [isBuy, setIsBuy] = useState(true);
  const [uuid, setUuid] = useState(0);
  const myIous = useStreamQueries(Iou).contracts;
  const myPreds = useStreamQueries(PredictionOwnership).contracts;
  const me = useStreamQueries(Main.Participant).contracts[0];
  const ledger = useLedger();
  const publicP = publicContext.useParty()

  const placeBuyOrder = async () => {
    console.log("Clicked with values: ")
    console.log("expi", showExpiration)
    console.log("quan", quantity)
    console.log("price", price)
    console.log("eventoccurs", eventOccurs)
    const payment = myIous.find(iou => iou.payload.amount >= price);
    if (payment === undefined) alert("You poor");
    else {
      let iou: ContractId<Iou> | undefined = undefined;
      if (payment.payload.amount > price) {
        console.log("splitting");
        const [ious, _] = await ledger.exercise(Iou.Split, payment.contractId, { newAmount: "" + price });
        iou = ious._1;
      } else {
        console.log("not splitting");
        iou = payment.contractId;
      }

      console.log("exercising createbuyproposal")
      await ledger.exercise(Participant.CreateBuyProposal, me.contractId, { iou, public: publicP, uuid: "" + uuid, prediction: { event, eventOccurs } });
      setUuid(uuid + 1);
    }
  };

  const placeSellOrder = async () => {
    console.log("Clicked with values: ")
    console.log("price", price)
    console.log("eventoccurs", eventOccurs)

    console.log(myPreds);
    console.log("reference event", event);
    console.log("reference eventoccurs", eventOccurs);

    if (eventOccurs === undefined) alert ("Please choose whether you want to sell a YES or NO prediction for the selected event.");
    const ownership = myPreds.find(res => {
      const prediction = res.payload.prediction;
      return JSON.stringify(prediction.event) === JSON.stringify(event)
       && prediction.eventOccurs == eventOccurs
    });
    if (ownership === undefined) alert("You don't own a prediction of the appropriate type to sell.");
    else if (price === undefined) alert("Please enter a price");
    else {

      console.log("exercising createsellproposal")
      await ledger.exercise(Participant.CreateSellProposal, me.contractId, { price, public: publicP, uuid: "" + uuid, prediction: ownership.contractId });
      setUuid(uuid + 1);
    }
  }

  const expiration = <Form.Group>
    <Form.Input value='14' placeholder='14' width={2} />
    <Form.Select
      width={3}
      fluid
      required
      options={optionsExpiration}
      value='days'
    />
  </Form.Group>

  return <Form>
    <Form.Group>
      <Form.Select
        fluid
        required
        label='Event Outcome'
        width={5}
        options={optionsOutcome}
        value={eventOccurs}
        // inspiration for this code: https://stackoverflow.com/questions/62559904/form-select-value-onchange-semantic-ui-react
        onChange={(e, { value }) => { const x = value?.toString() == 'true'; setEventOccurs(x) }}
      />
      <Form.Select
        fluid
        required
        label='Order Type'
        width={5}
        options={optionsBuySell}
        placeholder='Buy'
        value={isBuy}
        // inspiration for this code: https://stackoverflow.com/questions/62559904/form-select-value-onchange-semantic-ui-react
        onChange={(e, { value }) => { const x = value?.toString() == 'true'; setIsBuy(x) }}
      />
      <Form.Select
        fluid
        width={5}
        label='Order Class'
        options={optionsMarketLimit}
        value='Limit'
      // placeholder='Limit'
      />
    </Form.Group>
    <Form.Field required>
      <label>Quantity</label>
      <input value={quantity} type="number" onChange={e => setQuantity(e.target.value)} />
    </Form.Field>
    <Form.Field required>
      <label>Limit Price</label>
      <input value={price} type="text" onChange={e => { setPrice(e.target.value); console.log("price", price) }} />
    </Form.Field>

    <Form.Field>
      <Checkbox label='Set expiration date?' onChange={() => setShowExpiration(!showExpiration)} />
    </Form.Field>
    {showExpiration ? expiration : null}
    <Button type='submit' onClick={isBuy ? placeBuyOrder : placeSellOrder}>Submit</Button>
  </Form>
};

export default OrderForm;