import { DisplayStep } from "@/pages/ChatPage"

export default function ErrorEvent({ event }: { event: DisplayStep }) {
  return <div className="rounded-full border py-1 px-2 bg-[var(--red-6)] text-[var(--red-2)]">
    <p className="font-p">发生错误: {event.content}</p>
  </div>
}