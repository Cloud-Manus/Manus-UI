import type { BrowserUseDetail } from "@/types/tools/browserUse";
import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import styles from "./BrowserUse.module.scss";

interface BrowserUseProps {
  toolDetails: BrowserUseDetail;
}

export default function BrowserUse({ toolDetails }: BrowserUseProps) {
  const resultContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    // 确保DOM元素已经挂载
    if (resultContainerRef.current) {
      // 获取操作结果
      const result = toolDetails.result?.output || "";

      // 创建编辑器实例来显示结果
      editorRef.current = monaco.editor.create(resultContainerRef.current, {
        value: result,
        language: "html", // 使用 HTML 语法高亮，因为浏览器操作通常返回 HTML
        theme: "vs-dark",
        automaticLayout: true,
        minimap: {
          enabled: true
        },
        readOnly: true,
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: "on",
      });

      // 清理函数
      return () => {
        editorRef.current?.dispose();
      };
    }
  }, [toolDetails]);

  // 获取操作类型的友好名称
  const getActionName = (action: string): string => {
    const actionMap: Record<string, string> = {
      go_to_url: "Navigate to URL",
      click_element: "Click Element",
      input_text: "Input Text",
      scroll_down: "Scroll Down",
      scroll_up: "Scroll Up",
      scroll_to_text: "Scroll to Text",
      send_keys: "Send Keys",
      get_dropdown_options: "Get Dropdown Options",
      select_dropdown_option: "Select Dropdown Option",
      go_back: "Go Back",
      web_search: "Web Search",
      wait: "Wait",
      extract_content: "Extract Content",
      switch_tab: "Switch Tab",
      open_tab: "Open Tab",
      close_tab: "Close Tab"
    };
    
    return actionMap[action] || action;
  };

  // 渲染操作参数
  const renderActionParams = () => {
    // 移除 action 字段，只显示参数
    const { action, ...params } = toolDetails;
    
    if (Object.keys(params).length === 0) {
      return <div className={styles.noParams}>No parameters</div>;
    }
    
    return (
      <div className={styles.paramsGrid}>
        {Object.entries(params).map(([key, value]) => {
          // 忽略 result 字段，它会在下面单独显示
          if (key === 'result') return null;
          
          return (
            <div key={key} className={styles.paramItem}>
              <div className={styles.paramName}>{key}:</div>
              <div className={styles.paramValue}>
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.browserUseWrapper}>
      <div className={styles.actionHeader}>
        <div className={styles.title}>Browser Action</div>
        <div className={styles.actionBadge}>{getActionName(toolDetails.action)}</div>
      </div>
      <div className={styles.paramsSection}>
        <div className={styles.sectionTitle}>Parameters</div>
        {renderActionParams()}
      </div>
      <div className={styles.resultHeader}>
        <div className={styles.title}>Action Result</div>
      </div>
      <div className={styles.resultContainer} ref={resultContainerRef}></div>
    </div>
  );
} 