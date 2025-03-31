// CreateChatCompletion tool types
// Note: This tool has dynamic parameters based on the response_type,
// but typically includes a 'response' field
interface CreateChatCompletionParams {
  response: any; // The response content (type depends on the configured response_type)
  [key: string]: any; // Other possible fields depending on the schema
}

type CreateChatCompletionResponse = {
  result: any;
}

export type CreateChatCompletionDetails = CreateChatCompletionParams & CreateChatCompletionResponse;