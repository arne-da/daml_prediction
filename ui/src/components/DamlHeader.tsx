// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Main } from '@daml.js/prediction';
import { useParty, useStreamQueries } from '@daml/react';
import React from 'react';
import { Button, Image, Menu } from 'semantic-ui-react';

type Props = {
  onLogout: () => void;
}

/**
 * React component for the header of the `App`.
 */
const DamlHeader: React.FC<Props> = ({onLogout}) => {
    const myIous = useStreamQueries(Main.Iou).contracts
    const netWorth = myIous.map(item => parseFloat(item.payload.amount)).reduce((a, b) => a + b, 0)

  return (
    <Menu icon borderless>
    <Menu.Item>
      <Image
        as='a'
        href='https://www.daml.com/'
        target='_blank'
        src='/daml.svg'
        alt='DAML Logo'
        size='mini'
      />
    </Menu.Item>
    <Menu.Item>
        <Button basic icon="list"></Button>
    </Menu.Item>
    <Menu.Menu position='right' className='test-select-main-menu'>
      <Menu.Item position='right'>
        Net worth: {netWorth.toFixed(2)+" "} 
        You are logged in as {useParty()}.
      </Menu.Item>
      <Menu.Item
        position='right'
        active={false}
        className='test-select-log-out'
        onClick={onLogout}
        icon='log out'
      />
    </Menu.Menu>
  </Menu>
  );
      
};

export default DamlHeader;
