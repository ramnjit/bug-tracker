import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;

// Function to generate an IAM policy
const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = "2012-10-17";
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = "execute-api:Invoke";
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};

export const handler = async (event) => {
  const token = event.authorizationToken;

  if (!token) {
    console.log("No token found");
    // You can also throw "Unauthorized" to return a 401
    return generatePolicy("user", "Deny", event.methodArn);
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, jwtSecret);
    console.log("Token is valid", decoded);
    // Return an "Allow" policy
    return generatePolicy(decoded.userId, "Allow", event.methodArn);
  } catch (error) {
    console.error("Invalid token:", error);
    // Return a "Deny" policy
    return generatePolicy("user", "Deny", event.methodArn);
  }
};