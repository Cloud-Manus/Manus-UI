import { DisplayStep } from "@/pages/ChatPage"
import ThinkEvent from "./ThinkEvent"
import BaseEvent from "./BaseEvent"
import { EventType, PlanStep } from "@/types/workflow"
import ToolEvent from "./ToolEvent"
import TaskCompleteEvent from "./CompleteEvent"
import ErrorEvent from "./ErrorEvent"
import ChatEvent from "./ChatEvent"
import StatusEvent from "./StatusEvent"
import PlanEvent from "./PlanEvent"

type EventItemProps = {
  event: DisplayStep;
  selected: boolean;
  onOpenTool: () => void;
  currentPlan?: { title: string, steps: PlanStep[] };
}

export default function Event({ event, selected, onOpenTool, currentPlan }: EventItemProps) {
  switch (event.type) {
    case EventType.think:
      return <ThinkEvent event={event} />
    case EventType.tool_used:
      return <ToolEvent event={event} isSelected={selected} onOpenTool={onOpenTool} />
    case EventType.task_complete:
      return <TaskCompleteEvent event={event} />
    case EventType.error:
      return <ErrorEvent event={event} />
    case EventType.chat:
      return <ChatEvent event={event} />
    case EventType.task_state_change:
      return <StatusEvent event={event} />
    case EventType.plan_update:
      return <PlanEvent event={event} currentPlan={currentPlan} />
    default:
      return <BaseEvent event={event} />
  }
}
