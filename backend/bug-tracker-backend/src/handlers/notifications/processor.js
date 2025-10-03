export const handler = async (event) => {
  console.log("Processing notification...");

  for (const record of event.Records) {
    // The SNS message is a JSON string inside the 'body' of the SQS record.
    const messageBody = JSON.parse(record.body);
    
    // The actual content we sent is inside the 'Message' property of that body.
    const snsMessage = JSON.parse(messageBody.Message);

    console.log("Received SNS Message:", snsMessage);
  }

  console.log("Finished processing.");
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Notifications processed successfully." }),
  };
};