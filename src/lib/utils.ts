import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ToolName } from "@/types/tools/base";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getToolName(toolName: ToolName) {
  switch (toolName) {
    case ToolName.Bash:
      return "终端";
    case ToolName.Terminal:
      return "终端";
    case ToolName.WebSearch:
      return "网络搜索";
    case ToolName.BrowserUseTool:
      return "浏览器";
    case ToolName.PlanningTool:
      return "规划";
    case ToolName.StrReplaceEditor:
      return "编辑器";
    case ToolName.PythonExecute:
      return "Python 执行器";
  }

  return "";
}