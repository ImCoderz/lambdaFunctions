import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient();

export const handler = async (event) => {
  const toDoId = event.pathParameters.toDoId; // Assuming toDoId is passed as a path parameter
  console.log("Received event for toDoId: ", toDoId);

  try {
    await deleteTodoById(toDoId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Todo item deleted successfully",
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (err) {
    console.error(err);
    return errorResponse(err.message, event.requestContext.requestId);
  }
};

const deleteTodoById = async (toDoId) => {
  const params = {
    TableName: "ToDoTable",
    Key: {
      toDoId: { N: toDoId.toString() }, // DynamoDB expects the number as a string
    },
  };
  const command = new DeleteItemCommand(params);
  await ddbClient.send(command);
};

const errorResponse = (errorMessage, awsRequestId) => {
  return {
    statusCode: 500,
    body: JSON.stringify({
      Error: errorMessage,
      Reference: awsRequestId,
    }),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
};
