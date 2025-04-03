"use client";

import Window from "../Window/Window";

interface TerminalProps {
  toolDetails: TerminalDetails | BashDetails;
}

export default function Terminal({ toolDetails }: TerminalProps) {
  // 格式化命令字符串，可以根据需要进行语法高亮等处理
  const formatCommand = (command: string) => {
    // 这里可以添加语法高亮或其他格式化逻辑
    return command;
  };

  return (
    <Window
      title="终端"
      badge={(toolDetails as BashDetails).restart ? "重启终端" : undefined}
    >
      <div
        className="flex-1 overflow-auto px-4 py-3 scrollable thumb-[var(--dark-4)]"
      >
        <code><span className="text-[var(--green-4)] font-bold mr-2">ubuntu@OpenManus:~ $</span>{formatCommand(toolDetails.command)}</code>
        <code>{toolDetails.result.output || toolDetails.result.system || toolDetails.result.error}</code>
      </div>
    </Window>
  );
} 