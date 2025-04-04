"use client";

import { useRef, useEffect } from "react";
import * as monaco from "monaco-editor";
import Window from "../Window/Window";
import { getCodeLanguage } from "@/lib/utils";

export default function FileSaver({ toolDetails }: { toolDetails: FileSaverDetails }) {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    // 确保DOM元素已经挂载
    if (editorContainerRef.current) {
      const codeContent = toolDetails.content;

      // 创建编辑器实例
      editorRef.current = monaco.editor.create(editorContainerRef.current, {
        value: codeContent,
        language: getCodeLanguage(toolDetails.file_path), // 可以根据文件类型自动检测语言
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

  // 获取文件名或路径名
  const getFileName = () => {
    const path = toolDetails.file_path;
    const parts = path.split("/");
    return parts[parts.length - 1];
  };
  return (
    <Window
      title={getFileName()}
      contentClassName="bg-[#1e1e1e]"
    >
      <div
        className="flex-1 overflow-auto px-4 py-3 scrollable thumb-[var(--dark-4)]"
      >
        <div className="h-full py-3" ref={editorContainerRef}></div>
      </div>
    </Window>
  );
} 