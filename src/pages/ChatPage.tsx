import { useState, useEffect, useCallback, FormEvent, useRef, ChangeEvent, DragEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { SendIcon, UploadIcon, DownloadIcon, StopCircleIcon, PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import apiService from '../services/api';
import styles from './ChatPage.module.scss';
import ToolsWrapper from '../components/tools/ToolsWrapper';
import type { ToolDetails } from '../types/tools/base';
import { ToolName } from '../types/tools/base';
import { EventType } from '@/types/workflow';
import type { StrReplaceEditorDetails } from '@/types/tools/strReplaceEditor';
import type { BrowserUseDetails } from '@/types/tools/browserUse';
import type { TerminalDetails } from '@/types/tools/terminal';
import type { WebSearchDetails } from '@/types/tools/webSearch';
import type { CreateChatCompletionDetails } from '@/types/tools/createChatComopletion';
import type { PlanningDetails } from '@/types/tools/planning';
import type { TerminateDetails } from '@/types/tools/terminate';
import { BashDetails } from '@/types/tools/bash';

// 导入新的类型定义，但使用字符串字面量而不是枚举
// 这样可以避免 TypeScript 类型推断中的一些问题
type EventTypeString = 
  | 'task_start' | 'task_complete' | 'task_state_change'
  | 'thinking' | 'chat' | 'step'
  | 'tool_select' | 'tool_execute' | 'tool_completed'
  | 'error' | 'update_token_count';

// 定义重放状态类型
type ReplayState = 'idle' | 'playing' | 'paused';

// 定义一个简化的工作流事件类型，避免使用复杂的联合类型
type SimpleWorkflowEvent = {
  id: string;
  type: EventTypeString;
  step: number;
  content: string;
  timestamp: number;
  // 工具事件相关字段
  tool?: string;
  toolStatus?: 'executing' | 'success' | 'fail'; // 修改为与 WorkflowToolEvent 一致，从 'failed' 改为 'fail'
  toolDetails?: ToolDetails; // 与 workflow.ts 中的 WorkflowToolEvent.toolDetails 字段兼容
  toolsSelected?: ToolName[]; // 与 workflow.ts 中的 WorkflowToolEvent.toolsSelected 字段兼容
  // 任务事件相关字段
  agentStatus?: string;
  request?: string;
  results?: string[];
  curStep?: number; // 与 workflow.ts 中的 WorkflowTaskEvent.curStep 字段兼容
  // 聊天事件相关字段
  sender?: 'user' | 'assistant' | 'system';
  // 错误事件相关字段
  error?: string;
  // 令牌计数事件相关字段
  tokenCount?: number;
};

// 定义一个简化的工作流类型
type SimpleWorkflow = {
  id: string;
  prompt: string;
  createdAt: number;
  finishedAt?: number;
  events: SimpleWorkflowEvent[];
};

// 定义一个新的类型用于显示用途
type DisplayStep = {
  step: number;
  content: string;
  type: string;
  toolName?: string;
  toolStatus?: string;
};

const ChatPage = () => {
  const [prompt, setPrompt] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [events, setEvents] = useState<DisplayStep[]>([]);
  const [status, setStatus] = useState<string>('');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [recordedEvents, setRecordedEvents] = useState<SimpleWorkflowEvent[]>([]);
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const [isTerminating, setIsTerminating] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [replayState, setReplayState] = useState<ReplayState>('idle');
  const [allReplaySteps, setAllReplaySteps] = useState<DisplayStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(0); // 保留此状态，但现在直接使用步骤数组长度
  
  // 使用useRef存储当前的重放状态，防止闭包问题
  const replayStateRef = useRef<ReplayState>('idle');
  
  // 使用useRef存储步骤数组，避免状态更新延迟问题
  const stepsArrayRef = useRef<DisplayStep[]>([]);
  
  // 用于存储原始的工作流数据
  const currentWorkflow = useRef<SimpleWorkflow | null>(null);
  
  const [currentToolName, setCurrentToolName] = useState<ToolName | null>(null);
  const [currentToolDetails, setCurrentToolDetails] = useState<ToolDetails | null>(null);
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null);
  
  // 同步replayState的变化到ref
  useEffect(() => {
    replayStateRef.current = replayState;
  }, [replayState]);
  
  // 同步allReplaySteps的变化到ref
  useEffect(() => {
    stepsArrayRef.current = allReplaySteps;
  }, [allReplaySteps]);
  
  // 类型保护函数：检查是否是工具事件
  const isToolEvent = (event: SimpleWorkflowEvent): boolean => {
    return event.type === 'tool_select' || 
           event.type === 'tool_execute' || 
           event.type === EventType.tool_completed;
  };

  // 辅助函数：将 SimpleWorkflowEvent 转换为 DisplayStep
  const convertToDisplayStep = (event: SimpleWorkflowEvent): DisplayStep => {
    // 基本转换
    const displayStep: DisplayStep = {
      step: event.step,
      content: event.content,
      type: event.type
    };
    
    // 根据事件类型添加额外信息
    if (isToolEvent(event)) {
      if (event.tool) {
        displayStep.toolName = String(event.tool);
      }
      if (event.toolStatus) {
        displayStep.toolStatus = event.toolStatus;
      }
    }
    
    return displayStep;
  };
  
  // 辅助函数：更新工具可视化状态
  const updateToolVisualization = useCallback((toolName: ToolName, details: ToolDetails) => {
    // 自动展开侧边栏
    if (!expanded) {
      setExpanded(true);
    }
    
    // 更新工具状态
    setCurrentToolName(toolName);
    setCurrentToolDetails(details);
  }, [expanded]);
  
  // 处理事件点击：显示工具可视化
  const handleEventClick = (event: DisplayStep, index: number) => {
    // 只处理工具完成事件
    if (event.type !== EventType.tool_completed || !event.toolName) {
      return;
    }
    
    // 设置选中的事件索引
    setSelectedEventIndex(index);
    
    // 查找原始事件以获取完整的工具详情
    if (currentWorkflow.current) {
      const originalEvent = currentWorkflow.current.events.find(
        e => e.type === EventType.tool_completed && e.step === event.step
      );
      
      if (originalEvent && originalEvent.tool && originalEvent.toolDetails) {
        // 更新工具可视化，优先使用 toolDetails，如果没有则回退到 detail
        const details = originalEvent.toolDetails || {};
        updateToolVisualization(originalEvent.tool as ToolName, details);
      }
    } else {
      // 对于实时事件（非回放），可以从记录的事件中查找
      const originalEvent = recordedEvents.find(
        e => e.type === EventType.tool_completed && e.step === event.step
      );
      
      if (originalEvent && originalEvent.tool && originalEvent.toolDetails) {
        // 更新工具可视化，优先使用 toolDetails，如果没有则回退到 detail
        const details = originalEvent.toolDetails || {};
        updateToolVisualization(originalEvent.tool as ToolName, details);
      }
    }
  };
  
  // 添加重置函数
  const resetChat = () => {
    setCurrentTaskId(null);
    setEvents([]);
    setStatus('');
    setPrompt('');
    setRecordedEvents([]);
    setReplayState('idle');
    replayStateRef.current = 'idle';
    setAllReplaySteps([]);
    stepsArrayRef.current = [];
    setCurrentStepIndex(0);
    setTotalSteps(0);
    setCurrentToolName(null);
    setCurrentToolDetails(null);
    setSelectedEventIndex(null);
  };
  
  // 添加终止任务的处理函数
  const handleTerminateTask = async () => {
    if (!currentTaskId) return;
    
    try {
      setIsTerminating(true);
      await apiService.terminateTask(currentTaskId);
      // 终止后不需要做额外操作，因为服务器会通过SSE通知状态变化
      console.log(`Task ${currentTaskId} termination requested`);
    } catch (error) {
      console.error('Failed to terminate task:', error);
      setIsTerminating(false);
    }
  };
  
  const createTaskMutation = useMutation({
    mutationFn: apiService.createTask,
    onSuccess: (data) => {
      setCurrentTaskId(data.task_id);
      setEvents([]);
      setStatus('running');
      // 清空之前的记录，准备记录新任务的事件
      setRecordedEvents([]);
    },
  });

  useEffect(() => {
    if (!currentTaskId || isReplaying) return;

    // Set up SSE connection
    const eventSource = apiService.createTaskEventSource(currentTaskId);
    
    // 辅助函数：处理基本事件类型（thinking, step, chat, tool_select, tool_execute）
    const handleBasicEvent = (data: SimpleWorkflowEvent) => {
      // 创建新的展示步骤
      const newStep: DisplayStep = {
        step: data.step,
        content: data.content,
        type: data.type
      };
      
      // 对于工具事件，添加额外信息
      if (isToolEvent(data)) {
        newStep.toolName = data.tool;
        newStep.toolStatus = data.toolStatus;
      }
      
      // 更新事件列表
      setEvents(prev => [...prev, newStep]);
    };
    
    // 辅助函数：处理工具完成事件
    const handleToolCompletedEvent = (data: SimpleWorkflowEvent) => {
      if (data.tool && data.toolDetails) {
        // 更新工具可视化，优先使用 toolDetails，如果没有则回退到 detail
        const details = data.toolDetails || {};
        updateToolVisualization(data.tool as ToolName, details);
      }
      
      // 创建新的展示步骤
      const newStep: DisplayStep = {
        step: data.step,
        content: data.content,
        type: data.type,
        toolName: data.tool,
        toolStatus: data.toolStatus
      };
      
      // 更新事件列表
      setEvents(prev => [...prev, newStep]);
    };
    
    // 辅助函数：处理任务状态事件
    const handleTaskStateEvent = (data: SimpleWorkflowEvent) => {
      if (!data.agentStatus) return;
      
      const statusMap: Record<string, string> = {
        'IDLE': 'idle',
        'RUNNING': 'running',
        'FINISHED': 'completed',
        'ERROR': 'failed'
      };
      setStatus(statusMap[data.agentStatus] || data.agentStatus);
      
      // 如果任务完成或出错，重置终止中状态
      if (data.agentStatus === 'FINISHED' || data.agentStatus === 'ERROR') {
        setIsTerminating(false);
      }
    };
    
    // 辅助函数：处理从 SSE 接收的事件
    const handleWorkflowEvent = (event: MessageEvent) => {
      try {
        // 将事件解析为 SimpleWorkflowEvent
        const data = JSON.parse(event.data) as SimpleWorkflowEvent;
        
        // 记录事件
        setRecordedEvents(prev => [...prev, data]);
        
        // 根据事件类型进行处理
        switch (data.type) {
          case EventType.task_start:
          case EventType.task_state_change:
          case EventType.task_complete:
            handleTaskStateEvent(data);
            break;
            
          case EventType.tool_completed:
            handleToolCompletedEvent(data);
            break;
            
          case EventType.thinking:
          case EventType.step:
          case EventType.chat:
          case EventType.tool_select:
          case EventType.tool_execute:
            handleBasicEvent(data);
            break;
            
          case 'error':
            // 处理错误事件
            setStatus('failed');
            console.error('Workflow error:', data.error);
            setIsTerminating(false);
            break;
            
          case 'update_token_count':
            // 处理 token 计数更新
            if (data.tokenCount) {
              console.log('更新 token 计数:', data.tokenCount);
              // 这里可以添加显示 token 计数的逻辑
            }
            break;
        }
      } catch (error) {
        console.error('Error processing SSE event:', error);
      }
    };
    
    // 设置 SSE 事件监听器
    eventSource.onmessage = handleWorkflowEvent;
    
    // 兼容性处理：监听特定事件类型
    eventSource.addEventListener('message', handleWorkflowEvent);
    
    // 监听完成事件单独处理
    eventSource.addEventListener('complete', (e) => {
      if (e instanceof MessageEvent) {
        try {
          const data = JSON.parse(e.data) as SimpleWorkflowEvent;
          // 记录事件
          setRecordedEvents(prev => [...prev, data]);
          
          // 设置状态为完成
          setStatus('completed');
          
          // 触发下载记录
          setTimeout(() => {
            downloadRecordedEvents();
          }, 500);
        } catch (error) {
          console.error('Error processing complete event:', error);
        }
      }
      eventSource.close();
    });
    
    // 清理函数
    return () => {
      eventSource.close();
    };
  }, [currentTaskId, navigate, isReplaying, expanded]);

  // 下载记录的事件为JSON文件
  const downloadRecordedEvents = () => {
    if (recordedEvents.length === 0) return;
    
    // 创建一个完整的 Workflow 对象
    const workflow: SimpleWorkflow = {
      id: currentTaskId || 'unknown',
      prompt: prompt,
      createdAt: Date.now(),
      events: recordedEvents
    };
    
    console.log('准备下载的数据:', workflow);
    const jsonData = JSON.stringify(workflow, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workflow-${workflow.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('记录已下载，文件大小:', Math.round(blob.size / 1024), 'KB');
  };

  // 处理文件拖放
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        processUploadedFile(file);
      } else {
        alert('请上传JSON格式的任务记录文件');
      }
    }
  };
  
  // 处理文件上传
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    processUploadedFile(file);
    
    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // 处理上传的文件
  const processUploadedFile = (file: File) => {
    console.log('开始处理上传文件:', file.name, file.size);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        console.log('文件内容长度:', content.length);
        
        // 尝试将内容解析为 Workflow 对象
        const workflow = JSON.parse(content) as SimpleWorkflow;
        console.log('解析后的工作流:', workflow);
        
        // 验证数据格式
        if (!workflow.events || !Array.isArray(workflow.events)) {
          alert('文件格式错误：缺少有效的事件数组');
          return;
        }
        
        if (workflow.events.length === 0) {
          alert('文件内容为空，没有可重放的事件');
          return;
        }
        
        // 重置重放控制状态
        setReplayState('idle');
        replayStateRef.current = 'idle';
        
        // 清空当前状态
        setCurrentTaskId(null);
        setEvents([]);
        
        // 设置 prompt 值，这样用户可以看到原始请求
        setPrompt(workflow.prompt || '');
        
        // 保存工作流数据
        currentWorkflow.current = workflow;
        
        // 提取所有显示步骤
        const displaySteps = workflow.events
          .filter(event => [
            'thinking', 'step', 'chat', 
            'tool_select', 'tool_execute', EventType.tool_completed
          ].includes(event.type))
          .map(convertToDisplayStep);
        
        setAllReplaySteps(displaySteps);
        stepsArrayRef.current = displaySteps;
        setTotalSteps(displaySteps.length);
        setCurrentStepIndex(0);
        
        // 显示上传成功提示
        alert(`成功加载 ${file.name}，即将开始重放`);
        
        // 开始重放事件
        startReplay(workflow.events);
      } catch (error) {
        console.error('解析JSON文件错误:', error);
        alert(`无法解析JSON文件：${error instanceof Error ? error.message : '未知错误'}`);
      }
    };
    
    reader.onerror = (error) => {
      console.error('读取文件错误:', error);
      alert('读取文件时发生错误');
    };
    
    reader.readAsText(file);
  };

  // 重放记录的事件
  const startReplay = (events: SimpleWorkflowEvent[]) => {
    console.log('开始重放事件，事件数量:', events.length);
    
    // 设置重放状态
    setIsReplaying(true);
    
    // 确保设置一个有效的状态，即使文件中没有状态事件
    if (!status) {
      setStatus('replaying');
    }
    
    // 提取显示步骤
    const displaySteps = events
      .filter(event => [
        'thinking', 'step', 'chat', 
        'tool_select', 'tool_execute', 'tool_completed',
      ].includes(event.type))
      .map(convertToDisplayStep);
    
    if (displaySteps.length > 0) {
      // 保存所有步骤用于控制
      setAllReplaySteps(displaySteps);
      stepsArrayRef.current = displaySteps;
      setTotalSteps(displaySteps.length);
      
      // 清空当前显示
      setEvents([]);
      setCurrentStepIndex(0);
      
      // 重置工具状态
      setCurrentToolName(null);
      setCurrentToolDetails(null);
      setSelectedEventIndex(null);
      
      // 先设置重放状态为播放
      setReplayState('playing');
      replayStateRef.current = 'playing';
      
      // 显示第一个步骤
      handleSeekToStep(0, displaySteps);
      
      // 开始播放
      playFromCurrentStep(displaySteps, 0);
    } else {
      console.error('没有找到可用的步骤信息');
      alert('无法重放：未找到步骤信息');
      setIsReplaying(false);
      setStatus('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    // 重置重放状态
    setIsReplaying(false);
    setReplayState('idle');
    replayStateRef.current = 'idle';
    setAllReplaySteps([]);
    setCurrentStepIndex(0);
    setTotalSteps(0);
    
    createTaskMutation.mutate(prompt);
  };

  // Helper function to get status badge
  const getStatusBadge = () => {
    if (!status) return null;
    
    const variants: Record<string, string> = {
      running: 'bg-blue-500',
      completed: 'bg-green-500',
      failed: 'bg-red-500',
      error: 'bg-red-500',
      pending: 'bg-yellow-500'
    };
    
    const variant = status.startsWith('failed') 
      ? variants.failed 
      : variants[status] || variants.pending;
    
    return (
      <Badge className={variant}>
        {status === 'running' ? 'Processing' : status}
        {isReplaying && ' (Replay)'}
      </Badge>
    );
  };

  // 修改 renderEvent 函数，确保样式正确应用
  const renderEvent = (event: DisplayStep, index: number) => {
    // 确定是否是可点击的事件（工具完成事件）
    const isClickable = event.type === EventType.tool_completed && event.toolName;
    
    // 确定是否是当前选中的事件
    const isSelected = selectedEventIndex === index;
    
    // 创建点击处理函数
    const handleClick = isClickable 
      ? () => handleEventClick(event, index) 
      : undefined;
    
    switch (event.type) {
      case EventType.thinking:
        return (
          <div className={`rounded-md border py-2 px-3`}>
            <div className={styles.eventTitle}>Thinking:</div>
            <div className={styles.eventContent}>{event.content}</div>
          </div>
        );
      case EventType.tool_select:
      case EventType.tool_execute:
        return (
          <div
            className={`rounded-md border py-2 px-3 ${isClickable ? styles.clickable : ''} ${isSelected ? styles.selected : ''}`}
            onClick={handleClick}
            role={isClickable ? "button" : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onKeyDown={isClickable ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleClick?.();
              }
            } : undefined}
          >
            <div className="flex items-center">
              <span className="font-p-medium mr-2">Using tool:</span>
              {event.toolName && <span className="inline-code mr-2">{event.toolName}</span>}
            </div>
            {event.content && <div className="font-subtle">{event.content}</div>}
          </div>
        );
      case EventType.tool_completed:
        return (
          <div
            className={`rounded-full border py-2 px-3 bg-white ${isClickable ? styles.clickable : ''} ${isSelected ? styles.selected : ''} overflow-hidden`}
            onClick={handleClick}
            role={isClickable ? "button" : undefined}
          >
            <span className="font-p-medium mr-2">Using tool:</span>
            {event.toolName && <span className="inline-code mr-2">{event.toolName}</span>}
            {/* {event.content && <span className="font-subtle overflow-hidden text-ellipsis whitespace-nowrap">{event.content}</span>} */}
          </div>
        )
      case EventType.chat:
        return (
          <div className={"rounded-md border py-2 px-3"}>
            <div className={styles.eventTitle}>Chat:</div>
            <div className={styles.eventContent}>{event.content}</div>
          </div>
        );
      case 'step':
        return (
          <div className={"rounded-md border py-2 px-3"}>
            <div className={styles.eventTitle}>Step:</div>
            <div className={styles.eventContent}>{event.content}</div>
          </div>
        );
      default:
        return (
          <div className={"rounded-md border py-2 p-3"}>
            <div className={styles.eventContent}>{event.content}</div>
          </div>
        );
    }
  };

  // 处理重放控制
  const handleReplayControl = (action: string) => {
    console.log('重放控制动作:', action, '当前状态:', replayState, '实时状态:', replayStateRef.current);
    
    switch (action) {
      case 'play':
        // 同时设置React状态和ref，确保实时反映
        setReplayState('playing');
        replayStateRef.current = 'playing';
        
        // 使用ref存储的步骤数组，避免状态更新延迟问题
        if (stepsArrayRef.current.length > 0) {
          playFromCurrentStep(stepsArrayRef.current, currentStepIndex);
        } else if (allReplaySteps.length > 0) {
          playFromCurrentStep(allReplaySteps, currentStepIndex);
        } else {
          console.error('无法播放: 步骤数组为空');
          setReplayState('paused');
          replayStateRef.current = 'paused';
        }
        break;
      case 'pause':
        // 同时设置状态和ref，确保实时反映
        setReplayState('paused');
        replayStateRef.current = 'paused';
        break;
      case 'previous':
        // 只有在暂停状态且不是第一步时才能后退
        if (replayStateRef.current !== 'playing' && currentStepIndex > 0) {
          handleSeekToStep(currentStepIndex - 1, stepsArrayRef.current.length > 0 ? stepsArrayRef.current : allReplaySteps);
        }
        break;
      case 'next':
        // 只有在暂停状态且不是最后一步时才能前进
        if (replayStateRef.current !== 'playing' && currentStepIndex < stepsArrayRef.current.length - 1) {
          handleSeekToStep(currentStepIndex + 1, stepsArrayRef.current);
        }
        break;
      default:
        break;
    }
  };

  // 修改跳转到指定步骤函数，增强对 tool_completed 事件的处理
  const handleSeekToStep = useCallback((stepIndex: number, stepsArray?: DisplayStep[]) => {
    // 使用传入的步骤数组或状态中的数组
    const stepsToUse = stepsArray || allReplaySteps;
    
    console.log('跳转到步骤:', stepIndex, '步骤数组长度:', stepsToUse.length);
    
    // 检查步骤索引是否有效
    if (stepIndex < 0 || stepIndex >= stepsToUse.length) {
      console.warn('无效的步骤索引:', stepIndex, '可用步骤数:', stepsToUse.length);
      return;
    }
    
    // 设置当前步骤索引
    setCurrentStepIndex(stepIndex);
    
    // 确保步骤数组有内容
    if (stepsToUse.length === 0) {
      console.warn('重放步骤为空，无法跳转');
      return;
    }
    
    // 显示到当前步骤为止的所有步骤
    const visibleSteps = stepsToUse.slice(0, stepIndex + 1);
    
    // 提取最新步骤
    const latestStep = stepsToUse[stepIndex];
    
    // 检查是否有工具完成事件
    const toolCompletedEvents = visibleSteps.filter(
      step => step.type === EventType.tool_completed && step.toolName
    );
    
    // 如果有工具完成事件，使用最后一个更新工具可视化
    if (toolCompletedEvents.length > 0) {
      const lastToolEvent = toolCompletedEvents[toolCompletedEvents.length - 1];
      
      // 设置选中的事件索引
      const eventIndex = visibleSteps.findIndex(step => 
        step.step === lastToolEvent.step && step.type === EventType.tool_completed
      );
      if (eventIndex !== -1) {
        setSelectedEventIndex(eventIndex);
      }
      
      // 查找原始事件以获取完整的工具详情
      if (currentWorkflow.current) {
        const originalEvent = currentWorkflow.current.events.find(
          e => e.type === EventType.tool_completed && e.step === lastToolEvent.step
        );
        
        if (originalEvent && originalEvent.tool && originalEvent.toolDetails) {
          // 更新工具可视化，优先使用 toolDetails，如果没有则回退到 detail
          const details = originalEvent.toolDetails || {};
          updateToolVisualization(originalEvent.tool as ToolName, details);
        }
      }
    }
    
    // 处理 tool_execute 类型的事件（保留原有逻辑）
    if (latestStep && latestStep.type === EventType.tool_execute && latestStep.toolName && currentWorkflow.current) {
      // 查找原始事件以获取完整的工具详情
      const originalEvent = currentWorkflow.current.events.find(
        e => e.type === EventType.tool_execute && e.step === latestStep.step
      );
      
      if (originalEvent && originalEvent.tool && originalEvent.toolDetails) {
        // 更新工具可视化，优先使用 toolDetails，如果没有则回退到 detail
        const details = originalEvent.toolDetails || {};
        updateToolVisualization(originalEvent.tool as ToolName, details);
      }
    }
    
    // 强制重新渲染事件列表
    console.log(`更新事件列表，显示 ${visibleSteps.length} 个事件，当前索引: ${stepIndex}`);
    setEvents([...visibleSteps]); // 使用新数组引用强制更新
    
    console.log('已跳转到步骤:', stepIndex, '显示步骤数:', visibleSteps.length);
  }, [allReplaySteps, currentWorkflow]);
  
  // 从当前步骤开始播放
  const playFromCurrentStep = useCallback((stepsArray?: DisplayStep[], currentIndex?: number) => {
    // 使用传入的步骤数组或状态中的数组
    const stepsToUse = stepsArray || allReplaySteps;
    
    // 使用传入的当前索引或状态中的索引
    const currentIdx = currentIndex !== undefined ? currentIndex : currentStepIndex;
    
    console.log('开始播放，当前步骤:', currentIdx, '步骤数组长度:', stepsToUse.length, '播放状态:', replayStateRef.current);
    
    // 如果步骤信息不完整，退出
    if (stepsToUse.length === 0) {
      console.warn('重放步骤为空，无法播放');
      setReplayState('paused');
      replayStateRef.current = 'paused';
      return;
    }
    
    // 如果已经到最后一步，停止播放
    if (currentIdx >= stepsToUse.length - 1) {
      console.log('已到达最后步骤，停止播放');
      setReplayState('paused');
      replayStateRef.current = 'paused';
      return;
    }
    
    // 如果不是播放状态，不进行下一步
    if (replayStateRef.current !== 'playing') {
      console.log('当前重放状态不是playing，不进行下一步, 实时状态:', replayStateRef.current);
      return;
    }
    
    // 显示下一个步骤
    const nextStepIndex = currentIdx + 1;
    
    // 确保下一步索引有效
    if (nextStepIndex >= stepsToUse.length) {
      console.warn('下一步索引超出范围:', nextStepIndex, '可用步骤:', stepsToUse.length);
      setReplayState('paused');
      replayStateRef.current = 'paused';
      return;
    }
    
    // 更新步骤索引
    setCurrentStepIndex(nextStepIndex);
    
    // 更新显示的步骤，强制重新渲染
    const visibleSteps = stepsToUse.slice(0, nextStepIndex + 1);
    console.log(`播放更新事件列表，显示 ${visibleSteps.length} 个事件，当前索引: ${nextStepIndex}`);
    setEvents([...visibleSteps]);
    
    console.log('播放到步骤:', nextStepIndex, '剩余步骤:', stepsToUse.length - nextStepIndex - 1);
    
    // 如果还有更多步骤，继续播放
    if (nextStepIndex < stepsToUse.length - 1) {
      // 使用计时器继续播放
      setTimeout(() => {
        // 重新检查当前播放状态，如果仍为playing则继续播放
        if (replayStateRef.current === 'playing') {
          // 继续传递步骤数组和下一步索引，避免使用React状态
          playFromCurrentStep(stepsToUse, nextStepIndex);
        }
      }, 800); // 控制播放速度
    } else {
      // 播放到最后一步时暂停
      console.log('已播放完所有步骤');
      setReplayState('paused');
      replayStateRef.current = 'paused';
    }
  }, [allReplaySteps, currentStepIndex]);
  
  // 修改停止重放函数，确保也重置选中的事件
  const handleStopReplay = () => {
    setIsReplaying(false);
    setReplayState('idle');
    replayStateRef.current = 'idle';
    setAllReplaySteps([]);
    stepsArrayRef.current = [];
    setCurrentStepIndex(0);
    setTotalSteps(0);
    setEvents([]);
    setStatus('');
    setCurrentToolName(null);
    setCurrentToolDetails(null);
    setSelectedEventIndex(null);
  };

  return (
    <div className={`h-full flex flex-col gap-4 w-full ${expanded ? '' : 'max-w-[1080px] mx-auto'}`}>
      <div className={`${styles.chatContainer} ${expanded ? styles.expanded : ''}`}>
        <div className={styles.mainSection}>
          {((status && events.length > 0) || isReplaying) && (
            <Card className={styles.eventsCard}>
              <CardHeader className="p-0 pt-3 space-y-3">
                <div className="flex justify-between items-center px-3">
                  <CardTitle className="text-xl">任务进度</CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge()}
                    {!isReplaying && recordedEvents.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={downloadRecordedEvents}
                        className="flex items-center gap-1"
                      >
                        <DownloadIcon className="h-3 w-3" />
                        保存记录
                      </Button>
                    )}
                    {status === 'completed' && !!currentTaskId && !isReplaying && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={resetChat}
                        className="flex items-center gap-1"
                      >
                        新建对话
                      </Button>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".json"
                      className="hidden"
                    />
                    {!isReplaying && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1"
                      >
                        <UploadIcon className="h-3 w-3" />
                        导入记录重放
                      </Button>
                    )}
                  </div>
                </div>
                <Separator />
              </CardHeader>
              <CardContent className="px-0 py-0 flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 px-3 overflow-hidden">
                  <div className={`${styles.eventsContainer} my-4`}>
                    {events.length === 0 ? (
                      <div className={styles.emptyState}>
                        {isReplaying ? 'Loading replay events...' : 'Waiting for task to start...'}
                      </div>
                    ) : (
                      <div className={styles.eventsList}>
                        {events.map((event, index) => (
                          <div 
                            key={`${event.type}-${index}-${event.step}`} 
                            className={`${styles.eventItem} ${selectedEventIndex === index && event.type === EventType.tool_completed ? styles.selected : ''}`}
                          >
                            {renderEvent(event, index)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {events.length === 0 && !currentTaskId && !isReplaying && (
            <div 
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
            >
              <UploadIcon className="h-16 w-16 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">导入任务记录</h3>
              <p className="text-sm text-muted-foreground mb-4">
                拖放任务记录文件到此处，或者
              </p>
              <Button 
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isReplaying}
              >
                选择文件上传
              </Button>
            </div>
          )}
        </div>

        {expanded && (
          <div className={styles.visualSection}>
            <Card className="h-full flex flex-col">
              <CardHeader className="p-0 pt-3 space-y-3">
                <div className="flex justify-between items-center px-3">
                  <CardTitle className="text-xl">OpenManus's computer</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setExpanded(false)}>
                    <X size={14}></X>
                  </Button>
                </div>
                <Separator />
              </CardHeader>
              <CardContent className="p-3 h-full overflow-hidden">
                {currentToolName && currentToolDetails ? (
                  <ToolsWrapper 
                    toolName={currentToolName} 
                    toolDetails={currentToolDetails} 
                  />
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No active tool visualization
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 mt-auto">
        {isReplaying && (
          <Card className={styles.replayControlCard}>
            <CardContent className="p-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleReplayControl('previous')}
                    disabled={currentStepIndex <= 0 || replayState === 'playing' || allReplaySteps.length === 0}
                    title="上一步"
                  >
                    <SkipBackIcon className="h-4 w-4" />
                  </Button>
                  {replayState === 'playing' ? (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleReplayControl('pause')}
                      disabled={stepsArrayRef.current.length === 0}
                      title="暂停"
                    >
                      <PauseIcon className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleReplayControl('play')}
                      disabled={currentStepIndex >= stepsArrayRef.current.length - 1 || stepsArrayRef.current.length === 0}
                      title="播放"
                    >
                      <PlayIcon className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleReplayControl('next')}
                    disabled={currentStepIndex >= stepsArrayRef.current.length - 1 || replayState === 'playing' || stepsArrayRef.current.length === 0}
                    title="下一步"
                  >
                    <SkipForwardIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    步骤 {currentStepIndex + 1} / {stepsArrayRef.current.length}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={stepsArrayRef.current.length - 1}
                    value={currentStepIndex}
                    onChange={(e) => handleSeekToStep(parseInt(e.target.value), stepsArrayRef.current)}
                    disabled={replayState === 'playing' || stepsArrayRef.current.length === 0}
                    className="w-32"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleStopReplay()}
                >
                  停止重放
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            placeholder="Ask Manus AI anything..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className={`p-4 resize-none min-h-3`}
            disabled={isReplaying || (status === 'completed' && !!currentTaskId)}
            readOnly={isReplaying}
            rows={3}
          />
          <div className="absolute flex gap-2 items-center bottom-2 right-2">
            <Button
              type="submit"
              size="xs"
              disabled={createTaskMutation.isPending || !prompt.trim() || isReplaying || (status === 'completed' && !!currentTaskId)}
            >
              {createTaskMutation.isPending ? '发送中...' : '发送'}
              <SendIcon size={14} className="ml-1" />
            </Button>
            {status === 'running' && !!currentTaskId && !isReplaying && (
              <Button 
                variant="outline" 
                onClick={handleTerminateTask}
                disabled={isTerminating}
                className="flex items-center gap-1"
              >
                <StopCircleIcon className="mr-2 h-4 w-4" />
                {isTerminating ? '停止中...' : '停止任务'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPage; 