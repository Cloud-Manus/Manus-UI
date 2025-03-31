import { ToolName } from "@/types/tools/base";
import { ToolDetails } from "@/types/tools/base";
import { BashDetails } from "@/types/tools/bash";

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
  }

  return "";
}
