import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocument-client.from(client);

const tableName = process.env.USERS_TABLE_NAME;
const emailIndexName = process.env.EMAIL_INDEX_NAME;
const jwtSecret = process.env.JWT_SECRET;

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
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ message: "Email and password are required." }) };
    }

    const params = {
      TableName: tableName,
      IndexName: emailIndexName,
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
    };

    const result = await dynamoDb.send(new QueryCommand(params));
    const user = result.Items?.[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ message: "Invalid email or password." }) };
    }

    const token = jwt.sign({ userId: user.userId, email: user.email }, jwtSecret, { expiresIn: "1h" });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Login successful.", token: token }),
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ message: "Could not process login.", error: error.message }) };
  }
};