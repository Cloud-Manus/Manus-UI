import { DisplayStep } from "@/pages/ChatPage";
import { MarkdownRenderer } from "@/components/ui/standard/markdown-renderer";
import { useMemo } from "react";

export default function TaskCompleteEvent({ event }: { event: DisplayStep }) {
  const result = useMemo(() => {
    if (event.result) {
      return event.result;
    }
    return event.content;
  }, [event]);

  if (event.terminated) {
    return <div className={"rounded-md border py-2 px-3"}>
      任务中止
    </div>
  }

  return (
    <div className="w-full max-w-[800px] relative rounded-lg p-[3px] overflow-hidden">
      {/* Rotating border container */}
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        {/* Larger gradient background that rotates */}
        <div 
          className="absolute w-[200vw] h-[200vh] animate-rotating-border origin-center"
          style={{
            background: 'conic-gradient(from 0deg, #8b5cf6, #ec4899, #ef4444, #eab308, #22c55e, #3b82f6, #8b5cf6)',
            inset: '-100vw -100vh',
          }}
        ></div>
      </div>
      {/* Content container */}
      <div className="relative bg-background rounded-md p-3 z-10">
        <p className="font-large mb-4">🎉 任务完成 🎉</p>
        {result && (
          <div className="font-subtle bg-[var(--gray-2)] rounded-md p-2">
            <div className="w-full scrollable overflow-hidden max-h-[700px]">
              <MarkdownRenderer>
                {result}
              </MarkdownRenderer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}