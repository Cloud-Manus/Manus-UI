import { ToolResponse } from './tools';

// PlanningTool types
type PlanningCommand = 'create' | 'update' | 'list' | 'get' | 'set_active' | 'mark_step' | 'delete';
type PlanStepStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';

interface PlanningParams {
  command: PlanningCommand;
  plan_id?: string; // Unique identifier for the plan
  title?: string; // Title for the plan
  steps?: string[]; // List of plan steps
  step_index?: number; // Index of the step to update (0-based)
  step_status?: PlanStepStatus; // Status to set for a step
  step_notes?: string; // Additional notes for a step
}

type PlanningResponse = {
  result: ToolResponse;
}

export type PlanningDetails = PlanningParams & PlanningResponse;