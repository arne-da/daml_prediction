import { BuyProposal, Iou } from '@daml.js/prediction/lib/Main';
// import MainView from './MainView';
import { useLedger, useStreamQueries } from '@daml/react';
import React, { useEffect, useState } from 'react';
import { Table } from 'semantic-ui-react';


type Props = {
}


const BuyProposalTable : React.FC<Props> = () => {
    const ledger = useLedger();
    const [rows, setRows] = useState([] as JSX.Element[]);
    const buyProps = useStreamQueries(BuyProposal).contracts;
    
    const generateEventOccursCell = (eventOccurs: boolean) => eventOccurs ? <Table.Cell positive>Yes</Table.Cell> : <Table.Cell warning>No</Table.Cell> 

    const loadRows = () => {
      const newRows = buyProps.map(async b => {
        const pred = b.payload.prediction;
        const event = pred.event;
        const iou = await ledger.fetch(Iou, b.payload.iou)
        const row = <Table.Row key={b.payload.uuid}>
          <Table.Cell>{event.description}</Table.Cell>
          {generateEventOccursCell(pred.eventOccurs)}
          <Table.Cell>{iou?.payload.amount}</Table.Cell>
      </Table.Row>;
      return row
    });
    Promise.all(newRows)
    .then((newRows) => setRows(newRows));
    }

    useEffect(loadRows, [buyProps])

    const table = <Table celled selectable>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Event</Table.HeaderCell>
        <Table.HeaderCell>Predicted Outcome</Table.HeaderCell>
        <Table.HeaderCell>Offered Price</Table.HeaderCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {rows}
    </Table.Body>
  </Table>

    return table
}


export default BuyProposalTable