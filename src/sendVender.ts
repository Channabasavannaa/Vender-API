
import {
  APIGatewayProxyResult,
  SQSEvent
} from "aws-lambda";

import {
  ApiGatewayManagementApiClient
} from "@aws-sdk/client-apigatewaymanagementapi";

import {
  getallScanResults,
  broadcastMessage,
  deletesqsMessage
} from "./aws";

export const handler = async (
  event: SQSEvent
): Promise<APIGatewayProxyResult> => {

  const tableName = process.env.TABLE_NAME ?? "WebSocketConnections";
  const webSocketUrl = process.env.WEBSOCKET_URL ?? "https://sqs.us-east-2.amazonaws.com/946926532089/messageQ";
  const sqsUrl = process.env.SQS_URL ?? "";
  
  const endpoint = new URL(webSocketUrl);

  const client = new ApiGatewayManagementApiClient({
    endpoint: `https://${endpoint.host}`, // important for v3
  });

  const message = event.Records[0]?.body;

  if (!message) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "null message" }),
    };
  }

  const dbres= await getallScanResults<{ connectionId: string }>(
    tableName,
    10,
    100
  );

  if (!dbres) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "No data found in the database",
        
      }),
    };
  }

  const broadcastRes = await broadcastMessage({
    apiGatewayEndpoint: client, 
    connections: dbres,
    message: message,
    tableName: tableName,
  });

  if (broadcastRes instanceof Error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Failed to broadcast message",
        error: broadcastRes.message,
      }),
    };
  }

  console.log(
    `Message broadcasted successfully: sent to ${dbres.length} connections`
  );

  const receiptHandle = event.Records?.[0]?.receiptHandle;
if (!receiptHandle) {
  throw new Error("Missing receiptHandle");
}
  await deletesqsMessage(sqsUrl,receiptHandle);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" }, 
    body: JSON.stringify({
      message: "Message deleted",
    }),
  };

};
