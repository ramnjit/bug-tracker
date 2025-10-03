import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);
const tableName = process.env.USERS_TABLE_NAME;

// Define CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
};

export const handler = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Email and password are required." }),
      };
    }

    // Check if user with this email already exists
    const userExistsParams = {
      TableName: tableName,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
    };
    const existingUsers = await dynamoDb.send(new QueryCommand(userExistsParams));

    if (existingUsers.Items && existingUsers.Items.length > 0) {
      return {
        statusCode: 409,
        headers: corsHeaders,
        body: JSON.stringify({ message: "A user with this email already exists." }),
      };
    }

    // If no user exists, create the new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      userId: randomUUID(),
      email: email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    await dynamoDb.send(new PutCommand({ TableName: tableName, Item: newUser }));

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "User registered successfully.",
        userId: newUser.userId,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Could not register user.", error: error.message }),
    };
  }
};