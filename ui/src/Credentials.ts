// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { encode } from 'jwt-simple';
import { ledgerId } from './config';

export const APPLICATION_ID: string = 'prediction';

// NOTE: This is for testing purposes only.
// To handle authentication properly,
// see https://docs.daml.com/app-dev/authentication.html.
export const SECRET_KEY: string = 'secret';

export type Credentials = {
  party: string;
  token: string;
  ledgerId: string;
}

// 
function computeToken(party: string): string {
  const cantonId = party.split("::")[1]
  const publicP = "public::" + cantonId
  console.log("cantonId "+cantonId)
  const payload = {
    "https://daml.com/ledger-api": {
      "ledgerId": ledgerId,
      "applicationId": APPLICATION_ID,
      "actAs": [party],
      "readAs": [publicP]
    }
  };
  return encode(payload, SECRET_KEY, 'HS256');
}

export const computeCredentials = (party: string): Credentials => {
  const token = computeToken(party);
  return {party, token, ledgerId};
}

export default Credentials;
