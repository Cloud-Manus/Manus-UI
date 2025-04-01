import { ToolResponse } from "./base";

// Bash tool types
interface BashParams {
  command: string; // The bash command to execute
  restart?: boolean; // Whether to restart the bash session
}

type BashResponse = {
  result: ToolResponse;
}

export type BashDetails = BashParams & BashResponse;