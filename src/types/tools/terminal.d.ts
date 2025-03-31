type TerminalParams = {
  command: string;
}

type TerminalResponse = {
  result: ToolResponse;
}

export type TerminalDetails = TerminalParams & TerminalResponse;