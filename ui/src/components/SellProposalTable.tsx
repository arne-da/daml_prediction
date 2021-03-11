import { PredictionOwnership, SellProposal } from '@daml.js/prediction/lib/Main';
import { useLedger, useStreamQueries } from '@daml/react';
import React, { useEffect, useState } from 'react';
import { Table } from 'semantic-ui-react';


type Props = {
}

const SellProposalTable : React.FC<Props> = () => {
    const ledger = useLedger();
    const [rows, setRows] = useState([] as JSX.Element[]);
    const sellProps = useStreamQueries(SellProposal).contracts;
    console.log("sellProps", sellProps);
    // not pretty, but I don't know better in JS
    const generateEventOccursCell = (eventOccurs: boolean | undefined) => 
    (eventOccurs === undefined) ? <Table.Cell>undefined</Table.Cell>
    : eventOccurs ? <Table.Cell positive>Yes</Table.Cell> : <Table.Cell warning>No</Table.Cell> 

    const loadRows = () => {
      const newRows = sellProps.map(async s => {
          const ownership = await ledger.fetch(PredictionOwnership, s.payload.prediction)
          const pred = ownership?.payload.prediction;
          const event = pred?.event;
          const row = <Table.Row key={s.payload.uuid}>
            <Table.Cell>{event?.description}</Table.Cell>
            {generateEventOccursCell(pred?.eventOccurs)}
            <Table.Cell>{s.payload.price}</Table.Cell>
        </Table.Row>;
        return row;
      });
      Promise.all(newRows)
      .then((newRows) => setRows(newRows));
    }

    useEffect(loadRows, [sellProps])

    const table = <Table celled selectable>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Event</Table.HeaderCell>
        <Table.HeaderCell>Predicted Outcome</Table.HeaderCell>
        <Table.HeaderCell>Asking Price</Table.HeaderCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {rows}
    </Table.Body>
  </Table>

  return table
}


export default SellProposalTable