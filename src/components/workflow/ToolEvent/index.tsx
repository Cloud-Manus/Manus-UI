import { useCallback, useMemo } from "react";
import { DisplayStep } from "@/pages/ChatPage"
import { EventType } from "@/types/workflow";
import { ToolName } from "@/types/tools/base";
import { BrowserAction } from "@/types/tools/browserUse";
import { StrReplaceEditorCommand } from "@/types/tools/strReplaceEditor";
import { getToolName } from "@/lib/utils";
import ChatEvent from "../ChatEvent";
import { MarkdownRenderer } from "@/components/ui/standard/markdown-renderer";

export const shouldOpenBrowser: BrowserAction[] = [
  'go_to_url',
  'go_back',
  'web_search',
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

const ErrorMessage = ({ error }: { error: string }) => {
  return <div className="font-small">
    <span className="font-small text-[var(--red-2)]">发生错误：{error}</span>
  </div>
}

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
      if (details && shouldOpenBrowser.includes(details.action as BrowserAction) && !details.result.error) {
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

  const toolDesc = useMemo(() => {
    if (event.tool === ToolName.BrowserUseTool && event.tool_detail?.browser_use) {
      const details = event.tool_detail.browser_use
      if (details.action === "web_search") {
        return `搜索 ${details.query}`
      }
      if (details.action === "extract_content") {
        return `提取 ${details.goal} 相关内容`
      }
      if (details.action === "go_to_url") {
        return `浏览 ${details.url}`
      }
      if (details.action === "go_back") {
        return `返回上一页`
      }
      if (details.action === "refresh") {
        return `刷新页面`
      }
      if (details.action === "switch_tab") {
        return `切换到第 ${details.tab_id} 个标签页`
      }
      if (details.action === "open_tab") {
        return `打开新标签页`
      }
      if (details.action === "close_tab") {
        return `关闭当前标签页`
      }
      if (details.action === "wait") {
        return `等待了 ${details.seconds} 秒`
      }
      if (details.action === "click_element") {
        return `点击元素`
      }
      if (details.action === "input_text") {
        return `输入文本 ${details.text}`
      }
      if (details.action === "scroll_down") {
        return `向下滚动`
      }
      if (details.action === "scroll_up") {
        return `向上滚动`
      }
      if (details.action === "scroll_to_text") {
        return `滚动到文本 ${details.text}`
      }
      if (details.action === "send_keys") {
        return `发送按键 ${details.keys}`
      }
      if (details.action === "get_dropdown_options") {
        return `获取下拉选项`
      }
      if (details.action === "select_dropdown_option") {
        return `选择下拉选项 ${details.text}`
      }
    }
    if (event.tool === ToolName.StrReplaceEditor && event.tool_detail?.str_replace_editor) {
      const details = event.tool_detail.str_replace_editor
      if (details.command === "view") {
        return `查看文件 ${details.path}`
      }
      if (details.command === "undo_edit") {
        return `撤销编辑文件 ${details.path}`
      }
    }
    return ""
  }, [event])

  const toolContent = useMemo(() => {
    if (event.error) {
      return <ErrorMessage error={event.error} />
    }
    if (event.tool === ToolName.BrowserUseTool && event.tool_detail?.browser_use) {
      const details = event.tool_detail.browser_use
      if (details.result.error) {
        return <ErrorMessage error={details.result.error} />
      }
      if (details.action === "extract_content") {
        let output = details.result.output;
        output = output.replace("Extracted from page:", "").trim();
        try {
          const extractedResult = JSON.parse(output);
          const text = extractedResult.text
            .replace(/\$/g, "\\$")
            .replace(/\\+\(/g, "$")
            .replace(/\\+\)/g, "$")
            .replace(/\\+\[/g, "$")
            .replace(/\\+\]/g, "$");;
          console.log("extracted result text\n", text);
          return (
            <div className="flex flex-col gap-1">
              <span className="font-small">来源：{extractedResult.metadata.source}</span>
              <MarkdownRenderer>{text}</MarkdownRenderer>
            </div>
          );
        } catch (error) {
          console.error(error);
          return output;
        }
      }
    }
    if (event.tool === ToolName.StrReplaceEditor && event.tool_detail?.str_replace_editor) {
      const details = event.tool_detail.str_replace_editor
      if (details.result.error) {
        return <ErrorMessage error={details.result.error} />
      }
    }
    if (event.tool === ToolName.Bash && event.tool_detail?.bash) {
      const details = event.tool_detail.bash
      if (details.result.error) {
        return <ErrorMessage error={details.result.error} />
      }
    }
    if (event.tool === ToolName.PlanningTool && event.tool_detail?.planning) {
      const details = event.tool_detail.planning
      if (details.result.error) {
        return <ErrorMessage error={details.result.error} />
      }
    }
    if (event.tool === ToolName.Terminal && event.tool_detail?.terminal) {
      const details = event.tool_detail.terminal
      if (details.result.error) {
        return <ErrorMessage error={details.result.error} />
      }
    }
    return "";
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
    className={`relative ${clickable ? "cursor-pointer rounded-full" : "rounded-lg"} border py-1 px-3 overflow-hidden ${isSelected && clickable ? "bg-[var(--dark-1)] text-white" : 'bg-[var(--gray-2)]'} transition-colors`}
    onClick={handleClick}
    role={clickable ? "button" : undefined}
  >
    {event.tool && <span className="font-subtle-medium mr-2">正在使用{getToolName(event.tool)}</span>}
    {toolDesc && <span className="font-small-medium mr-2">{toolDesc}</span>}
    {toolContent && <div className="mt-2">
      {toolContent}
    </div>}
    {/* {event.content && <span className="font-subtle overflow-hidden text-ellipsis whitespace-nowrap">{event.content}</span>} */}
  </div>
}