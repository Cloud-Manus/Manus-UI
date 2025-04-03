
interface PythonExecuteParams {
  code: string;
}

type PythonExecuteResponse = {
  result: ToolResponse & {
    observation: string;
    success: boolean;
  };
}

type PythonExecuteDetails = PythonExecuteParams & PythonExecuteResponse;