import type { PlanningParams, PlanningResponse } from "@/types/tools/planning";
import styles from "./Planning.module.scss";

interface PlanningProps {
  toolDetails: PlanningParams & PlanningResponse;
}

export default function Planning({ toolDetails }: PlanningProps) {
  // 获取命令的友好名称
  const getCommandName = (command: string): string => {
    const commandMap: Record<string, string> = {
      create: "Create Plan",
      update: "Update Plan",
      list: "List Plans",
      get: "Get Plan",
      set_active: "Set Active Plan",
      mark_step: "Mark Step",
      delete: "Delete Plan"
    };
    
    return commandMap[command] || command;
  };

  // 获取步骤状态的友好名称和样式类
  const getStepStatusInfo = (status?: string) => {
    if (!status) return { name: "Unknown", className: styles.statusUnknown };
    
    const statusMap: Record<string, { name: string; className: string }> = {
      not_started: { name: "Not Started", className: styles.statusNotStarted },
      in_progress: { name: "In Progress", className: styles.statusInProgress },
      completed: { name: "Completed", className: styles.statusCompleted },
      blocked: { name: "Blocked", className: styles.statusBlocked }
    };
    
    return statusMap[status] || { name: status, className: styles.statusUnknown };
  };

  // 渲染计划步骤（如果有）
  const renderSteps = () => {
    if (!toolDetails.steps || toolDetails.steps.length === 0) {
      return <div className={styles.noSteps}>No steps defined</div>;
    }
    
    return (
      <div className={styles.stepsList}>
        {toolDetails.steps.map((step, index) => {
          // 确定是否为当前正在更新的步骤
          const isCurrentStep = toolDetails.step_index === index;
          const stepStatus = isCurrentStep ? toolDetails.step_status : undefined;
          const { name: statusName, className: statusClass } = getStepStatusInfo(stepStatus);
          
          return (
            <div 
              key={index} 
              className={`${styles.stepItem} ${isCurrentStep ? styles.currentStep : ''}`}
            >
              <div className={styles.stepNumber}>{index + 1}</div>
              <div className={styles.stepContent}>
                <div className={styles.stepText}>{step}</div>
                {isCurrentStep && stepStatus && (
                  <div className={`${styles.stepStatus} ${statusClass}`}>
                    {statusName}
                  </div>
                )}
                {isCurrentStep && toolDetails.step_notes && (
                  <div className={styles.stepNotes}>{toolDetails.step_notes}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 渲染命令结果
  const renderResult = () => {
    if (!toolDetails.result || !toolDetails.result.output) {
      return <div className={styles.noResult}>No result available</div>;
    }
    
    return (
      <div className={styles.resultOutput}>
        <pre>{toolDetails.result.output}</pre>
      </div>
    );
  };

  return (
    <div className={styles.planningWrapper}>
      <div className={styles.commandHeader}>
        <div className={styles.title}>Planning Tool</div>
        <div className={styles.commandBadge}>{getCommandName(toolDetails.command)}</div>
      </div>
      
      {toolDetails.plan_id && (
        <div className={styles.planInfo}>
          <div className={styles.planId}>
            <span className={styles.label}>Plan ID:</span> {toolDetails.plan_id}
          </div>
          {toolDetails.title && (
            <div className={styles.planTitle}>
              <span className={styles.label}>Title:</span> {toolDetails.title}
            </div>
          )}
        </div>
      )}
      
      {(toolDetails.steps || toolDetails.step_index !== undefined) && (
        <div className={styles.stepsSection}>
          <div className={styles.sectionTitle}>Plan Steps</div>
          {renderSteps()}
        </div>
      )}
      
      <div className={styles.resultHeader}>
        <div className={styles.title}>Command Result</div>
      </div>
      <div className={styles.resultContainer}>
        {renderResult()}
      </div>
    </div>
  );
} 