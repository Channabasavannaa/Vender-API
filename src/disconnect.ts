import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { RemoveConnection } from "./aws";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const tableName = process.env.TABLE_NAME ?? "WebSocketConnections"; 
    const connectionId = event.requestContext.connectionId ?? "";
    console.log("Connection ID:", connectionId);
    const res = await RemoveConnection(tableName, connectionId);
    if (res instanceof Error) {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Failed to add connection", error: res.message }),
        };
    }
    console.log("Connection disconnected successfully:");
    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Connection disconnected successfully" }),
    };
};

