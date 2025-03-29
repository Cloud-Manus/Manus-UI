export enum EventType {
  "task_start" = "task_start", // 开始执行任务
  "task_complete" = "task_complete", // 完成执行任务
  "task_state_change" = "task_state_change", // 任务状态变化
  "thinking" = "thinking",
  "chat" = "chat",
  "step" = "step",
  
  "tool_select" = "tool_select", // 选择工具
  "tool_execute" = "tool_execute", // 执行工具
  "tool_completed" = "tool_completed", // 工具结果

  "error" = "error",

  "update_token_count" = "update_token_count",
  
  // "plan_create" = "plan_create", // 创建计划，附带内容
  // "plan_update" = "plan_update", // 更新计划
  // "plan_step_start" = "plan_step_start", // 开始执行计划步骤
  // "plan_step_completed" = "plan_step_completed", // 完成计划步骤
  // "plan_status" = "plan_status", // 计划状态
  // "plan_step" = "plan_step", // 计划步骤
  
  // "flow_start" = "flow_start",
  // "flow_step" = "flow_step",
  // "flow_complete" = "flow_complete",
  // "flow_error" = "flow_error",
  
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
  role: 'user' | 'assistant' | 'system';
};

export type Tool = {
  name: string;
  arguments: Record<string, unknown>;
  result?: string;
  screenshot?: string;
}

export type WorkflowToolEvent = WorkflowBaseEvent & {
  type: EventType.tool_select | EventType.tool_execute | EventType.tool_completed;
  toolsSelected?: string[];
  details?: Tool;
};

enum TaskState {
  IDLE = "IDLE",
  RUNNING = "RUNNING",
  FINISHED = "FINISHED",
  ERROR = "ERROR"
}

export type WorkflowTaskEvent = WorkflowBaseEvent & {
  type: EventType.task_start | EventType.task_complete | EventType.task_state_change;
  state: TaskState;
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
  title?: string;
  createdAt: number;
  finishedAt?: number;
  metaData?: {
    planningModel: string;
    VisModel: string;
    toolsUsed: Tool[];
  };
  events: WorkflowEvent[];
};
