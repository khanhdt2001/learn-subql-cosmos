import { TransferEvent, Message,  ClientInfo, ConnectionInfo, ChannelInfo } from "../types";
import {
  CosmosEvent,
  CosmosMessage,
} from "@subql/types-cosmos";
import { MsgSend } from "../types/proto-interfaces/cosmos/bank/v1beta1/tx";

/*
export async function handleBlock(block: CosmosBlock): Promise<void> {
  // If you want to index each block in Cosmos (CosmosHub), you could do that here
}
*/

/*
export async function handleTransaction(tx: CosmosTransaction): Promise<void> {
  // If you want to index each transaction in Cosmos (CosmosHub), you could do that here
  const transactionRecord = Transaction.create({
    id: tx.hash,
    blockHeight: BigInt(tx.block.block.header.height),
    timestamp: tx.block.block.header.time,
  });
  await transactionRecord.save();
}
*/

export async function handleMessage(
  msg: CosmosMessage<MsgSend>
): Promise<void> {
  const messageRecord = Message.create({
    id: `${msg.tx.hash}-${msg.idx}`,
    blockHeight: BigInt(msg.block.block.header.height),
    txHash: msg.tx.hash,
    from: msg.msg.decodedMsg.fromAddress,
    to: msg.msg.decodedMsg.toAddress,
    amount: JSON.stringify(msg.msg.decodedMsg.amount),
  });
  await messageRecord.save();
}

export async function handleEvent(event: CosmosEvent): Promise<void> {
  const eventRecord = TransferEvent.create({
    id: `${event.tx.hash}-${event.msg.idx}-${event.idx}`,
    blockHeight: BigInt(event.block.block.header.height),
    txHash: event.tx.hash,
    recipient: "",
    amount: "",
    sender: "",
  });
  for (const attr of event.event.attributes) {
    switch (attr.key) {
      case "recipient":
        eventRecord.recipient = attr.value.toString();
        break;
      case "amount":
        eventRecord.amount = attr.value.toString();
        break;
      case "sender":
        eventRecord.sender = attr.value.toString();
        break;
      default:
        break;
    }
  }
  await eventRecord.save();
}

export async function handleClientEvent(event:CosmosEvent) :Promise<void> {
  logger.info(`handleEventUpdateClient`);

  const record = ClientInfo.create({
    id: `${event.tx.hash}-${event.msg.idx}-${event.idx}`,
    eventType: event.event.type,
    clientId: "default_client_id",
    revisionNumber: BigInt(0),
    revisionHeight: BigInt(0),
    header: "default_header",
  });

  for (const attr of event.event.attributes){
    switch (attr.key) {
      case "client_id":
        record.clientId = attr.value.toString();
        break;
      case "consensus_height":
        const revisionSplit =  attr.value.toString().split('-');
        if (revisionSplit.length != 2) {
          logger.error(`Invalid revision height ${attr.value}`);
          break;
        }
        const revisionNumberString = revisionSplit[0];
        let revisionNumber : number;
        try {
           revisionNumber = parseInt(revisionNumberString, 10);
        } catch (error) {
          logger.error(`Invalid revision number ${attr.value}`);
          break;
        }
        const revisionHeightString = revisionSplit[1];
        let revisionHeight : number;
        try {
          revisionHeight = parseInt(revisionHeightString, 10);
        } catch (error) {
          logger.error(`Invalid revision height ${attr.value}`);
          break;
        }
        record.revisionNumber = BigInt(revisionNumber);
        record.revisionHeight = BigInt(revisionHeight);
        break;
      case "header":
        record.header = attr.value.toString();
        break;
      default:
        break;
    }
  }

  record.save();
}


export async function handleConnectionEvent(event:CosmosEvent) :Promise<void> {
  logger.info(`handleConnectionEvent`);

  const record = ConnectionInfo.create({
    id: `${event.tx.hash}-${event.msg.idx}-${event.idx}`,
    eventType: event.event.type,
    clientId: "default_client_id",
   connId: "default_conn_id",
   counterPartyClientId: "default_counter_party_client_id",
   counterPartyConnId: "default_counter_party_conn_id",
   counterPartyCommitmentPrefix: "default_counter_party_commitment_prefix",
  })
  for (const attr of event.event.attributes) {
    switch (attr.key) {
      case   "connection_id":
        record.connId = attr.value.toString();
        break;
      case "client_id":
        record.clientId = attr.value.toString();
        break;
      case "counterparty_connection_id":
        record.counterPartyConnId = attr.value.toString();
        break;
      case "counterparty_client_id":
        record.counterPartyClientId = attr.value.toString();
        break;
    }
  }
  record.save();
}

export async function handleChannelEvent(event:CosmosEvent) :Promise<void> {
  logger.info(`handleChannelEvent`);
  const record = ChannelInfo.create({
    id: `${event.tx.hash}-${event.msg.idx}-${event.idx}`,
    eventType: event.event.type,
    portId: "default_port_id",
    channelId: "default_channel_id",
    counterPartyPortId: "default_counter_party_port_id",
    counterPartyChannelId: "default_counter_party_channel_id",
    connId: "default_conn_id",
    counterPartyConnId: "default_counter_party_conn_id",
    order: BigInt(0),
    version: "default_version",
  });
  for (const attr of event.event.attributes) {
    switch (attr.key) {
      case "port_id":
        record.portId = attr.value.toString();
        break;
      case "channel_id":
        record.channelId = attr.value.toString();
        break;
      case "counterparty_port_id":
        record.counterPartyPortId = attr.value.toString();
        break;
      case "counterparty_channel_id":
        record.counterPartyChannelId = attr.value.toString();
        break;
      case "connection_id":
        record.connId = attr.value.toString();
        break;
      case "version":
        record.version = attr.value.toString();
        break;
    }
  }
  record.save();
}