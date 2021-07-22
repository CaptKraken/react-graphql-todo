import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

const { REACT_APP_ADMIN_SECRET } = process.env;
const client = new ApolloClient({
  uri: "https://ck-graphql-checklist.hasura.app/v1/graphql",
  headers: {
    "x-hasura-admin-secret": `${REACT_APP_ADMIN_SECRET}`,
  },
  cache: new InMemoryCache(),
});

// async function getTodos() {
//   const data = await client.query({
//     query: gql`
//       query getTodos {
//         todos {
//           id
//           text
//           done
//         }
//       }
//     `,
//   });
//   console.log(data.data.todos);
// }
// getTodos();

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);
