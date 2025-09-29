import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

const tableName = process.env.ORGS_TABLE_NAME;

export const handler = async (event) => {
  try {
    const { name } = JSON.parse(event.body);

    if (!name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Organization name is required." }),
      };
    }

    // Get the userId from the authorizer context
    const userId = event.requestContext.authorizer.principalId;

    const newOrg = {
      orgId: randomUUID(),
      name: name,
      ownerId: userId, // Link the org to the user who created it
      createdAt: new Date().toISOString(),
    };

    await dynamoDb.send(
      new PutCommand({
        TableName: tableName,
        Item: newOrg,
      })
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Organization created successfully.",
        orgId: newOrg.orgId,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Could not create organization.", error: error.message }),
    };
  }
};