export enum EventType {
  "act" = "act",
  "chat" = "chat",
  "task_complete" = "complete", // 完成执行任务
  "live_status" = "liveStatus",
  "result" = "result",
  "status_update" = "statusUpdate",
  "step" = "step",
  "think" = "think",
  "tool" = "tool",
  "tool_used" = "toolUsed", // 工具执行完成
  "plan_update" = "planUpdate",

  // @Deprecated ⬇️
  "task_start" = "task_start", // 开始执行任务
  "task_state_change" = "status", // 任务状态变化
  "tool_select" = "tool_select", // 选择工具
  "tool_execute" = "tool_execute", // 执行工具
  "error" = "error",
  "update_token_count" = "update_token_count",
}

export enum ToolName {
  "BaseTool" = "base_tool",
  "Bash" = "bash",
  "BrowserUseTool" = "browser_use",
  "Terminate" = "terminate",
  "StrReplaceEditor" = "str_replace_editor",
  "ToolCollection" = "tool_collection",
  "CreateChatCompletion" = "create_chat_completion",
  "PlanningTool" = "planning",
  "Terminal" = "terminal",
  "WebSearch" = "web_search",
  "PythonExecute" = "python_execute",
  "R2Upload" = "r2_upload",
  "DeployWebsite" = "deploy_website",
  "VerifyWebsite" = "verify_website",
  "Finish" = "finish",
}

export type WorkflowBaseEvent = {
  id: string;
  type: EventType.think | EventType.task_start | EventType.task_complete | EventType.step;
  step: number;
  content: string;
  timestamp: number;
}

export type PlanStep = {
  id: string;
  title: string;
  status: PlanStepStatus;
}
export type WorkflowPlanEvent = WorkflowBaseEvent & {
  type: EventType.plan_update;
  steps?: PlanStep[];
  plan_step_id: string;
  tool: ToolName.PlanningTool;
  tool_detail: {
    planning?: PlanningDetails;
  };
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

export enum TaskState {
  "pending" = "pending",
  "running" = "running",
  "completed" = "completed",
  "failed" = "failed",
  "terminated" = "terminated"
}

export type WorkflowTaskEvent = WorkflowBaseEvent & {
  type: EventType.task_start | EventType.task_complete | EventType.task_state_change;
  status: TaskState;
  request?: string;
  results?: string[];
  result?: string;
  terminated?: boolean;
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

// 定义一个简化的工作流事件类型，避免使用复杂的联合类型
export type SimpleWorkflowEvent = {
  id: string;
  type: EventType;
  step: number;
  content: string;
  timestamp: number;
  // 工具事件相关字段
  tool?: ToolName;
  tool_status?: 'executing' | 'success' | 'fail'; // 修改为与 WorkflowToolEvent 一致，从 'failed' 改为 'fail'
  tool_detail?: ToolDetails; // 与 workflow.ts 中的 WorkflowToolEvent.tool_detail 字段兼容
  tools_selected?: ToolName[]; // 与 workflow.ts 中的 WorkflowToolEvent.toolsSelected 字段兼容
  // 任务事件相关字段
  status?: TaskState;
  request?: string;
  results?: string[];
  result?: string;
  // 聊天事件相关字段
  sender?: 'user' | 'assistant' | 'system';
  // 错误事件相关字段
  error?: string;
  // 令牌计数事件相关字段
  token_count?: number;
  // 计划相关字段
  steps?: PlanStep[];
  plan_step_id?: string;
  terminated?: boolean;
};
