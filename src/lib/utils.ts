import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ToolName } from "@/types/workflow";

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
    case ToolName.R2Upload:
      return "R2 上传";
    case ToolName.DeployWebsite:
      return "部署工具";
    case ToolName.VerifyWebsite:
      return "网站验证工具";
    case ToolName.FileSaver:
      return "文件管理器";
  }

  return "";
}

export const getCodeLanguage = (path: string): string => {
  const extension = path.split(".").pop();
  switch (extension) {
    case "js":
      return "javascript";
    case "ts":
      return "typescript";
    case "py":
      return "python";
    case "sh":
      return "bash";
    case "html":
      return "html";
    case "css":
      return "css";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "txt":
      return "plaintext";
    case "xml":
      return "xml";
    case "yaml":
      return "yaml";
    case "yml":
      return "yaml";
    case "toml":
      return "toml";
    case "ini":
      return "ini";
    default:
      return "plaintext";
  }
};