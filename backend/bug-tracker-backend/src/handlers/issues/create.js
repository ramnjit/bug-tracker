import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns"; // <-- Missing import
import { randomUUID } from "crypto";

const ddbClient = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(ddbClient);
const snsClient = new SNSClient({}); 

console.log("Create Issue handler started"); // Our debug line

const issuesTableName = process.env.ISSUES_TABLE_NAME;
const topicArn = process.env.ISSUE_EVENTS_TOPIC_ARN; // <-- Missing Topic ARN

export const handler = async (event) => {
  try {
    const { title, description } = JSON.parse(event.body);
    const { orgId } = event.pathParameters;
    const userId = event.requestContext.authorizer.principalId;

    if (!title) {
      return { statusCode: 400, body: JSON.stringify({ message: "Issue title is required." }) };
    }

    const newIssue = {
      issueId: randomUUID(),
      orgId: orgId,
      title: title,
      description: description || "",
      status: "Open",
      reporterId: userId,
      createdAt: new Date().toISOString(),
    };

    // Save the new issue to DynamoDB
    await dynamoDb.send(new PutCommand({ TableName: issuesTableName, Item: newIssue }));

    // Publish an event to the SNS topic
    const snsParams = {
      TopicArn: topicArn,
      Message: JSON.stringify({
        type: "ISSUE_CREATED",
        payload: newIssue,
      }),
    };
    await snsClient.send(new PublishCommand(snsParams));

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Issue created successfully.", issue: newIssue }),
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ message: "Could not create issue.", error: error.message }) };
  }
};