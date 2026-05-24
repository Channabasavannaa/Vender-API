import { SQSClient,DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, DeleteCommand, ScanCommand  } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
    region: "us-east-1",
});
const docClient = DynamoDBDocumentClient.from(client);

export const addconnection = async (tableName: string, connectionId: string) => {
  try {
    const command = new PutCommand({
       TableName: tableName,
      Item: {
        connectionId : connectionId,
      },
    });

    const res = await docClient.send(command);
    return res;

  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("Error:", error.message);
    return error; // better than returning error object
  }
};




export const RemoveConnection = async (tableName: string, connectionId: string) => {
  try {
    const command = new DeleteCommand({
       TableName: tableName,
      Key: {
        connectionId : connectionId,
      },
    });

    const res = await docClient.send(command);
    return res;

  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("Error:", error.message);
    return error; // better than returning error object
  }
};

export const deletesqsMessage = async (queueUrl: string, receiptHandle: string) => {
  try {    
    const sqsClient = new SQSClient({ region: "us-east-1" });
    const command = new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    });
    const res = await sqsClient.send(command);
    return res;
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("Error:", error.message);
    return error; // better than returning error object
  }
}

interface BroadcastMessageParams {
  apiGatewayEndpoint: ApiGatewayManagementApiClient;
  connections: any[];
  message: string;
  tableName: string;
}



export const broadcastMessage = async (params: BroadcastMessageParams) => {
  const { apiGatewayEndpoint, connections, message, tableName } = params;

  const promises = connections.map(async (connection) => {
    try {
      const command = new PostToConnectionCommand({
        ConnectionId: connection.connectionId,
        Data: message,
      });
       await apiGatewayEndpoint.send(command);
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      console.error("Error:", error.message);
      const removeconnRes = await RemoveConnection(tableName, connection.connectionId);
      if (removeconnRes instanceof Error) {
        console.error("Failed to remove connection:", removeconnRes.message);
      }
      console.log("Removed connection:", removeconnRes);
      return error;
    }
  });
   try{
   const res = await Promise.all(promises);
   return res;
   } catch (error: any) {
   console.error("Error:", error.message);
   return error;
   }
}

export const dynomodbScanTable = async function*(tableName: string, limit: number, lastEvaluatedKey?: Record<string, any>) {  //This code scans a DynamoDB table page-by-page, stops if no items are found, converts DynamoDB data into plain JavaScript objects, and yields each page using an async generator.
  while (true) {
    const params: any = {
      TableName: tableName,
      Limit: limit,
      
    };
  
  if (lastEvaluatedKey) {
    params.ExclusiveStartKey = lastEvaluatedKey;
  }
         
  try{
    
    const result = await client.send(new ScanCommand(params));
    console.log("Scanning table with params:", result);
     yield result;
     if (!result.LastEvaluatedKey) {
      break; 
    }

    lastEvaluatedKey = result.LastEvaluatedKey as Record<string, any> | undefined;
    result.Items = result.Items?.map((item: Record<string, any>) => (item));
    yield result;
  }catch(e){
    if (e instanceof Error) {
      console.error("Error:", e.message);
      throw e;
  }
  throw new Error("Unknown error occurred while scanning table");

  
}


}};

export const getallScanResults = async <T> (tableName: string, pageSize: number, maxItems: number) => {
  try{
  const results: T[] = [];
  console.log("Starting to fetch all items from DynamoDB...");
  for await (const items of dynomodbScanTable(tableName, pageSize)) {
    console.log("Received items:", items);
    for (const item of items as T[]) {
      results.push(item);

      if (results.length >= maxItems) {
        return results;
      }
    }
  }

  return results;
}catch(e){
    if (e instanceof Error) {
      console.error("Error:", e.message);
      throw e;
  }
}}







