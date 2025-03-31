import type { BashParams, BashResponse } from "@/types/tools/bash";
import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import styles from "./Bash.module.scss";

interface BashProps {
  toolDetails: BashParams & BashResponse;
}

export default function Bash({ toolDetails }: BashProps) {
  const resultContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    // 确保DOM元素已经挂载
    if (resultContainerRef.current) {
      // 获取命令执行结果
      const result = toolDetails.result || "";

      // 创建编辑器实例来显示结果
      editorRef.current = monaco.editor.create(resultContainerRef.current, {
        value: result,
        language: "shell", // 使用 shell 语法高亮
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

  // 格式化命令字符串，可以根据需要进行语法高亮等处理
  const formatCommand = (command: string) => {
    // 这里可以添加语法高亮或其他格式化逻辑
    return command;
  };

  return (
    <div className={styles.bashWrapper}>
      <div className={styles.commandHeader}>
        <div className={styles.title}>Bash Command</div>
        {toolDetails.restart && <div className={styles.restartBadge}>Restart Shell</div>}
      </div>
      <div className={styles.commandBox}>
        <code>{formatCommand(toolDetails.command)}</code>
      </div>
      <div className={styles.resultHeader}>
        <div className={styles.title}>Command Output</div>
      </div>
      <div className={styles.resultContainer} ref={resultContainerRef}></div>
    </div>
  );
} 