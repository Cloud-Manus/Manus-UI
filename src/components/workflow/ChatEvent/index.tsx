import { DisplayStep } from "@/pages/ChatPage";

export default function ChatEvent({ event }: { event: DisplayStep }) {
  return <div className="flex flex-col gap-1 my-1">
    <span className="inline-code">🪄OpenManus:</span>
    <div className="font-p">{event.content}</div>
  </div>
}