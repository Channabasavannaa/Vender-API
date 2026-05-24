import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { addconnection } from "./aws";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const tableName = process.env.TABLE_NAME ?? "WebSocketConnections";
    const connectionId = event.requestContext.connectionId ?? "";
    console.log("Connection ID:", connectionId);
    const res = await addconnection(tableName, connectionId);
    if (res instanceof Error) {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Failed to add connection", error: res.message }),
        };
    }
    console.log("Connection added successfully:");
    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Connection added successfully" }),
    };
};

export const exec = async (tableName: string, connectionId: string) => {
  try {
    const res = await addconnection(tableName, connectionId);
    return res;
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("Error:", error.message);
    return error;
  }
}

exec("WebSocketConnections", "123").then((res) => {
  console.log("Result:", res);
}).catch((error) => {
  console.error("Error:", error.message);
});