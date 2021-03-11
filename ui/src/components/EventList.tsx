import { Main } from '@daml.js/prediction';
import React, { useState } from 'react';
import { Button, Message, Segment, Tab } from 'semantic-ui-react';
import { publicContext } from './App';
import BuyIn from './BuyIn';
import EventBox from './EventBox';
import OrderBook from './OrderBook';
import OrderForm from './OrderForm';



type PropsWrapper = {
  component: JSX.Element,
  text: String
}

const ShowHideWrapper : React.FC<PropsWrapper> = ({component, text}) => {
  const [showComponent, setShowComponent] = useState(false);
  return <div>
    <Button onClick={() => setShowComponent(!showComponent)}>{text}</Button>
    {showComponent && component}
  </div>
}

type Props = {
}

const EventList : React.FC<Props> = () => {
    const events = publicContext.useStreamQueries(Main.Event).contracts;


    const openEvents = events.filter(e => e.payload.outcome === null)
    const closedEvents = events.filter(e => e.payload.outcome !== null)
    console.log("all events", events)
    events.map(e => console.log(e.payload.outcome))
    console.log(closedEvents)

    const tabOpen = 
      (openEvents == undefined || openEvents.length == 0) ? <Message>
      <Message.Header>No open events</Message.Header> <p> Currently there are no open events. Are you sure you are logged in as a valid Canton user? </p> </Message>
      : openEvents.map(e => {
        const payload = e.payload;
        const descr = payload.description;
        const contents = <Tab.Pane icon='user' key={e.payload.description}>
          <Segment raised>
          <b>{descr}</b> <div> Expiration date: {payload.resolutionDate}<br/></div>
            <EventBox event={payload}/>
            <OrderBook event={payload}/>
            <ShowHideWrapper component = {<OrderForm event={payload}/>} text="Place new order"/>
            <BuyIn event={payload}/>
          </Segment>
          </Tab.Pane>
        return contents
      })

    const tabClosed = (closedEvents == undefined || closedEvents.length == 0) ? <Message>
    <Message.Header>No closed events</Message.Header> <p> No events have been resolved yet. </p> </Message>
    : closedEvents.map(e => {
      return  <Tab.Pane icon='user' key={e.payload.description}>
        <Segment raised>
        <b>{e.payload.description}</b> <div> Expiration date: {e.payload.resolutionDate}<br/></div>

           <br/>
          Outcome: <b>{""+e.payload.outcome}</b>

        </Segment>
        </Tab.Pane>
    })

    const panes2 = [
      { menuItem: 'Open', render: () => tabOpen },
      { menuItem: 'Closed', render: () => tabClosed },
    ]
    return <Tab panes={panes2} />
}


export default EventList