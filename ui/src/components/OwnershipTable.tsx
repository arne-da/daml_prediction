// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PredictionOwnership } from '@daml.js/prediction/lib/Main';
import { useStreamQueries } from '@daml/react';
import React from 'react';
import { Table } from 'semantic-ui-react';


type Props = {
}

/**
 * React component to display the predictions the logged-in user owns
**/
const OwnershipTable : React.FC<Props> = () => {
    const ownerships = useStreamQueries(PredictionOwnership).contracts;
    
    const generateEventOccursCell = (eventOccurs: boolean) => eventOccurs ? <Table.Cell positive>Yes</Table.Cell> : <Table.Cell warning>No</Table.Cell> 

    const eventRows = ownerships.map(o => {
        const pred = o.payload.prediction;
        const event = pred.event;
        const row = <Table.Row key={o.contractId}>
          <Table.Cell>{event.description}</Table.Cell>
          {generateEventOccursCell(pred.eventOccurs)}
          <Table.Cell>{event.resolutionDate}</Table.Cell>
      </Table.Row>;
      return row
    });

    const table = <Table celled selectable>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Event</Table.HeaderCell>
        <Table.HeaderCell>Predicted Outcome</Table.HeaderCell>
        <Table.HeaderCell>Resolution Date</Table.HeaderCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {eventRows}
    </Table.Body>
  </Table>

  return table
}


export default OwnershipTable