import {
  CosmosDatasourceKind,
  CosmosHandlerKind,
  CosmosProject,
} from "@subql/types-cosmos";

import * as dotenv from 'dotenv';
import path from 'path';

const mode = process.env.NODE_ENV || 'production';

// Load the appropriate .env file
const dotenvPath = path.resolve(__dirname, `.env${mode !== 'production' ? `.${mode}` : ''}`);
dotenv.config({ path: dotenvPath });

// Can expand the Datasource processor types via the genreic param
const project: CosmosProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "cosmoshub-starter",
  description:
    "This project can be use as a starting point for developing your Cosmos CosmosHub based SubQuery project",
  runner: {
    node: {
      name: "@subql/node-cosmos",
      version: ">=3.0.0",
    },
    query: {
      name: "@subql/query",
      version: "*",
    },
  },
  schema: {
    file: "./schema.graphql",
  },
  network: {
    /* The unique chainID of the Cosmos Zone */
    chainId: process.env.CHAIN_ID!,
    /**
     * These endpoint(s) should be public non-pruned archive node
     * We recommend providing more than one endpoint for improved reliability, performance, and uptime
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
     * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
     */
    endpoint: process.env.ENDPOINT!?.split(',') as string[] | string,
    chaintypes: new Map([
      [
        "cosmos.slashing.v1beta1",
        {
          file: "./proto/cosmos/slashing/v1beta1/tx.proto",
          messages: ["MsgUnjail"],
        },
      ],
      [
        "cosmos.gov.v1beta1",
        {
          file: "./proto/cosmos/gov/v1beta1/tx.proto",
          messages: ["MsgVoteWeighted"],
        },
      ],
      [
        "cosmos.gov.v1beta1.gov",
        {
          file: "./proto/cosmos/gov/v1beta1/gov.proto",
          messages: ["WeightedVoteOption"],
        },
      ],
    ]),
  },
  dataSources: [
    {
      kind: CosmosDatasourceKind.Runtime,
      startBlock: 831000,
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            handler: "handleEvent",
            kind: CosmosHandlerKind.Event,
            filter: {
              type: "transfer",
              messageFilter: {
                type: "/cosmos.bank.v1beta1.MsgSend",
              },
            },
          },
          {
            handler: "handleMessage",
            kind: CosmosHandlerKind.Message,
            filter: {
              type: "/cosmos.bank.v1beta1.MsgSend",
            },
          },
          {
            handler: "handleClientEvent",
            kind: CosmosHandlerKind.Event,
            filter: {
              type: "create_client",
              messageFilter: {
                type: "/ibc.core.client.v1.MsgCreateClient",
              },
              
            },
          },
          {
            handler: "handleClientEvent",
            kind: CosmosHandlerKind.Event,
            filter: {
              type: "update_client",
              messageFilter: {
                type: "/ibc.core.client.v1.MsgUpdateClient",
              },
              
            },
          },
          {
            handler: "handleConnectionEvent",
            kind: CosmosHandlerKind.Event,
            filter: {
              type: "connection_open_init",
              messageFilter: {
                type: "/ibc.core.connection.v1.MsgConnectionOpenInit",
              },
              
            },
          },
          {
            handler: "handleConnectionEvent",
            kind: CosmosHandlerKind.Event,
            filter: {
              type: "connection_open_try",
              messageFilter: {
                type: "/ibc.core.connection.v1.MsgConnectionOpenTry",
              },
            },
          },
          {
            handler: "handleConnectionEvent",
            kind: CosmosHandlerKind.Event,
            filter: {
              type: "connection_open_ack",
              messageFilter: {
                type: "/ibc.core.connection.v1.MsgConnectionOpenAck",
              },
            },
          },
          {
            handler: "handleConnectionEvent",
            kind: CosmosHandlerKind.Event,
            filter: {
              type: "connection_open_confirm",
              messageFilter: {
                type: "/ibc.core.connection.v1.MsgConnectionOpenConfirm",
              },
            },
          },
          {
            handler: "handleChannelEvent",
            kind: CosmosHandlerKind.Event,
            filter: {
              type: "channel_open_init",
              messageFilter: {
                type: "/ibc.core.channel.v1.MsgChannelOpenInit",
              },
            },
          },
          {
            handler: "handleChannelEvent",
            kind: CosmosHandlerKind.Event,
            filter: {
              type: "channel_open_try",
              messageFilter: {
                type: "/ibc.core.channel.v1.MsgChannelOpenTry",
              },
            },
          },
          {
            handler: "handleChannelEvent",
            kind: CosmosHandlerKind.Event,
            filter: {
              type: "channel_open_ack",
              messageFilter: {
                type: "/ibc.core.channel.v1.MsgChannelOpenAck",
              },
            },
          },
          {
            handler: "handleChannelEvent",
            kind: CosmosHandlerKind.Event,
            filter: {
              type: "channel_open_confirm",
              messageFilter: {
                type: "/ibc.core.channel.v1.MsgChannelOpenConfirm",
              },
            },
          },
        ],
      },
    },
  ],
};

// Must set default to the project instance
export default project;
