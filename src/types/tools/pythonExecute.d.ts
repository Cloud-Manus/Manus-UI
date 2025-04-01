
interface PythonExecuteParams {
  code: string;
}

type PythonExecuteResponse = {
  result: {
    observation: string;
    success: boolean;
  };
}

export type PythonExecuteDetails = PythonExecuteParams & PythonExecuteResponse;