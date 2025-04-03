type TerminalParams = {
  command: string;
}

type TerminalResponse = {
  result: ToolResponse;
}

type TerminalDetails = TerminalParams & TerminalResponse;