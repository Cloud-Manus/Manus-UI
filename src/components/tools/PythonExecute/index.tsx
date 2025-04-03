"use client";

import { useRef, useEffect } from "react";
import * as monaco from "monaco-editor";
import Window from "../Window/Window";

interface TerminalProps {
  toolDetails: PythonExecuteDetails;
}

export default function Terminal({ toolDetails }: TerminalProps) {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    // 确保DOM元素已经挂载
    if (editorContainerRef.current) {
      // 创建编辑器实例
      editorRef.current = monaco.editor.create(editorContainerRef.current, {
        value: toolDetails.code,
        language: "python", // 可以根据文件类型自动检测语言
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
    <Window
      title="Python 执行器"
    >
      <div className="h-full py-3" ref={editorContainerRef}></div>
    </Window>
  );
} 