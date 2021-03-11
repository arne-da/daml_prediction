// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Main } from '@daml.js/prediction';
import React from 'react';
import { Progress, Segment } from 'semantic-ui-react';

type Props = {
  event: Main.Event;
}

/**
 * React component for the box around an event along with the progress bars which are supposed to represent the current market price
 */

const EventBox: React.FC<Props> = ({event}) => {
  return (
    <>
    <Segment.Group horizontal>
    <Segment >Yes
      {/* Values of progess bars are just hard-coded at the moment */}
      <Progress color="orange" active percent={44} progress /></Segment>
    <Segment>No
      <Progress active color="blue" percent={57} progress /></Segment>
  </Segment.Group>
    </>
  );
};

export default EventBox;
