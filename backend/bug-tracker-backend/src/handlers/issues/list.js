import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

const tableName = process.env.ISSUES_TABLE_NAME;
const indexName = process.env.ORG_ID_INDEX_NAME;

export const handler = async (event) => {
  try {
    const { orgId } = event.pathParameters;

    const params = {
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: "orgId = :orgId",
      ExpressionAttributeValues: {
        ":orgId": orgId,
      },
    };

    const result = await dynamoDb.send(new QueryCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Could not retrieve issues.", error: error.message }),
    };
  }
};