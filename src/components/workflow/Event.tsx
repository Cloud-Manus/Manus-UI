import { DisplayStep } from "@/pages/ChatPage"
import ThinkEvent from "./ThinkEvent"
import BaseEvent from "./BaseEvent"
import { EventType } from "@/types/workflow"
import ToolEvent from "./ToolEvent"
import TaskCompleteEvent from "./CompleteEvent"
import ErrorEvent from "./ErrorEvent"
import ChatEvent from "./ChatEvent"
import StatusEvent from "./StatusEvent"

type EventItemProps = {
  event: DisplayStep;
  selected: boolean;
  onOpenTool: () => void;
}

export default function Event({ event, selected, onOpenTool }: EventItemProps) {
  switch (event.type) {
    case EventType.think:
      return <ThinkEvent event={event} />
    case EventType.tool_used:
      return <ToolEvent event={event} isSelected={selected} onOpenTool={onOpenTool} />
    case EventType.task_complete:
      return <TaskCompleteEvent />
    case EventType.error:
      return <ErrorEvent event={event} />
    case EventType.chat:
      return <ChatEvent event={event} />
    case EventType.task_state_change:
      return <StatusEvent event={event} />
    default:
      return <BaseEvent event={event} />
  }
}
