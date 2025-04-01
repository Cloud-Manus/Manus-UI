import { useCallback, useMemo } from "react";
import { DisplayStep } from "@/pages/ChatPage"
import { EventType } from "@/types/workflow";
import { ToolName } from "@/types/tools/base";
import { BrowserAction } from "@/types/tools/browserUse";
import { StrReplaceEditorCommand } from "@/types/tools/strReplaceEditor";
import { getToolName } from "@/lib/utils";
import ChatEvent from "../ChatEvent";
export const shouldOpenBrowser: BrowserAction[] = [
  'go_to_url',
  'go_back',
  'web_search',
  'extract_content',
]

export const shouldOpenEditor: StrReplaceEditorCommand[] = [
  'create',
  'str_replace',
  'insert',
]

export const shouldOpenTools: ToolName[] = [
  ToolName.Bash,
  ToolName.Terminal,
  ToolName.WebSearch,
  ToolName.PythonExecute,
]

export default function ToolEvent({
  event,
  isSelected,
  onOpenTool,
}: {
  event: DisplayStep,
  isSelected: boolean,
  onOpenTool?: () => void,
}) {
  const clickable = useMemo(() => {
    if (event.type !== EventType.tool_used || !event.tool) {
      return false;
    }
    if (shouldOpenTools.includes(event.tool)) {
      return true;
    }

    if (event.tool === ToolName.BrowserUseTool && event.tool_detail) {
      const details = event.tool_detail.browser_use
      if (details && shouldOpenBrowser.includes(details.action as BrowserAction)) {
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
  }, [event])

  const handleClick = useCallback(() => {
    if (clickable && onOpenTool) {
      onOpenTool();
    }
  }, [clickable, onOpenTool])

  if (event.tool === ToolName.Terminate) {
    return <div className="rounded-full border py-1 px-3 bg-[var(--red-6)] text-[var(--red-2)] font-subtle-medium">任务终止</div>
  }

  if (event.tool === ToolName.CreateChatCompletion) {
    return <ChatEvent event={event} />
  }

  return <div
    className={`relative ${clickable ? "cursor-pointer" : ""} rounded-full border py-1 px-3 bg-[var(--gray-2)] overflow-hidden ${isSelected && clickable ? "bg-[var(--dark-1)] text-white" : ''} transition-colors`}
    onClick={handleClick}
    role={clickable ? "button" : undefined}
  >
    <span className="font-subtle-medium mr-2">正在调用工具：</span>
    {event.tool && <span className="inline-code mr-2">{getToolName(event.tool)}</span>}
    {/* {event.content && <span className="font-subtle overflow-hidden text-ellipsis whitespace-nowrap">{event.content}</span>} */}
  </div>
}