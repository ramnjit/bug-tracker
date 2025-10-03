import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

const tableName = process.env.COMMENTS_TABLE_NAME;

export const handler = async (event) => {
  try {
    const { text } = JSON.parse(event.body);
    const { issueId } = event.pathParameters;
    const userId = event.requestContext.authorizer.principalId;

    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Comment text is required." }),
      };
    }

    const newComment = {
      commentId: randomUUID(),
      issueId: issueId,
      text: text,
      authorId: userId,
      createdAt: new Date().toISOString(),
    };

    await dynamoDb.send(
      new PutCommand({
        TableName: tableName,
        Item: newComment,
      })
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Comment added successfully.",
        comment: newComment,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Could not add comment.", error: error.message }),
    };
  }
};