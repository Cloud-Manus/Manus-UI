import { DisplayStep } from "@/pages/ChatPage"
import { PlanStep } from "@/types/workflow"
import { CircleCheckBig, CircleOff, Circle, CircleDot } from "lucide-react"
import { useMemo, useState, useEffect } from "react"

function getStepNode(step: PlanStep) {
  if (step.status === 'not_started') {
    return <span className="text-[var(--dark-2)] flex items-center"><Circle size={14} className="mr-1" />{step.title}</span>
  }
  if (step.status === 'in_progress') {
    return <span className="text-[var(--cyan-2)] flex items-center"><CircleDot size={14} className="mr-1" />{step.title}</span>
  }
  if (step.status === 'completed') {
    return <span className="text-[var(--green-2)] flex items-center"><CircleCheckBig size={14} className="mr-1" />{step.title}</span>
  }
  if (step.status === 'blocked') {
    return <span className="text-[var(--red-2)] flex items-center"><CircleOff size={14} className="mr-1" />{step.title}</span>
  }

  return 'text-[var(--gray-6)]'
}

export default function StatusEvent({
  event,
  currentPlan
}: {
  event: DisplayStep,
  currentPlan?: { title: string, steps: PlanStep[] }
}) {
  // 创建一个本地副本，只在组件初始化或event变化时更新
  const [planSnapshot, setPlanSnapshot] = useState<{ title: string, steps: PlanStep[] } | undefined>(undefined);
  
  // 当事件变更或首次加载时，创建currentPlan的副本
  useEffect(() => {
    if (currentPlan) {
      // 深拷贝计划数据
      const planCopy = {
        title: currentPlan.title,
        steps: currentPlan.steps.map(step => ({...step}))
      };
      setPlanSnapshot(planCopy);
    }
  }, [event.id]); // 仅依赖于event的ID，当事件变化时才更新

  const updateDesc = useMemo(() => {
    const details = event.tool_detail?.planning
    if (!details) {
      return '计划更新'
    }

    if (details.command === 'create') {
      return `创建计划【${details.title}】`
    }

    if (details.command === 'update') {
      return `更新计划【${planSnapshot?.title}】`
    }

    if (details.command === 'set_active') {
      return `切换到计划【${planSnapshot?.title}】`
    }

    if (details.command === 'mark_step') {
      let stepStatusDesc = ""
      switch (details.step_status) {
        case 'in_progress':
          stepStatusDesc = '正在进行'
          break
        case 'completed':
          stepStatusDesc = '已完成'
          break
        case 'blocked':
          stepStatusDesc = '已阻塞'
          break
        default:
          stepStatusDesc = ''
      }
      if (details.step_index !== undefined) {
        return `计划【${planSnapshot?.title}】的第 ${details.step_index + 1} 步${stepStatusDesc}`
      }
      return `计划【${planSnapshot?.title}】完成了一个步骤`
    }

    if (details.command === 'delete') {
      return `删除计划【${planSnapshot?.title}】`
    }

    return '计划更新'
  }, [event.tool_detail?.planning, planSnapshot]);

  return <div className={"rounded-md border py-2 px-3"}>
    <div className="font-subtle-medium mb-2">{updateDesc}</div>
    {planSnapshot &&
      <div className="font-subtle">
        <ul className="flex flex-col gap-1">
          {planSnapshot.steps.map((step) => (
            <li key={step.id}>{getStepNode(step)}</li>
          ))}
        </ul>
      </div>
    }
  </div>
}