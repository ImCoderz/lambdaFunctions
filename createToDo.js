import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";

const ddbClient = new DynamoDBClient();

export const handler = async (event) => {
  const todoId = generateNumericUUID();
  console.log("Received event (", todoId, "): ", event);
  const requestBody = JSON.parse(event.body);
  const { Title } = requestBody;

  try {
    await createToDo(todoId, Title, false);

    return {
      statusCode: 201,
      body: JSON.stringify({
        toDoId: todoId,
        Title: Title,
        CreatedAt: new Date().toISOString(),
        IsComplete: false,
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

const createToDo = async (todoId, title, isComplete) => {
  const params = {
    TableName: "ToDoTable",
    Item: {
      toDoId: { N: todoId.toString() },
      Title: { S: title },
      CreatedAt: { S: new Date().toISOString() },
      IsComplete: { BOOL: isComplete },
    },
  };
  const command = new PutItemCommand(params);
  await ddbClient.send(command);
};

const generateNumericUUID = () => {
  // Convert UUID to a numeric value
  const uuid = randomUUID().replace(/-/g, "");
  const numericUuid = BigInt("0x" + uuid).toString();
  return parseInt(numericUuid.slice(0, 15));
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
