import React, { Component } from 'react';
import './App.css';


import Amplify, { API, graphqlOperation, Auth } from 'aws-amplify';
import aws_exports from './aws-exports'; //specify location of aws-exports.js file;
import { Connect, withAuthenticator } from 'aws-amplify-react';
Amplify.configure(aws_exports);

class EventForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      description: "",
      where: "",
      when: ""
    }
  }

  handleChange = (event) => {
    let update = {};
    update[event.target.name] = event.target.value;
    this.setState(update);
  }

  addEvent = async () => {
    const CreateEvent = `mutation CreateEvent($name: String!, $when: String!, $where: String!, $description: String!) {
      createEvent (name: $name, when: $when, where: $where, description: $description) {
        id
        name
        where
        when
        description
      }
    }`;

    const newEvent = await API.graphql(graphqlOperation(CreateEvent, this.state));
    console.log("Event Created", newEvent);
    this.setState({name: "", description: "", where: "", when: ""});
  }

  render = () => {
    return (
      <div>
        <input type="text" name="name" placeholder="Name" onChange={this.handleChange} />
        <input type="text" name="description" placeholder="Description" onChange={this.handleChange} />
        <input type="text" name="where" placeholder="Where" onChange={this.handleChange} />
        <input type="text" name="when" placeholder="When" onChange={this.handleChange} />
        <button onClick={this.addEvent}>Add Event</button>
      </div>
    )
  }
}

class App extends Component {
  render() {
    const ListView = ({ events }) => (
      <div>
          <h3>All Events</h3>
          <ul>
              {events.map(event => <li key={event.id}>{event.name} ({event.id})</li>)}
          </ul>
      </div>
    );

    const ListEvents = `query ListEvents {
      listEvents {
        items {
          id
          name
          description
        }
      }
    }`;

    const SubscribeToEvent = `subscription SubscribeToEvent {
      subscribeToEvent {
        id
        name
        description
        where
        when
      }
    }`;

    const handleNewEventData = (prev, { subscribeToEvent }) => {
      const newEventList = prev.listEvents.items.concat([subscribeToEvent]);
      return {listEvents: {items: newEventList}};
    }

    return (
        <div>
          <EventForm />

          <Connect 
            query={graphqlOperation(ListEvents)}
            subscription={graphqlOperation(SubscribeToEvent)}
            onSubscriptionMsg={handleNewEventData}
          >
              {({ data, loading, error }) => {
                  if (error) return (<h3>Error</h3>);
                  if (loading || !data.listEvents) return (<h3>Loading...</h3>);
                  return <ListView events={data.listEvents.items} />
              }}
          </Connect>
        </div>
    )
  }
}

export default withAuthenticator(App, { includeGreetings: true });
