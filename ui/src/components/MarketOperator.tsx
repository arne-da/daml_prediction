// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Main } from '@daml.js/prediction';
import { Oracle } from '@daml.js/prediction/lib/Main';
import { useLedger, useParty } from '@daml/react';
import React, { useEffect, useState } from 'react';
import { Button, Form, Grid, Header, Message, Segment } from 'semantic-ui-react';
import { publicContext } from './App';
import DamlHeader from './DamlHeader';

type Props = {
  onLogout: () => void;
}

/**
 * React component for the main screen of the Market Operator with the ability to create events.
 */

const MarketOperator: React.FC<Props> = ({ onLogout }) => {
  const [description, setDescription] = useState('');
  const [resDate, setResDate] = useState('');
  const [oracle, setOracle] = useState({entity: ''} as Oracle);

  const publicP = publicContext.useParty();
  const [hideSuccessMsg, setHideSuccessMsg] = useState(true);
  const market = useParty();

  const ledger = useLedger();
  const oracles = publicContext.useStreamQueries(Oracle).contracts;

  const setOracles = () => {if (oracles !== undefined && oracles.length > 0) setOracle(oracles[0].payload);}
  useEffect(setOracles, [oracles])
  const createEvent = async () => {
    if (!description) alert("Please set an event description.")
    else if (!resDate) alert("Please set a resolution date.")
    else {
      await ledger.create(Main.Event, { description, resolutionDate: resDate, oracle, public: publicP, outcome: null, market});
      setHideSuccessMsg(false);
    }
  }

  const form = <Form>
    <Form.Field required>
      <label>Description</label>
      <input placeholder='Please concisely describe the event.' type="text" onChange={e => setDescription(e.target.value)} />
    </Form.Field>
    <Form.Field required>
      <label>Resolution Date</label>
      <input placeholder='01/01/1970' type="date" onChange={e => setResDate(e.target.value)} />
    </Form.Field>
    
    <Form.Field required>
      <label>Oracle</label>
      <input value={oracle.entity} type="text" onChange={e => setOracle({...oracle, entity: e.target.value})} />
    </Form.Field>
    <Button type='submit' onClick={createEvent}>Create Event</Button>
  </Form>

  return <>
    <DamlHeader onLogout={onLogout} />
    <Grid>
      <Grid.Column width={4} />
      <Grid.Column width={8}>

        <Segment>
          <Header size='large'>Create an event
            </Header>
          {form}
          <Message
            success
            hidden={hideSuccessMsg}
            onDismiss={() =>setHideSuccessMsg(true)}
            header='Event successfully created'
            content="The event with id '0pPKHjWprnVxGH7dEsAoXX2YQvU' has been created and added to the marketplace"
          />
        </Segment></Grid.Column>
      <Grid.Column width={4} />
    </Grid>
  </>

};

export default MarketOperator;