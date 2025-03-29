// Terminate tool types
export interface TerminateParams {
  status: 'success' | 'failure'; // The finish status of the interaction
}

export type TerminateResponse = {
  result: string;
}