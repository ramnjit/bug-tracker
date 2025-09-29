import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

const tableName = process.env.USERS_TABLE_NAME;
const emailIndexName = process.env.EMAIL_INDEX_NAME;
const jwtSecret = process.env.JWT_SECRET;

export const handler = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Email and password are required." }),
      };
    }

    // Find the user by email
    const params = {
      TableName: tableName,
      IndexName: emailIndexName,
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    };

    const result = await dynamoDb.send(new QueryCommand(params));
    const user = result.Items?.[0];

    // If user not found, or password doesn't match, return Unauthorized
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return {
        statusCode: 401, // Unauthorized
        body: JSON.stringify({ message: "Invalid email or password." }),
      };
    }

    // If authentication is successful, generate a JWT
    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      jwtSecret,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Login successful.",
        token: token,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Could not process login.", error: error.message }),
    };
  }
};