import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import Window from "../Window/Window";

interface StrReplaceEditorProps {
  toolDetails: StrReplaceEditorDetails;
}

const getLanguage = (path: string): string => {
  const extension = path.split(".").pop();
  switch (extension) {
    case "js":
      return "javascript";
    case "ts":
      return "typescript";
    case "py":
      return "python";
    case "sh":
      return "bash";
    case "html":
      return "html";
    case "css":
      return "css";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "txt":
      return "plaintext";
    case "xml":
      return "xml";
    case "yaml":
      return "yaml";
    case "yml":
      return "yaml";
    case "toml":
      return "toml";
    case "ini":
      return "ini";
    default:
      return "plaintext";
  }
};

export default function StrReplaceEditor({ toolDetails }: StrReplaceEditorProps) {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    // 确保DOM元素已经挂载
    if (editorContainerRef.current) {
      // 根据命令类型获取要显示的代码内容
      let codeContent = "";
      
      switch (toolDetails.command) {
        case "str_replace":
          codeContent = toolDetails.new_str || "";
          break;
        case "create":
          codeContent = toolDetails.file_text;
          break;
        case "insert":
          codeContent = toolDetails.new_str;
          break;
        case "view":
          codeContent = toolDetails.result?.output || "";
          break;
        default:
          codeContent = "";
      }

      // 创建编辑器实例
      editorRef.current = monaco.editor.create(editorContainerRef.current, {
        value: codeContent,
        language: getLanguage(toolDetails.path), // 可以根据文件类型自动检测语言
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
    const path = toolDetails.path;
    const parts = path.split("/");
    return parts[parts.length - 1];
  };

  return (
    <Window
      title={getFileName()}
      contentClassName="bg-[#1e1e1e]"
    >
      <div className="h-full py-3" ref={editorContainerRef}></div>
    </Window>
  );
}
