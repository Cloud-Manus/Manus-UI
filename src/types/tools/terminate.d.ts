// Terminate tool types
interface TerminateParams {
  status: 'success' | 'failure'; // The finish status of the interaction
}

type TerminateResponse = {
  result: string;
}

type TerminateDetails = TerminateParams & TerminateResponse;