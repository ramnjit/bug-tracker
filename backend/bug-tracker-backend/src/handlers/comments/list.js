import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

const tableName = process.env.COMMENTS_TABLE_NAME;
const indexName = process.env.ISSUE_ID_INDEX_NAME;

export const handler = async (event) => {
  try {
    const { issueId } = event.pathParameters;

    const params = {
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: "issueId = :issueId",
      ExpressionAttributeValues: {
        ":issueId": issueId,
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
      body: JSON.stringify({ message: "Could not retrieve comments.", error: error.message }),
    };
  }
};