import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { DynamoDBClient, ScanCommandOutput } from "@aws-sdk/client-dynamodb";
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamicModuleLoader } from "vm";
import { dynomodbScanTable } from "./aws";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
   const tableName = process.env.TABLE_NAME ?? "Vendors";
   const pageLimit = event.queryStringParameters?.limit;
   const lastEvaluatedKey = event.queryStringParameters?.lastEvaluatedKey ? (JSON.parse(event.queryStringParameters.lastEvaluatedKey)) : undefined;
   
   let scanTableGen: AsyncGenerator<ScanCommandOutput, void, unknown>;

   try {
      scanTableGen = await dynomodbScanTable(tableName, Number(pageLimit) || 20, lastEvaluatedKey);
   } catch (error) {
      console.error("Error occurred while scanning DynamoDB table:", error);
      return {
         statusCode: 500,
         headers:{
            "Content-Type": "application/json",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"

         },
         body: JSON.stringify({ error: "Internal Server Error" })
      };
   }

   const scanResult = await scanTableGen.next();

   if (scanResult.value) {
      return {
         statusCode: 200,
         headers:{
            "Content-Type": "application/json",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
         },
         body: JSON.stringify({
            items: scanResult.value,
            lastEvaluatedKey: scanResult.value.LastEvaluatedKey ? (scanResult.value.LastEvaluatedKey) : null

         })
      };
   }
   return {
      statusCode: 200,
      headers:{
         "Content-Type": "application/json",
         "Access-Control-Allow-Headers": "*",
         "Access-Control-Allow-Origin": "*",
         "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
      },
      body: JSON.stringify({
         items: [],
         lastEvaluatedKey: null
      })
   };
};