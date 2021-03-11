// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Main } from '@daml.js/prediction';
import Ledger from '@daml/ledger';
import React, { useCallback, useEffect } from 'react';
import { Button, Form, Grid, Header, Image, Segment } from 'semantic-ui-react';
import { httpBaseUrl, ledgerId } from '../config';
import Credentials, { computeCredentials } from '../Credentials';

type Props = {
  onLogin: (credentials: Credentials) => void;
  onPublicLogin: (credentials: Credentials) => void;
  setLoginAsParticipant: (state: boolean) => void;
  loginAsParticipant: boolean;
}

/**
 * React component for the login screen of the `App`.
 */
const LoginScreen: React.FC<Props> = ({ onLogin, onPublicLogin, setLoginAsParticipant, loginAsParticipant }) => {
  const [publicUsername, setPublic] = React.useState('');
  const [username, setUsername] = React.useState('');

  const login = useCallback(async (credentials: Credentials) => {
    try {
      const ledger = new Ledger({ token: credentials.token, httpBaseUrl });
      let userContract = await ledger.fetchByKey(Main.Participant, credentials.party);
      if (userContract === null) {
        const participant = { user: credentials.party, name: "THIS_STILL_NEEDS_TO_CHANGE" };
        userContract = await ledger.create(Main.Participant, participant);
      }
      onLogin(credentials);
    } catch (error) {
      alert(`Unknown error:\n${error}`);
      console.log(error);
    }
  }, [onLogin]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const publicCredentials = computeCredentials(publicUsername);
    onPublicLogin(publicCredentials);

    const credentials = computeCredentials(username);
    await login(credentials);
  }

  useEffect(() => {
    const url = new URL(window.location.toString());
    const token = url.searchParams.get('token');
    if (token === null) {
      return;
    }
    const party = url.searchParams.get('party');
    if (party === null) {
      throw Error("When 'token' is passed via URL, 'party' must be passed too.");
    }
    url.search = '';
    window.history.replaceState(window.history.state, '', url.toString());
    login({ token, party, ledgerId });
  }, [login]);

  return (
    <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as='h1' textAlign='center' size='huge' style={{ color: '#223668' }}>
          <Header.Content>
            Create
            <Image
              as='a'
              href='https://www.daml.com/'
              target='_blank'
              src='/daml.svg'
              alt='DAML Logo'
              spaced
              size='small'
              verticalAlign='middle'
            />
            App
          </Header.Content>
        </Header>
        <Form size='large' className='test-select-login-screen'>
          <Segment>
            <>
              {/* FORM_BEGIN */}
              <Form.Input
                fluid
                icon='users'
                iconPosition='left'
                placeholder='Public party Canton ID'
                value={publicUsername}
                className='test-select-username-field'
                onChange={e => setPublic(e.currentTarget.value)}
              />
              <Form.Group inline>
                <label>Login as ...</label>
                <Form.Radio
                  label='Participant'
                  value='participant'
                  checked={loginAsParticipant}
                  onChange={(e, { value }) => {setLoginAsParticipant(value === 'participant') }}
                />
                <Form.Radio
                  label='Market Operator'
                  value='market'
                  checked={!loginAsParticipant}
                  onChange={(e, { value }) => {setLoginAsParticipant(value === 'participant') }}
                />
              </Form.Group>
              <Form.Input
                fluid
                icon='user'
                iconPosition='left'
                placeholder='Canton ID'
                value={username}
                className='test-select-username-field'
                onChange={e => setUsername(e.currentTarget.value)}
              />

              <Button
                primary
                fluid
                className='test-select-login-button'
                onClick={handleLogin}>
                Log in
                </Button>
              {/* FORM_END */}
            </>

          </Segment>
        </Form>
      </Grid.Column>
    </Grid>
  );
};

export default LoginScreen;
