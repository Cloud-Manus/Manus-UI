import type { ToolName, ToolDetails } from './tools/base';

export enum EventType {
  "task_start" = "task_start", // 开始执行任务
  "task_complete" = "complete", // 完成执行任务
  "task_state_change" = "status", // 任务状态变化
  "think" = "think",
  "chat" = "chat",
  "step" = "step",
  
  "tool_select" = "tool_select", // 选择工具
  "tool_execute" = "tool_execute", // 执行工具
  "tool_used" = "toolUsed", // 工具执行完成

  "error" = "error",

  "result" = "result",

  "update_token_count" = "update_token_count",
}

export type WorkflowBaseEvent = {
  id: string;
  type: EventType.think | EventType.task_start | EventType.task_complete | EventType.step;
  step: number;
  content: string;
  timestamp: number;
}

export type WorkflowChatEvent = WorkflowBaseEvent & {
  type: EventType.chat;
  sender: 'user' | 'assistant' | 'system';
};

export type WorkflowToolEvent = WorkflowBaseEvent & {
  type: EventType.tool_select | EventType.tool_execute | EventType.tool_used;
  tools_selected?: ToolName[];
  tool?: ToolName;
  tool_status?: "executing" | "success" | "fail";
  tool_detail?: ToolDetails;
};

enum TaskState {
  IDLE = "IDLE",
  RUNNING = "RUNNING",
  FINISHED = "FINISHED",
  ERROR = "ERROR"
}

export type WorkflowTaskEvent = WorkflowBaseEvent & {
  type: EventType.task_start | EventType.task_complete | EventType.task_state_change;
  agent_status: TaskState;
  request?: string;
  results?: string[];
}

export type WorkflowErrorEvent = WorkflowBaseEvent & {
  type: EventType.error;
  error: string;
}

export type WorkflowTokenEvent = WorkflowBaseEvent & {
  type: EventType.update_token_count;
  token_count: number;
}

// export type WorkflowPlanEvent = WorkflowBaseEvent & {
//   type: 'plan_status' | 'plan_step' | 'plan_step_completed';
//   step: number;
//   result?: string;
//   error?: string;
// }

// export type WorkflowFlowEvent = WorkflowBaseEvent & {
//   type: 'flow_start' | 'flow_complete' | 'flow_error';
//   result?: string;
//   error?: string;
// }

export type WorkflowEvent = WorkflowChatEvent | WorkflowToolEvent | WorkflowTaskEvent | WorkflowErrorEvent;

export type Workflow = {
  id: string;
  prompt: string;
  created_at: number;
  finished_at?: number;
  meta_data?: {
    planning_model: string;
    Vis_model: string;
    tools_used: ToolName[];
  };
  events: WorkflowEvent[];
};
