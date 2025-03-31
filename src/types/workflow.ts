import type { ToolName, ToolDetails } from './tools/base';

export enum EventType {
  "task_start" = "task_start", // 开始执行任务
  "task_complete" = "task_complete", // 完成执行任务
  "task_state_change" = "task_state_change", // 任务状态变化
  "thinking" = "thinking",
  "chat" = "chat",
  "step" = "step",
  
  "tool_select" = "tool_select", // 选择工具
  "tool_execute" = "tool_execute", // 执行工具
  "tool_completed" = "tool_completed", // 工具执行完成

  "error" = "error",

  "update_token_count" = "update_token_count",
}

export type WorkflowBaseEvent = {
  id: string;
  type: EventType.thinking | EventType.task_start | EventType.task_complete | EventType.step;
  step: number;
  content: string;
  timestamp: number;
}

export type WorkflowChatEvent = WorkflowBaseEvent & {
  type: EventType.chat;
  sender: 'user' | 'assistant' | 'system';
};

export type WorkflowToolEvent = WorkflowBaseEvent & {
  type: EventType.tool_select | EventType.tool_execute | EventType.tool_completed;
  toolsSelected?: ToolName[];
  tool?: ToolName;
  toolStatus?: "executing" | "success" | "fail";
  toolDetails?: ToolDetails;
};

enum TaskState {
  IDLE = "IDLE",
  RUNNING = "RUNNING",
  FINISHED = "FINISHED",
  ERROR = "ERROR"
}

export type WorkflowTaskEvent = WorkflowBaseEvent & {
  type: EventType.task_start | EventType.task_complete | EventType.task_state_change;
  agentStatus: TaskState;
  request?: string;
  results?: string[];
  curStep?: number;
}

export type WorkflowErrorEvent = WorkflowBaseEvent & {
  type: EventType.error;
  error: string;
}

export type WorkflowTokenEvent = WorkflowBaseEvent & {
  type: EventType.update_token_count;
  tokenCount: number;
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
  createdAt: number;
  finishedAt?: number;
  metaData?: {
    planningModel: string;
    VisModel: string;
    toolsUsed: ToolName[];
  };
  events: WorkflowEvent[];
};
