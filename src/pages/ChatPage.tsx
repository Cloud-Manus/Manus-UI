import { useState, useEffect, useCallback, FormEvent, useRef, ChangeEvent, DragEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { SendIcon, ChevronLeftIcon, ChevronRightIcon, UploadIcon, DownloadIcon, StopCircleIcon, PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import apiService from '../services/api';
import styles from './ChatPage.module.scss';
import ToolsWrapper from '../components/tools/ToolsWrapper';
import { ToolName, ToolDetails } from '../types/tools/base';

// 导入新的类型定义，但使用字符串字面量而不是枚举
// 这样可以避免 TypeScript 类型推断中的一些问题
type EventTypeString = 
  | 'task_start' | 'task_complete' | 'task_state_change'
  | 'thinking' | 'chat' | 'step'
  | 'tool_select' | 'tool_execute' | 'tool_completed'
  | 'tool_use'
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
  toolStatus?: 'executing' | 'success' | 'failed';
  detail?: Record<string, unknown>;
  // 任务事件相关字段
  agentStatus?: string;
  request?: string;
  results?: string[];
  // 聊天事件相关字段
  sender?: 'user' | 'assistant' | 'system';
  // 错误事件相关字段
  error?: string;
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
  const [visualContent, setVisualContent] = useState<{ code: string; doc: string; web: string }>({
    code: '',
    doc: '',
    web: '',
  });
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [totalSteps, setTotalSteps] = useState<number>(0); // 保留此状态，但现在直接使用步骤数组长度
  
  // 使用useRef存储当前的重放状态，防止闭包问题
  const replayStateRef = useRef<ReplayState>('idle');
  
  // 使用useRef存储步骤数组，避免状态更新延迟问题
  const stepsArrayRef = useRef<DisplayStep[]>([]);
  
  // 用于存储原始的工作流数据
  const currentWorkflow = useRef<SimpleWorkflow | null>(null);
  
  const [currentToolName, setCurrentToolName] = useState<ToolName | null>(null);
  const [currentToolDetails, setCurrentToolDetails] = useState<ToolDetails | null>(null);
  
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
           event.type === 'tool_completed';
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
  
  // 辅助函数：更新可视化内容
  const updateVisualFromEvents = (events: DisplayStep[] | SimpleWorkflowEvent[]) => {
    // 重置可视化内容
    const newVisualContent = { code: '', doc: '', web: '' };
    
    // 根据数组类型处理
    if (events.length > 0) {
      // 处理所有事件
      events.forEach(event => {
        // 检查是否是工具事件
        if (event.type === 'tool_completed' || event.type === 'tool_execute') {
          // 如果是 DisplayStep 类型，检查 toolName
          if ('toolName' in event) {
            // 处理 DisplayStep 类型的事件
            // 通常这些事件已经处理过，内容已经放入 content 中
            if (event.content.includes('code:')) {
              newVisualContent.code = event.content.replace('code:', '');
            } else if (event.content.includes('document:')) {
              newVisualContent.doc = event.content.replace('document:', '');
            } else if (event.content.includes('web:')) {
              newVisualContent.web = event.content.replace('web:', '');
            }
          } else if ('detail' in event && event.detail) {
            // 处理 SimpleWorkflowEvent 类型的事件
            const detail = event.detail;
            
            if ('code' in detail && detail.code) {
              newVisualContent.code = String(detail.code);
            } else if ('document' in detail && detail.document) {
              newVisualContent.doc = String(detail.document);
            } else if ('web' in detail && detail.web) {
              newVisualContent.web = String(detail.web);
            }
          }
        }
      });
    }
    
    setVisualContent(newVisualContent);
  };
  
  // 添加重置函数
  const resetChat = () => {
    setCurrentTaskId(null);
    setEvents([]);
    setStatus('');
    setPrompt('');
    setRecordedEvents([]);
    setVisualContent({ code: '', doc: '', web: '' });
    setReplayState('idle');
    replayStateRef.current = 'idle';
    setAllReplaySteps([]);
    stepsArrayRef.current = [];
    setCurrentStepIndex(0);
    setTotalSteps(0);
    setCurrentToolName(null);
    setCurrentToolDetails(null);
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
    
    // 辅助函数：处理从 SSE 接收的事件
    const handleWorkflowEvent = (event: MessageEvent) => {
      try {
        // 将事件解析为 SimpleWorkflowEvent
        const data = JSON.parse(event.data) as SimpleWorkflowEvent;
        
        // 记录事件
        setRecordedEvents(prev => [...prev, data]);
        
        // 根据事件类型进行处理
        switch (data.type) {
          case 'task_start':
          case 'task_state_change':
          case 'task_complete':
            // 更新任务状态
            if (data.agentStatus) {
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
            }
            break;
            
          case 'tool_use':
            // 处理工具使用事件，更新当前工具信息
            if (data.tool && data.detail) {
              const toolName = data.tool as ToolName;
              // 将详情转换为 ToolDetails 格式
              const toolDetails: ToolDetails = {};
              
              // 根据工具类型设置对应属性
              switch (toolName) {
                case ToolName.StrReplaceEditor:
                  toolDetails.strReplaceEditor = data.detail as any;
                  break;
                case ToolName.BrowserUseTool:
                  toolDetails.browserUse = data.detail as any;
                  break;
                case ToolName.Bash:
                  toolDetails.bash = data.detail as any;
                  break;
                case ToolName.Terminal:
                  toolDetails.terminal = data.detail as any;
                  break;
                case ToolName.WebSearch:
                  toolDetails.webSearch = data.detail as any;
                  break;
                case ToolName.CreateChatCompletion:
                  toolDetails.createChatCompletion = data.detail as any;
                  break;
                case ToolName.PlanningTool:
                  toolDetails.planning = data.detail as any;
                  break;
                case ToolName.Terminate:
                  toolDetails.terminate = data.detail as any;
                  break;
                default:
                  console.warn('Unknown tool type:', toolName);
              }
              
              // 更新工具状态
              setCurrentToolName(toolName);
              setCurrentToolDetails(toolDetails);
              
              // 创建新的展示步骤
              const newStep: DisplayStep = {
                step: data.step,
                content: data.content,
                type: data.type,
                toolName: data.tool
              };
              
              // 更新事件列表
              setEvents(prev => [...prev, newStep]);
            }
            break;
            
          case 'thinking':
          case 'step':
          case 'chat':
          case 'tool_select':
          case 'tool_execute':
          case 'tool_completed': {
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
            
            // 更新可视化内容
            if (data.type === 'tool_completed' && data.detail) {
              // 更新对应类型的可视化内容
              if (data.detail.code) {
                setVisualContent(prev => ({
                  ...prev,
                  code: String(data.detail!.code)
                }));
              } else if (data.detail.document) {
                setVisualContent(prev => ({
                  ...prev,
                  doc: String(data.detail!.document)
                }));
              } else if (data.detail.web) {
                setVisualContent(prev => ({
                  ...prev,
                  web: String(data.detail!.web)
                }));
              }
            }
            break;
          }
            
          case 'error':
            // 处理错误事件
            setStatus('failed');
            console.error('Workflow error:', data.error);
            setIsTerminating(false);
            break;
            
          case 'update_token_count':
            // 处理 token 计数更新，如需要
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
  }, [currentTaskId, navigate, isReplaying]);

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
        // 不要清空status状态，让startReplay来设置它
        setVisualContent({ code: '', doc: '', web: '' });
        
        // 设置 prompt 值，这样用户可以看到原始请求
        setPrompt(workflow.prompt || '');
        
        // 保存工作流数据
        currentWorkflow.current = workflow;
        
        // 提取所有显示步骤
        const displaySteps = workflow.events
          .filter(event => [
            'thinking', 'step', 'chat', 
            'tool_select', 'tool_execute', 'tool_completed'
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
        'tool_use' // 添加 tool_use 类型
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

  // Helper function to render different event types
  const renderEvent = (event: DisplayStep) => {
    switch (event.type) {
      case 'thinking':
        return (
          <div className={styles.thinkEvent}>
            <div className={styles.eventTitle}>Thinking:</div>
            <div className={styles.eventContent}>{event.content}</div>
          </div>
        );
      case 'tool_select':
      case 'tool_execute':
      case 'tool_completed':
        return (
          <div className={styles.toolEvent}>
            <div className={styles.eventTitle}>
              Using Tool: {event.toolName && <span className={styles.toolName}>{event.toolName}</span>}
            </div>
            <div className={styles.eventContent}>{event.content}</div>
          </div>
        );
      case 'chat':
        return (
          <div className={styles.actEvent}>
            <div className={styles.eventTitle}>Chat:</div>
            <div className={styles.eventContent}>{event.content}</div>
          </div>
        );
      case 'step':
        return (
          <div className={styles.resultEvent}>
            <div className={styles.eventTitle}>Step:</div>
            <div className={styles.eventContent}>{event.content}</div>
          </div>
        );
      default:
        return (
          <div className={styles.genericEvent}>
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

  // 跳转到指定步骤
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
    
    // 检查最新步骤是否为工具使用事件
    const latestStep = stepsToUse[stepIndex];
    if (latestStep && latestStep.type === 'tool_use' && latestStep.toolName && currentWorkflow.current) {
      // 查找原始事件以获取完整的工具详情
      const originalEvent = currentWorkflow.current.events.find(
        e => e.type === 'tool_use' && e.step === latestStep.step
      );
      
      if (originalEvent && originalEvent.tool && originalEvent.detail) {
        // 更新工具状态
        const toolName = originalEvent.tool as ToolName;
        const toolDetails: ToolDetails = {};
        
        // 根据工具类型设置对应属性
        switch (toolName) {
          case ToolName.StrReplaceEditor:
            toolDetails.strReplaceEditor = originalEvent.detail as any;
            break;
          case ToolName.BrowserUseTool:
            toolDetails.browserUse = originalEvent.detail as any;
            break;
          case ToolName.Bash:
            toolDetails.bash = originalEvent.detail as any;
            break;
          case ToolName.Terminal:
            toolDetails.terminal = originalEvent.detail as any;
            break;
          case ToolName.WebSearch:
            toolDetails.webSearch = originalEvent.detail as any;
            break;
          case ToolName.CreateChatCompletion:
            toolDetails.createChatCompletion = originalEvent.detail as any;
            break;
          case ToolName.PlanningTool:
            toolDetails.planning = originalEvent.detail as any;
            break;
          case ToolName.Terminate:
            toolDetails.terminate = originalEvent.detail as any;
            break;
          default:
            console.warn('Unknown tool type:', toolName);
        }
        
        setCurrentToolName(toolName);
        setCurrentToolDetails(toolDetails);
      }
    }
    
    // 强制重新渲染事件列表
    console.log(`更新事件列表，显示 ${visibleSteps.length} 个事件，当前索引: ${stepIndex}`);
    setEvents([...visibleSteps]); // 使用新数组引用强制更新
    
    // 更新可视化内容
    updateVisualFromEvents(visibleSteps);
    
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
    
    // 更新可视化内容
    updateVisualFromEvents(visibleSteps);
    
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
  
  // 停止重放
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
    setVisualContent({ code: '', doc: '', web: '' });
    setCurrentToolName(null);
    setCurrentToolDetails(null);
  };

  return (
    <div className={`${styles.chatContainer} ${expanded ? styles.expanded : ''}`}>
      <div className={styles.mainSection}>
        {((status && events.length > 0) || isReplaying) && (
          <Card className={styles.eventsCard}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Task Progress</CardTitle>
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
              <CardDescription>Real-time updates from AI agent</CardDescription>
              <Separator />
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px] px-4">
                <div className={styles.eventsContainer}>
                  {events.length === 0 ? (
                    <div className={styles.emptyState}>
                      {isReplaying ? 'Loading replay events...' : 'Waiting for task to start...'}
                    </div>
                  ) : (
                    <div className={styles.eventsList}>
                      {events.map((event, index) => (
                        <div key={`${event.type}-${index}-${event.step}`} className={styles.eventItem}>
                          {renderEvent(event)}
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
          <Card className={styles.emptyStateCard}>
            <CardContent>
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
            </CardContent>
          </Card>
        )}

        {isReplaying && (
          <Card className={styles.replayControlCard}>
            <CardContent className="p-4">
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

        <Card className={styles.promptCard}>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Chat with Manus AI</CardTitle>
            <CardDescription>Ask anything and let the AI agent assist you</CardDescription>
            <Separator />
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Ask Manus AI anything..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className={styles.textareaContainer}
                disabled={isReplaying || (status === 'completed' && !!currentTaskId)}
                readOnly={isReplaying}
              />
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              {createTaskMutation.isPending ? '创建任务中...' : 
               isReplaying ? '正在重放任务...' : 
               (status === 'completed' && !!currentTaskId) ? '任务已完成，若要继续对话请创建新任务' : 
               '输入消息并回车发送'}
            </div>
            <div className="flex gap-2">
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
              <Button 
                type="submit" 
                onClick={handleSubmit}
                disabled={createTaskMutation.isPending || !prompt.trim() || isReplaying || (status === 'completed' && !!currentTaskId)}
                className={styles.sendButton}
              >
                <SendIcon className="mr-2 h-4 w-4" />
                {createTaskMutation.isPending ? '发送中...' : '发送'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {expanded && (
        <div className={styles.visualSection}>
          <Card className={styles.visualCard}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">OpenManus's computer</CardTitle>
                <Badge variant="outline">Real-time</Badge>
              </div>
              <CardDescription>Watch AI actions in real-time</CardDescription>
              <Separator />
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-350px)] px-4">
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
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      <Button 
        variant="outline" 
        size="icon" 
        className={styles.expandButton}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default ChatPage; 