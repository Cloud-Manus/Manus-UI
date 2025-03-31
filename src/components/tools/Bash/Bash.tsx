"use client";

import type { BashParams, BashResponse } from "@/types/tools/bash";
import Window from "../Window/Window";

interface BashProps {
  toolDetails: BashParams & BashResponse;
}

export default function Bash({ toolDetails }: BashProps) {
  // 格式化命令字符串，可以根据需要进行语法高亮等处理
  const formatCommand = (command: string) => {
    // 这里可以添加语法高亮或其他格式化逻辑
    return command;
  };

  return (
    <Window
      title="终端"
      badge={toolDetails.restart ? "重启终端" : undefined}
    >
      <div>
        <code><span className="text-[var(--green-4)] font-bold mr-2">ubuntu@OpenManus:~ $</span>{formatCommand(toolDetails.command)}</code>
        <code>{toolDetails.result}</code>
      </div>
    </Window>
  );
} 