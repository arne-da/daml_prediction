// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Grid } from 'semantic-ui-react';
import DamlHeader from './DamlHeader';
import Markets from './Markets';
import Portfolio from './Portfolio';
import Sidebar from './Sidebar';


type Props = {
  onLogout: () => void;
}

/**
 * React component for the main screen of the `App`.
 */
const MainScreen: React.FC<Props> = ({onLogout}) => {
  return (
    <>
    <Router>
      <DamlHeader onLogout={onLogout}/>
      <Grid>
        <Grid.Column width={3}>
          <Sidebar/>
        </Grid.Column>
        <Grid.Column width={10}>
            <Route path="/" exact component={Markets} />
            <Route path="/markets" component={Markets} />
            <Route path="/portfolio" component={Portfolio} />
            {/* <Route path="/event/:id" exact component={Portfolio} /> */}
        </Grid.Column>
        <Grid.Column width={3}></Grid.Column>
      </Grid>
      </Router>
    </>
  );
};

const Home: React.FC<Props> = () => <div>Home</div>

export default MainScreen;
