import { BrowserUseParams, BrowserUseResponse } from "./browserUse";
import { BashParams, BashResponse } from "./bash";
import { TerminateParams, TerminateResponse } from "./terminate";
import { StrReplaceEditorParams, StrReplaceEditorResponse } from "./strReplaceEditor";
import { CreateChatCompletionParams, CreateChatCompletionResponse } from "./createChatComopletion";
import { PlanningParams, PlanningResponse } from "./planning";
import { TerminalParams, TerminalResponse } from "./terminal";
import { WebSearchParams, WebSearchResponse } from "./webSearch";

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
  browserUse?: BrowserUseParams & BrowserUseResponse;
  bash?: BashParams & BashResponse;
  terminate?: TerminateParams & TerminateResponse;
  strReplaceEditor?: StrReplaceEditorParams & StrReplaceEditorResponse;
  createChatCompletion?: CreateChatCompletionParams & CreateChatCompletionResponse;
  planning?: PlanningParams & PlanningResponse;
  terminal?: TerminalParams & TerminalResponse;
  webSearch?: WebSearchParams & WebSearchResponse;
}