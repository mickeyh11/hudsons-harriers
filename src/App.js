import React, { Component } from 'react';
import './App.css';


import Amplify, { graphqlOperation, Auth } from 'aws-amplify';
import aws_exports from './aws-exports'; //specify location of aws-exports.js file;
import { Connect, withAuthenticator } from 'aws-amplify-react';
Amplify.configure(aws_exports);



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

    return (
        <Connect query={graphqlOperation(ListEvents)}>
            {({ data, loading, error }) => {
                if (error) return (<h3>Error</h3>);
                if (loading || !data.listEvents) return (<h3>Loading...</h3>);
                return <ListView events={data.listEvents.items} />
            }}
        </Connect>
    )
  }
}

export default withAuthenticator(App, { includeGreetings: true });
