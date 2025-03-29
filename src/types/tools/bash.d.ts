// Bash tool types
export interface BashParams {
  command: string; // The bash command to execute
  restart?: boolean; // Whether to restart the bash session
}

export type BashResponse = {
  result: string;
}