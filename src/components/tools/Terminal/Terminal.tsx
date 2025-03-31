import type { TerminalParams } from "@/types/tools/terminal";
import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import styles from "./Terminal.module.scss";

interface TerminalProps {
  toolDetails: TerminalParams & { result?: { output: string } };
}

export default function Terminal({ toolDetails }: TerminalProps) {
  const resultContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    // 确保DOM元素已经挂载
    if (resultContainerRef.current) {
      // 获取命令执行结果，通常在 result.output 中
      const result = toolDetails.result?.output || "";

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

  return (
    <div className={styles.terminalWrapper}>
      <div className={styles.commandHeader}>
        <div className={styles.title}>Terminal Command</div>
      </div>
      <div className={styles.commandBox}>
        <code>{toolDetails.command}</code>
      </div>
      <div className={styles.resultHeader}>
        <div className={styles.title}>Command Output</div>
      </div>
      <div className={styles.resultContainer} ref={resultContainerRef}></div>
    </div>
  );
} 