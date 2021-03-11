// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Search } from 'semantic-ui-react';
import EventList from './EventList';

type Props = {
}

/**
 * React component for showing a list of all events, as well as a searchbar (the search function is not implemented).
 */
const Markets: React.FC<Props> = ({}) => {
  return (
    <>    
          <Search placeholder="Search events" floated="right" position="right"></Search>
          <EventList/>
    </>
  );
};

export default Markets;
