import type { ToolDetails } from "@/types/tools/base";
import { ToolName } from "@/types/tools/base";
import StrReplaceEditor from "./StrReplaceEditor/StrReplaceEditor";
import Bash from "./Bash/Bash";
import Terminal from "./Terminal/Terminal";
import WebSearch from "./WebSearch/WebSearch";
import BrowserUse from "./BrowserUse/BrowserUse";
import Planning from "./Planning/Planning";

export default function ToolsWrapper({
  toolName,
  toolDetails
}: {
  toolName: ToolName;
  toolDetails: ToolDetails;
}) {
  const renderTool = () => {
    switch (toolName) {
      case ToolName.StrReplaceEditor:
        if (toolDetails.strReplaceEditor) {
          return <StrReplaceEditor toolDetails={toolDetails.strReplaceEditor} />;
        }
        break;
      case ToolName.Bash:
        if (toolDetails.bash) {
          return <Bash toolDetails={toolDetails.bash} />;
        }
        break;
      case ToolName.Terminal:
        if (toolDetails.terminal) {
          return <Terminal toolDetails={toolDetails.terminal} />;
        }
        break;
      case ToolName.WebSearch:
        if (toolDetails.webSearch) {
          return <WebSearch toolDetails={toolDetails.webSearch} />;
        }
        break;
      case ToolName.BrowserUseTool:
        if (toolDetails.browserUse) {
          return <BrowserUse toolDetails={toolDetails.browserUse} />;
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
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {renderTool()}
    </div>
  );
}