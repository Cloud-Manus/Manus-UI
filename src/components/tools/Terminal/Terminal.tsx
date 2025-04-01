"use client";

import { BashDetails } from "@/types/tools/bash";
import Window from "../Window/Window";
import { TerminalDetails } from "@/types/tools/terminal";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <ScrollArea
        className="flex-1 overflow-hidden px-4 py-3"
        thumbBg="var(--dark-4)"
      >
        <code><span className="text-[var(--green-4)] font-bold mr-2">ubuntu@OpenManus:~ $</span>{formatCommand(toolDetails.command)}</code>
        <code>{toolDetails.result.output || toolDetails.result.system || toolDetails.result.error}</code>
      </ScrollArea>
    </Window>
  );
} 