import { useCallback, useMemo } from "react";
import { DisplayStep } from "@/pages/ChatPage"
import { ToolName } from "@/types/workflow";
import { getToolName } from "@/lib/utils";
import ChatEvent from "../ChatEvent";
import { MarkdownRenderer } from "@/components/ui/standard/markdown-renderer";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { shouldOpenComputerForEvent } from "../utils";

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
    return shouldOpenComputerForEvent(event);
  }, [event])

  const toolDesc = useMemo(() => {
    if (event.tool === ToolName.BrowserUseTool && event.tool_detail?.browser_use) {
      const details = event.tool_detail.browser_use
      if (details.action === "web_search") {
        return `搜索 ${details.query}`
      }
      if (details.action === "extract_content") {
        return `在网页中提取相关内容`
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
    if (event.tool === ToolName.DeployWebsite && event.tool_detail?.deploy_website) {
      const details = event.tool_detail.deploy_website
      if (details.result.url) {
        return `部署网站：${details.result.url}`
      }
    }
    if (event.tool === ToolName.VerifyWebsite && event.tool_detail?.verify_website) {
      const details = event.tool_detail.verify_website
      if (details.success) {
        return <>网站已可访问：<a href={details.url} target="_blank">{details.url}</a></>
      }
    }
    if (event.tool === ToolName.R2Upload && event.tool_detail?.r2_upload) {
      const details = event.tool_detail.r2_upload
      if (details.file_name) {
        return `上传文件 ${details.file_name} 到 R2，你可以访问 ${details.result.url}`
      }
      if (details.file_path) {
        return `上传文件 ${details.file_path} 到 R2，你可以访问 ${details.result.url}`
      }
      if (details.content) {
        return `上传内容 ${details.content} 到 R2，你可以访问 ${details.result.url}`
      }
    }
    if (event.tool === ToolName.FileSaver && event.tool_detail?.file_saver) {
      const details = event.tool_detail.file_saver
      if (details.file_path) {
        return `保存文件 ${details.file_path}`
      }
    }
    return ""
  }, [event])

  const toolContent = useMemo(() => {
    if (!event.tool_detail) {
      return;
    }
    if (event.error) {
      return <ErrorMessage error={event.error} />
    }
    const allDetails = Object.values(event.tool_detail || {})
    for (const details of allDetails) {
      if (details?.result?.error) {
        return <ErrorMessage error={details.result.error} />
      }
    }

    if (event.tool === ToolName.BrowserUseTool && event.tool_detail?.browser_use) {
      const details = event.tool_detail.browser_use
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
    if (event.tool === ToolName.DeployWebsite && event.tool_detail?.deploy_website) {
      const details = event.tool_detail.deploy_website
      if (details.entry_url) {
        return <>部署成功：<a href={details.entry_url} target="_blank">{details.entry_url}</a></>
      }
    }
    if (event.tool === ToolName.PythonExecute && event.tool_detail?.python_execute) {
      const details = event.tool_detail.python_execute
      if (details.result.output) {
        return details.result.output;
      }
    }
    return;
  }, [event])

  const handleClick = useCallback(() => {
    if (clickable && onOpenTool) {
      onOpenTool();
    }
  }, [clickable, onOpenTool])

  if (event.tool === ToolName.Terminate || event.tool === ToolName.Finish) {
    return null;
  }

  if (event.tool === ToolName.CreateChatCompletion) {
    return <ChatEvent event={event} />
  }

  return <div
    className={cn("max-w-[800px] relative flex items-center justify-between gap-2",
      `${clickable ? "cursor-pointer shadow-md" : ""}`,
      `${isSelected && clickable ? "bg-[var(--dark-1)] text-white" : 'bg-[var(--gray-2)]'}`,
      "rounded-lg border py-1 px-3 overflow-hidden transition-colors"
    )}
    onClick={handleClick}
    role={clickable ? "button" : undefined}
  >
    <div className="flex-1">
      {event.tool && <span className="font-subtle-medium mr-1">使用{getToolName(event.tool)}</span>}
      {toolDesc && <span className="font-subtle-medium">{toolDesc}</span>}
      {toolContent && <div className="mt-2 font-subtle">
        {toolContent}
      </div>}
    </div>
    {clickable && <ChevronRight size={16} />}
    {/* {event.content && <span className="font-subtle overflow-hidden text-ellipsis whitespace-nowrap">{event.content}</span>} */}
  </div>
}