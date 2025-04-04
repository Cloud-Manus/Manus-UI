import { EventType, SimpleWorkflowEvent } from "@/types/workflow";
import { DisplayStep } from "@/pages/ChatPage";
import { ToolName } from "@/types/workflow";

const shouldOpenEditor: StrReplaceEditorCommand[] = [
  'create',
  'str_replace',
  'insert',
]

const shouldOpenTools: ToolName[] = [
  ToolName.Bash,
  ToolName.Terminal,
  ToolName.WebSearch,
  ToolName.PythonExecute,
  ToolName.FileSaver,
]

export function shouldOpenComputerForEvent(event: DisplayStep | SimpleWorkflowEvent) {
  if (event.type !== EventType.tool_used || !event.tool) {
    return false;
  }
  if (shouldOpenTools.includes(event.tool)) {
    return true;
  }

  if (event.tool === ToolName.BrowserUseTool && event.tool_detail) {
    const details = event.tool_detail.browser_use
    if (details && details.action !== "extract_content" && !details.result.error) {
      return true;
    }
    return false
  }

  if (event.tool === ToolName.StrReplaceEditor && event.tool_detail) {
    const details = event.tool_detail.str_replace_editor
    if (details && shouldOpenEditor.includes(details.command as StrReplaceEditorCommand)) {
      return true;
    }
    return false
  }

  return false;
}