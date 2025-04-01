
import { DisplayStep } from "@/pages/ChatPage"
import { EventType } from "@/types/workflow"

function getEventTitle(event: DisplayStep) {
  switch (event.type) {
    case EventType.chat:
      return "Chat"
    default:
      return event.type
  }
}

export default function BaseEvent({ event }: { event: DisplayStep }) {
  return <div className={"rounded-md border py-2 px-3"}>
    {event.type && <div className="font-large mb-2">{getEventTitle(event)}:</div>}
    <div className="font-subtle">
      {event.content}
    </div>
  </div>
}
