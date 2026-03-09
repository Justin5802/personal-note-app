const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.NOTES_TABLE;

exports.handler = async (event) => {
  try {
    const noteId = event.pathParameters.noteId;

    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { noteId }
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error("Error deleting note:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify({ error: "Failed to delete note" })
    };
  }
};