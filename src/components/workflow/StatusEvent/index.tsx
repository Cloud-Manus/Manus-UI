import { cn } from "@/lib/utils"
import { DisplayStep } from "@/pages/ChatPage"
import { TaskState } from "@/types/workflow"

const baseClass = "rounded-full border py-1 px-3 font-subtle-medium"

export default function StatusEvent({ event }: { event: DisplayStep }) {
  if (event.task_status === TaskState.pending) {
    return <div className={cn(baseClass, "bg-[var(--gray-3)] text-[var(--dark-1)]")}>任务等待中</div>
  }
  if (event.task_status === TaskState.running) {
    return <div className={cn(baseClass, "bg-[var(--gray-3)] text-[var(--dark-1)]")}>任务运行中</div>
  }
  if (event.task_status === TaskState.completed) {
    return <div className={cn(baseClass, "bg-[var(--green-6)] text-[var(--green-2)]")}>任务完成</div>
  }
  if (event.task_status === TaskState.failed) {
    return <div className={cn(baseClass, "bg-[var(--red-6)] text-[var(--red-2)]")}>任务失败</div>
  }
  if (event.task_status === TaskState.terminated) {
    return <div className={cn(baseClass, "bg-[var(--red-6)] text-[var(--red-2)]")}>任务终止</div>
  }
}