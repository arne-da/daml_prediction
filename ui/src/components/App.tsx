// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import DamlLedger, { createLedgerContext } from '@daml/react';
import React, { useState } from 'react';
import { httpBaseUrl } from '../config';
import Credentials, { computeCredentials } from '../Credentials';
import LoginScreen from './LoginScreen';
import MainScreen from './MainScreen';
import MarketOperator from './MarketOperator';

/**
 * React component for the entry point into the application.
 */
export const publicContext = createLedgerContext("public");

// APP_BEGIN
const App: React.FC = () => {
  const [publicCredentials, setPublic] = React.useState<Credentials | undefined>();
  const [credentials, setCredentials] = React.useState<Credentials | undefined>();
  const [loginAsParticipant, setLoginAsParticipant] = useState(true);

  const key = "::122042f582c2ae79427a867c2a0309380c9c35c1e7bd878913c769c9b8b730992210";
  const public2 = computeCredentials("public" + key)
  const u2 = computeCredentials("u2" + key)
  const market = computeCredentials("Market" + key)

  return credentials && publicCredentials
    ? 
    <> 
    <DamlLedger
        token={credentials.token}
        party={credentials.party}
        httpBaseUrl={httpBaseUrl}
      >
      <publicContext.DamlLedger
        token={publicCredentials.token}
        party={publicCredentials.party}
        httpBaseUrl={httpBaseUrl}
        >
          {loginAsParticipant ? 
            <MainScreen onLogout={() => {setCredentials(undefined); setPublic(undefined)}}/>
           : <MarketOperator onLogout={() => {setCredentials(undefined); setPublic(undefined)}}/>}
      </publicContext.DamlLedger>
    </DamlLedger>
    </>
    : <LoginScreen onLogin={setCredentials} onPublicLogin={setPublic} setLoginAsParticipant={setLoginAsParticipant} loginAsParticipant={loginAsParticipant}/>

  
}
// APP_END

export default App;