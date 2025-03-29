import { ToolDetails, ToolName } from "@/types/tools/base";
import StrReplaceEditor from "./StrReplaceEditor/StrReplaceEditor";

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
      // 其他工具组件将在未来实现
      case ToolName.BrowserUseTool:
      case ToolName.Bash:
      case ToolName.Terminate:
      case ToolName.CreateChatCompletion:
      case ToolName.PlanningTool:
      case ToolName.Terminal:
      case ToolName.WebSearch:
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