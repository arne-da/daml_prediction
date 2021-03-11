// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Main } from '@daml.js/prediction';
import { Iou, ServiceAgreement } from '@daml.js/prediction/lib/Main';
import { useLedger, useStreamQueries } from '@daml/react';
import { ContractId } from '@daml/types';
import React from 'react';
import { Button } from 'semantic-ui-react';

type Props = {
    event: Main.Event
}

const BuyIn: React.FC<Props> = ({ event }) => {
    const myIous = useStreamQueries(Iou).contracts;
    const agreement = useStreamQueries(ServiceAgreement).contracts[0];
    const ledger = useLedger();

    const buyIn = async () => {
        const price = '1.0'
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

            console.log("exercising buyIn")

            try {
                await ledger.exercise(ServiceAgreement.BuyIn, agreement.contractId, { event, iouCId: iou });
                alert("Buy-In was successful! You have been awarded 1 YES and 1 NO option for this event. ");
                console.log(agreement.contractId);
            } catch (error) { console.log("Received error: " + error); error.log() }
        }
    };

    return <Button onClick={buyIn}>Buy-In</Button>
};

export default BuyIn;