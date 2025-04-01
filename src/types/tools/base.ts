import { BrowserUseDetails } from "./browserUse";
import { BashDetails } from "./bash";
import { TerminateDetails } from "./terminate";
import { StrReplaceEditorDetails } from "./strReplaceEditor";
import { CreateChatCompletionDetails } from "./createChatComopletion";
import { PlanningDetails } from "./planning";
import { TerminalDetails } from "./terminal";
import { WebSearchDetails } from "./webSearch";
import { PythonExecuteDetails } from "./pythonExecute";

export enum ToolName {
  "BaseTool" = "base_tool",
  "Bash" = "bash",
  "BrowserUseTool" = "browser_use",
  "Terminate" = "terminate",
  "StrReplaceEditor" = "str_replace_editor",
  "ToolCollection" = "tool_collection",
  "CreateChatCompletion" = "create_chat_completion",
  "PlanningTool" = "planning",
  "Terminal" = "terminal",
  "WebSearch" = "web_search",
  "PythonExecute" = "python_execute",
}

// Response type
export interface ToolResponse {
  output: string;
  error?: string;
  base64_image?: string;
  system?: string;
}

export type ToolDetails = {
  browser_use?: BrowserUseDetails;
  bash?: BashDetails;
  terminate?: TerminateDetails;
  str_replace_editor?: StrReplaceEditorDetails;
  create_chat_completion?: CreateChatCompletionDetails;
  planning?: PlanningDetails;
  terminal?: TerminalDetails;
  web_search?: WebSearchDetails;
  python_execute?: PythonExecuteDetails;
}