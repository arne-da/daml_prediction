import React from 'react';
import { Tab } from 'semantic-ui-react';
import BuyProposalTable from './BuyProposalTable';
import OwnershipTable from './OwnershipTable';
import SellProposalTable from './SellProposalTable';

type Props = {
}


const Portfolio: React.FC<Props> = () => {
  const panes = [
    {
      menuItem: 'Owned Predictions',
      render: () => <Tab.Pane attached={false}><OwnershipTable /></Tab.Pane>,
    },
    {
      menuItem: 'Open Buy Orders',
      render: () => <Tab.Pane attached={false}><BuyProposalTable /></Tab.Pane>,
    },
    {
      menuItem: 'Open Sell Orders',
      render: () => <Tab.Pane attached={false}><SellProposalTable /></Tab.Pane>,
    },
  ]

  return <Tab menu={{ pointing: false }} panes={panes} />
}


export default Portfolio