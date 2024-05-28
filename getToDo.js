import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient();

export const handler = async (event) => {
  const todoId = event.pathParameters.toDoId;
  console.log("Received event for todoId: ", todoId);

  try {
    const todo = await getTodoById(todoId);
    if (todo) {
      return {
        statusCode: 200,
        body: JSON.stringify(todo),
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Todo item not found" }),
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      };
    }
  } catch (err) {
    console.error(err);
    return errorResponse(err.message, event.requestContext.requestId);
  }
};

const getTodoById = async (todoId) => {
  const params = {
    TableName: "ToDoTable",
    Key: {
      toDoId: { N: todoId.toString() }, // DynamoDB expects the number as a string
    },
  };
  const command = new GetItemCommand(params);
  const data = await ddbClient.send(command);
  return data.Item ? unmarshall(data.Item) : null;
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
