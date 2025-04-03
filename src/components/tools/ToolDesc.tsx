"use client";

import { useState, useEffect } from "react";
import { ToolName } from "@/types/workflow";

function getBrowserUseDesc (details: BrowserUseDetails): { action: string, object: string | React.ReactNode } { 
  switch (details.action) {
    case "go_to_url":
      return { action: "浏览网页", object: <a className="ml-1" href={details.url} target="_blank">{details.url}</a> };
    case "click_element":
      return { action: "点击元素", object: "" };
    case "input_text":
      return { action: "输入文本", object: details.text };
    case "scroll_down":
      return { action: "向下滚动", object: details.scroll_amount || "" };
    case "scroll_up":
      return { action: "向上滚动", object: details.scroll_amount || "" };
    case "scroll_to_text":
      return { action: "滚动到文本", object: details.text };
    case "send_keys":
      return { action: "触发按键", object: details.keys };
    case "get_dropdown_options":
      return { action: "获取下拉选项", object: details.index };
    case "select_dropdown_option":
      return { action: "选择下拉选项", object: <span>{details.index}：{details.text}</span> };
    case "go_back":
      return { action: "返回上一页", object: "" };
    case "refresh":
      return { action: "刷新页面", object: "" };
    case "web_search":
      return {
        action: `调用搜索引擎搜索「${details.query}」后，访问网页：`,
        object:details.result.url ? <a href={details.result.url} target="_blank">{details.result.url}</a> : ""
      };
    case "wait":
      return { action: "等待中", object: ""};
    case "extract_content":
      return { action: `提取内容：${details.goal}`, object: "" };
    case "switch_tab":
      return { action: "切换标签页", object: details.tab_id.toString() };
    case "open_tab":
      return { action: "打开新标签页", object: <a href={details.url} target="_blank">{details.url}</a> };
    case "close_tab":
      return { action: "关闭标签页", object: "" };
    default:
      return { action: "正在使用浏览器", object: "" };
  }
}

function getStrReplaceEditorDesc (details: StrReplaceEditorDetails): { action: string, object: string } {
  // 'view' | 'create' | 'str_replace' | 'insert' | 'undo_edit';
  switch (details.command) {
    case "view":
      return { action: "查看文件", object: details.view_range ? `${details.path} 的 ${details.view_range[0]} 到 ${details.view_range[1]} 行` : details.path };
    case "create":
      return { action: "创建文件", object: details.path };
    case "str_replace":
      return { action: "替换文件内容", object: details.path };
    case "insert":
      return { action: "插入内容", object: details.path };
    case "undo_edit":
      return { action: "撤销编辑", object: details.path };
    default:
      return { action: "使用文件编辑器", object: "" };
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
  const [object, setObject] = useState<string | React.ReactNode>("");

  useEffect(() => {
    if (toolName === ToolName.Bash && toolDetails.bash) {
      const details: BashDetails = toolDetails.bash;
      setAction("执行命令");
      setObject(details.command);
    }
    if (toolName === ToolName.Terminal && toolDetails.terminal) {
      const details: TerminalDetails = toolDetails.terminal;
      setAction("执行命令");
      setObject(details.command);
    }
    if (toolName === ToolName.BrowserUseTool && toolDetails.browser_use) {
      const desc = getBrowserUseDesc(toolDetails.browser_use);
      setAction(desc.action);
      setObject(desc.object);
    }
    if (toolName === ToolName.StrReplaceEditor && toolDetails.str_replace_editor) {
      const desc = getStrReplaceEditorDesc(toolDetails.str_replace_editor);
      setAction(desc.action);
      setObject(desc.object);
    }
    if (toolName === ToolName.WebSearch && toolDetails.web_search) {
      const details: WebSearchDetails = toolDetails.web_search;
      setAction("进行网络搜索");
      setObject(details.query);
    }

  }, [toolName, toolDetails]);


  return action ? (
    <p className="font-subtle-medium rounded-lg w-full bg-[var(--gray-2)] px-2 py-0.5 overflow-hidden break-all">
      {action}{" "}<span className="inline-code">{object}</span>
    </p>
  ) : null;
};
