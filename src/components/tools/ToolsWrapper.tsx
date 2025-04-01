"use client";

import { useCallback } from "react";
import type { ToolDetails } from "@/types/tools/base";
import { ToolName } from "@/types/tools/base";
import StrReplaceEditor from "./StrReplaceEditor/StrReplaceEditor";
import Terminal from "./Terminal/Terminal";
import WebSearch from "./WebSearch/WebSearch";
import BrowserUse from "./BrowserUse/BrowserUse";
import Planning from "./Planning/Planning";
import { getToolName } from "@/lib/utils";
import ToolDesc from "./ToolDesc";
import PythonExecute from "./PythonExecute/index";

export default function ToolsWrapper({
  toolName,
  toolDetails
}: {
  toolName: ToolName;
  toolDetails: ToolDetails;
}) {
  const renderTool = useCallback(() => {
    switch (toolName) {
      case ToolName.StrReplaceEditor:
        if (toolDetails.str_replace_editor) {
          return <StrReplaceEditor toolDetails={toolDetails.str_replace_editor} />;
        }
        break;
      case ToolName.PythonExecute:
        if (toolDetails.python_execute) {
          return <PythonExecute toolDetails={toolDetails.python_execute} />;
        }
        break;
      case ToolName.Bash:
        if (toolDetails.bash) {
          return <Terminal toolDetails={toolDetails.bash} />;
        }
        break;
      case ToolName.Terminal:
        if (toolDetails.terminal) {
          return <Terminal toolDetails={toolDetails.terminal} />;
        }
        break;
      case ToolName.WebSearch:
        if (toolDetails.web_search) {
          return <WebSearch toolDetails={toolDetails.web_search} />;
        }
        break;
      case ToolName.BrowserUseTool:
        if (toolDetails.browser_use) {
          return <BrowserUse toolDetails={toolDetails.browser_use} />;
        }
        break;
      case ToolName.PlanningTool:
        if (toolDetails.planning) {
          return <Planning toolDetails={toolDetails.planning} />;
        }
        break;
      // 其他工具组件将在未来实现
      case ToolName.Terminate:
      case ToolName.CreateChatCompletion:
        return <div className="p-4 text-muted-foreground">Tool {toolName} visualization not implemented yet</div>;
      default:
        return <div className="p-4 text-muted-foreground">Unknown tool type: {toolName}</div>;
    }
    
    return <div className="p-4 text-muted-foreground">No valid tool details provided for {toolName}</div>;
  }, [toolName, toolDetails]);

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div className="flex flex-col gap-3 h-full">
        <div className="flex flex-col justify-start items-start gap-1">
          <p className="font-small">OpenManus 正在使用 <span className="font-small-medium bg-[var(--gray-2)] rounded-sm px-1 py-0.5">{getToolName(toolName)}</span></p>
          <ToolDesc toolName={toolName} toolDetails={toolDetails} />
        </div>
        <div className="flex flex-col flex-1 overflow-hidden gap-3">
          {renderTool()}
        </div>
      </div>
    </div>
  );
}