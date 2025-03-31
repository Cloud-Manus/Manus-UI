"use client";

import { useState, useEffect } from "react";
import type { ToolDetails } from "@/types/tools/base";
import { ToolName } from "@/types/tools/base";
import type { BashDetails } from "@/types/tools/bash";
import type { TerminalDetails } from "@/types/tools/terminal";
import type { BrowserUseDetails } from "@/types/tools/browserUse";
import type { WebSearchDetails } from "@/types/tools/webSearch";
import type { StrReplaceEditorDetails } from "@/types/tools/strReplaceEditor";

function getBrowserUseDesc (details: BrowserUseDetails): { action: string, object: string } { 
  switch (details.action) {
    case "go_to_url":
      return { action: "正在浏览网页", object: details.url };
    case "click_element":
      return { action: "正在点击元素", object: "" };
    case "input_text":
      return { action: "正在输入文本", object: details.text };
    case "scroll_down":
      return { action: "正在向下滚动", object: details.scroll_amount?.toString() || "" };
    case "scroll_up":
      return { action: "正在向上滚动", object: details.scroll_amount?.toString() || "" };
    case "scroll_to_text":
      return { action: "正在滚动到文本", object: details.text };
    case "send_keys":
      return { action: "正在触发按键", object: details.keys };
    case "get_dropdown_options":
      return { action: "正在获取下拉选项", object: details.index.toString() };
    case "select_dropdown_option":
      return { action: "正在选择下拉选项", object: details.text };
    case "go_back":
      return { action: "正在返回上一页", object: "" };
    case "refresh":
      return { action: "正在刷新页面", object: "" };
    case "web_search":
      return { action: "正在页面中搜索", object: details.query };
    case "wait":
      return { action: "正在等待", object: ""};
    case "extract_content":
      return { action: "正在提取内容", object: details.goal };
    case "switch_tab":
      return { action: "正在切换标签页", object: details.tab_id.toString() };
    case "open_tab":
      return { action: "正在打开新标签页", object: details.url };
    case "close_tab":
      return { action: "正在关闭标签页", object: "" };
    default:
      return { action: "正在使用浏览器", object: "" };
  }
}

function getStrReplaceEditorDesc (details: StrReplaceEditorDetails): { action: string, object: string } {
  // 'view' | 'create' | 'str_replace' | 'insert' | 'undo_edit';
  switch (details.command) {
    case "view":
      return { action: "正在查看文件", object: details.view_range ? `${details.path} 的 ${details.view_range[0]} 到 ${details.view_range[1]} 行` : details.path };
    case "create":
      return { action: "正在创建文件", object: details.path };
    case "str_replace":
      return { action: "正在替换文件内容", object: details.path };
    case "insert":
      return { action: "正在插入内容", object: details.path };
    case "undo_edit":
      return { action: "正在撤销编辑", object: details.path };
    default:
      return { action: "正在使用文件编辑器", object: "" };
  }
}

export default function ToolDesc(
  {
    toolName,
    toolDetails
  }: {
    toolName: ToolName;
    toolDetails: ToolDetails;
  }
) {
  const [action, setAction] = useState<string>("");
  const [object, setObject] = useState<string>("");

  useEffect(() => {
    if (toolName === ToolName.Bash && toolDetails.bash) {
      const details: BashDetails = toolDetails.bash;
      setAction("正在执行命令");
      setObject(details.command);
    }
    if (toolName === ToolName.Terminal && toolDetails.terminal) {
      const details: TerminalDetails = toolDetails.terminal;
      setAction("正在执行命令");
      setObject(details.command);
    }
    if (toolName === ToolName.BrowserUseTool && toolDetails.browserUse) {
      const desc = getBrowserUseDesc(toolDetails.browserUse);
      setAction(desc.action);
      setObject(desc.object);
    }
    if (toolName === ToolName.StrReplaceEditor && toolDetails.strReplaceEditor) {
      const desc = getStrReplaceEditorDesc(toolDetails.strReplaceEditor);
      setAction(desc.action);
      setObject(desc.object);
    }
    if (toolName === ToolName.WebSearch && toolDetails.webSearch) {
      const details: WebSearchDetails = toolDetails.webSearch;
      setAction("正在进行网络搜索");
      setObject(details.query);
    }

  }, [toolName, toolDetails]);


  return <p className="flex items-center gap-2 font-subtle rounded-full w-full bg-[var(--gray-2)] px-2 py-0.5 overflow-hidden">
    <span className="font-subtle-medmiu whitespace-nowrap">{action}</span>
    <span className="inline-code text-ellipsis overflow-hidden whitespace-nowrap">{object}</span>
  </p>
};
