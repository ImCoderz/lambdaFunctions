import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient();

export const handler = async (event) => {
  try {
    const todos = await getAllTodos();

    return {
      statusCode: 200,
      body: JSON.stringify(todos),
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (err) {
    console.error(err);
    return errorResponse(err.message, event.requestContext.requestId);
  }
};

const getAllTodos = async () => {
  const params = {
    TableName: "ToDoTable",
  };
  const command = new ScanCommand(params);
  const data = await ddbClient.send(command);
  return data.Items.map((item) => unmarshall(item));
};
const unmarshall = (item) => {
  return {
    toDoId: Number(item.toDoId.N),
    Title: item.Title.S,
    CreatedAt: item.CreatedAt.S,
    IsComplete: item.IsComplete.BOOL,
  };
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
