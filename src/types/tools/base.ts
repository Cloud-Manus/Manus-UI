import { BrowserUseDetails } from "./browserUse";
import { BashDetails } from "./bash";
import { TerminateDetails } from "./terminate";
import { StrReplaceEditorDetails } from "./strReplaceEditor";
import { CreateChatCompletionDetails } from "./createChatComopletion";
import { PlanningDetails } from "./planning";
import { TerminalDetails } from "./terminal";
import { WebSearchDetails } from "./webSearch";

export enum ToolName {
  "BaseTool" = "BaseTool",
  "Bash" = "Bash",
  "BrowserUseTool" = "BrowserUseTool",
  "Terminate" = "Terminate",
  "StrReplaceEditor" = "StrReplaceEditor",
  "ToolCollection" = "ToolCollection",
  "CreateChatCompletion" = "CreateChatCompletion",
  "PlanningTool" = "PlanningTool",
  "Terminal" = "Terminal",
  "WebSearch" = "WebSearch",
}

// Response type
export interface ToolResponse {
  output: string;
  error?: string;
  base64_image?: string;
  system?: string;
}

export type ToolDetails = {
  browserUse?: BrowserUseDetails;
  bash?: BashDetails;
  terminate?: TerminateDetails;
  strReplaceEditor?: StrReplaceEditorDetails;
  createChatCompletion?: CreateChatCompletionDetails;
  planning?: PlanningDetails;
  terminal?: TerminalDetails;
  webSearch?: WebSearchDetails;
}