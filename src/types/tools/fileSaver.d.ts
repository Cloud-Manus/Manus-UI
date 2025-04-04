
interface FileSaverParams {
  content: string;
  file_path: string;
  mode?: "w" | "a"; // "w" for write, "a" for append. Default is "w".
}

type FileSaverResponse = {
  result: ToolResponse & {
    observation: string;
    success: boolean;
  };
}

type FileSaverDetails = FileSaverParams & FileSaverResponse;