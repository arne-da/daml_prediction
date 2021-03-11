// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Icon, Menu, Sidebar } from 'semantic-ui-react';


type Props = {

}

/**
 * React component for the sidebar containing the portfolio, markets and settings buttons
 */
const SideBar: React.FC<Props> = () => {

    const [visible, setVisible] = React.useState(false)

  return (
    <Sidebar.Pushable as={Grid.Column}>
          <Sidebar
            as={Menu}
            animation='overlay'
            icon='labeled'
            
            onHide={() => setVisible(false)}
            vertical
            visible={true}
            width='thin'
          > 
            <Link to='/markets'>
              <Menu.Item as='a'>
                <Icon name='globe' />
                Markets
              </Menu.Item>
            </Link>
            <Link to='/portfolio'>
              <Menu.Item as='a'>
                <Icon name='chart line' />
                Portfolio
              </Menu.Item>
            </Link>
            <Menu.Item as='a'>
                <Icon name='settings' />
                Settings
              </Menu.Item>
          </Sidebar>
    </Sidebar.Pushable>
  )
      
};

export default SideBar;
