import { useState, useEffect, useCallback, FormEvent, useRef, ChangeEvent, DragEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { SendIcon, ChevronLeftIcon, ChevronRightIcon, CodeIcon, FileTextIcon, LaptopIcon, UploadIcon, DownloadIcon, StopCircleIcon, PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import apiService, { TaskEvent, TaskStep } from '../services/api';
import styles from './ChatPage.module.scss';

// 定义重放状态类型
type ReplayState = 'idle' | 'playing' | 'paused';

const ChatPage = () => {
  const [prompt, setPrompt] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [events, setEvents] = useState<TaskStep[]>([]);
  const [status, setStatus] = useState<string>('');
  const [activeVisualTab, setActiveVisualTab] = useState<string>('code');
  const [visualContent, setVisualContent] = useState<{ code: string; doc: string; web: string }>({
    code: '',
    doc: '',
    web: '',
  });
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [recordedEvents, setRecordedEvents] = useState<TaskEvent[]>([]);
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const [isTerminating, setIsTerminating] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [replayState, setReplayState] = useState<ReplayState>('idle');
  const [allReplaySteps, setAllReplaySteps] = useState<TaskStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [totalSteps, setTotalSteps] = useState<number>(0); // 保留此状态，但现在直接使用步骤数组长度
  
  // 使用useRef存储当前的重放状态，防止闭包问题
  const replayStateRef = useRef<ReplayState>('idle');
  
  // 使用useRef存储步骤数组，避免状态更新延迟问题
  const stepsArrayRef = useRef<TaskStep[]>([]);
  
  // 同步replayState的变化到ref
  useEffect(() => {
    replayStateRef.current = replayState;
  }, [replayState]);
  
  // 同步allReplaySteps的变化到ref
  useEffect(() => {
    stepsArrayRef.current = allReplaySteps;
  }, [allReplaySteps]);
  
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
    
    const handleEventWithData = (event: Event, type: string) => {
      if (event instanceof MessageEvent) {
        const data = JSON.parse(event.data) as TaskEvent;
        // 记录事件
        setRecordedEvents(prev => [...prev, { ...data, type }]);
        
        if (data.result) {
          const newEvent: TaskStep = {
            step: data.step ?? 0,
            result: data.result,
            type
          };
          setEvents(prev => [...prev, newEvent]);
          
          // Update visual content based on event type
          if (type === 'tool' && data.result && data.result.includes('code:')) {
            setVisualContent(prev => ({
              ...prev,
              code: data.result!.replace('code:', '')
            }));
          } else if (type === 'tool' && data.result && data.result.includes('document:')) {
            setVisualContent(prev => ({
              ...prev,
              doc: data.result!.replace('document:', '')
            }));
          } else if (type === 'tool' && data.result && data.result.includes('web:')) {
            setVisualContent(prev => ({
              ...prev,
              web: data.result!.replace('web:', '')
            }));
          }
        }
      }
    };

    eventSource.addEventListener('step', (e) => handleEventWithData(e, 'step'));
    eventSource.addEventListener('think', (e) => handleEventWithData(e, 'think'));
    eventSource.addEventListener('tool', (e) => handleEventWithData(e, 'tool'));
    eventSource.addEventListener('act', (e) => handleEventWithData(e, 'act'));
    eventSource.addEventListener('result', (e) => handleEventWithData(e, 'result'));

    eventSource.addEventListener('status', (event) => {
      if (event instanceof MessageEvent) {
        const data = JSON.parse(event.data) as TaskEvent;
        
        // 去重处理：移除之前的所有status事件，只保留最新的
        setRecordedEvents(prev => {
          // 过滤掉之前所有的status事件
          const filteredEvents = prev.filter(e => e.type !== 'status');
          // 添加最新的status事件（保留完整信息）
          return [...filteredEvents, { ...data, type: 'status' }];
        });
        
        if (data.status) {
          setStatus(data.status);
          // 如果收到终止或错误状态，重置终止中状态
          if (data.status === 'terminated' || data.status === 'failed' || data.status === 'completed') {
            setIsTerminating(false);
          }
        }
      }
    });

    eventSource.addEventListener('complete', (event) => {
      if (event instanceof MessageEvent) {
        const data = JSON.parse(event.data) as TaskEvent;
        // 记录完成事件
        setRecordedEvents(prev => [...prev, { ...data, type: 'complete' }]);
      }
      
      setStatus('completed');
      
      // 使用setTimeout延迟下载，确保状态更新完成后再触发下载
      setTimeout(() => {
        // 触发下载记录的事件
        downloadRecordedEvents();
      }, 500);
      
      eventSource.close();
    });

    return () => {
      eventSource.close();
    };
  }, [currentTaskId, navigate, isReplaying]);

  // 下载记录的事件为JSON文件
  const downloadRecordedEvents = () => {
    if (recordedEvents.length === 0) return;
    
    // 找出最后一个status类型的消息，它包含了所有信息
    const lastStatusEvent = recordedEvents.filter(event => event.type === 'status').pop();
    
    if (!lastStatusEvent) {
      console.error('未找到status类型的消息，无法下载完整记录');
      alert('无法下载：记录中缺少必要的状态信息');
      return;
    }
    
    // 确保status事件中的steps数组是完整的
    if (!lastStatusEvent.steps || lastStatusEvent.steps.length === 0) {
      console.warn('Status事件中没有步骤信息，尝试从其他事件构建');
      // 从其他记录的事件中构建steps数组
      const steps = recordedEvents
        .filter(event => ['step', 'think', 'tool', 'act', 'result'].includes(event.type || ''))
        .map(event => ({
          step: event.step || 0,
          result: event.result || '',
          type: event.type || 'step'
        }));
      
      if (steps.length > 0) {
        lastStatusEvent.steps = steps;
      } else {
        console.error('没有找到任何可用的步骤信息');
        alert('无法下载：记录中缺少步骤信息');
        return;
      }
    }
    
    // 只保存最后一个status消息，它已经包含了所有信息
    const eventsToDownload = [lastStatusEvent];
    
    console.log('准备下载的数据:', eventsToDownload);
    const jsonData = JSON.stringify(eventsToDownload, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `task-${currentTaskId}-replay.json`;
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
        const jsonData = JSON.parse(content) as TaskEvent[];
        console.log('解析后的数据:', jsonData);
        
        // 调试：输出更详细的步骤信息
        jsonData.forEach((event, index) => {
          if (event.type === 'status' && event.steps) {
            console.log(`事件 ${index + 1}: ${event.type}, 状态: ${event.status}, 包含 ${event.steps.length} 个步骤`);
            // 打印前5个步骤的信息
            event.steps.slice(0, 5).forEach((step, i) => {
              console.log(`  步骤 ${i + 1}/${event.steps?.length}: 类型=${step.type}, 结果长度=${step.result?.length || 0}`);
            });
            if (event.steps.length > 5) {
              console.log(`  ...以及更多 ${event.steps.length - 5} 个步骤`);
            }
          } else {
            console.log(`事件 ${index + 1}: ${event.type}`);
          }
        });
        
        // 验证数据格式
        if (!Array.isArray(jsonData)) {
          alert('文件格式错误：数据不是数组');
          return;
        }
        
        if (jsonData.length === 0) {
          alert('文件内容为空，没有可重放的事件');
          return;
        }
        
        // 检查是否包含必要的信息
        const hasValidData = jsonData.some(event => {
          if (event.type === 'status') {
            // 如果是status事件，检查它是否有steps
            if (event.steps && event.steps.length > 0) {
              return true;
            }
            // 如果没有steps，但有其他必要信息，也认为是有效的
            return !!event.status;
          }
          // 其他类型的事件，只要有type和result就认为有效
          return event.type && (['step', 'think', 'tool', 'act', 'result'].includes(event.type) && !!event.result);
        });
        
        if (!hasValidData) {
          alert('文件内容不包含可重放的有效数据');
          return;
        }
        
        // 如果status事件没有steps，尝试从其他事件构建
        const statusEvent = jsonData.find(event => event.type === 'status');
        if (statusEvent && (!statusEvent.steps || statusEvent.steps.length === 0)) {
          console.log('Status事件中没有步骤信息，尝试构建');
          
          // 从其他事件构建steps
          const steps = jsonData
            .filter(event => event.type && ['step', 'think', 'tool', 'act', 'result'].includes(event.type) && event.result)
            .map(event => ({
              step: event.step || 0,
              result: event.result || '',
              type: event.type
            }));
          
          if (steps.length > 0) {
            console.log(`从其他事件构建了 ${steps.length} 个步骤`);
            statusEvent.steps = steps;
          }
        }
        
        // 清空当前状态，准备重放
        setEvents([]);
        setStatus('');
        setVisualContent({ code: '', doc: '', web: '' });
        setIsReplaying(true);
        
        // 重置重放控制状态
        setReplayState('idle');
        replayStateRef.current = 'idle';
        setAllReplaySteps([]);
        setCurrentStepIndex(0);
        setTotalSteps(0);
        
        // 显示上传成功提示
        alert(`成功加载 ${file.name}，即将开始重放`);
        
        // 开始重放事件
        replayEvents(jsonData);
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
  const replayEvents = (events: TaskEvent[]) => {
    console.log('开始重放事件，事件数量:', events.length);
    
    // 处理函数：从status事件中提取步骤信息并准备重放
    const prepareReplayFromStatusEvent = (statusEvent: TaskEvent) => {
      console.log('处理status事件:', statusEvent);
      
      // 设置状态
      setStatus(statusEvent.status || '');
      
      // 提取步骤信息
      if (statusEvent.steps && statusEvent.steps.length > 0) {
        console.log(`从status事件中提取${statusEvent.steps.length}个步骤`);
        
        try {
          // 确保步骤数据格式正确
          const steps = statusEvent.steps.map(step => ({
            step: step.step || 0,
            result: step.result || '',
            type: step.type || 'step'
          }));
          
          console.log('处理后的步骤数据:', steps.length, '条，第一条:', steps[0]);
          
          // 保存所有步骤用于控制
          setAllReplaySteps(steps);
          // 同时更新ref中的步骤数组，避免状态更新延迟问题
          stepsArrayRef.current = steps;
          const stepsCount = steps.length;
          setTotalSteps(stepsCount);
          
          // 清空当前显示
          setEvents([]);
          setCurrentStepIndex(0);
          
          // 先设置重放状态为播放
          setReplayState('playing');
          replayStateRef.current = 'playing';
          
          // 显示第一个步骤 - 直接传递步骤数组
          console.log('准备显示第一个步骤，步骤总数:', stepsCount);
          handleSeekToStep(0, steps);
          
          // 直接开始播放
          playFromCurrentStep(steps, 0);
        } catch (error) {
          console.error('步骤数据处理错误:', error);
          alert('重放准备过程中出错，请检查数据格式');
          setIsReplaying(false);
          setReplayState('idle');
        }
      } else {
        console.warn('Status事件中没有步骤信息');
        alert('无法重放：状态事件中没有步骤信息');
        setIsReplaying(false);
      }
    };
    
    // 检查是否有status事件
    const statusEvent = events.find(event => event.type === 'status');
    if (statusEvent) {
      prepareReplayFromStatusEvent(statusEvent);
      return;
    }
    
    // 如果没有找到status事件，尝试从其他事件构建步骤
    console.log('未找到status事件，从事件列表构建步骤');
    const steps = events
      .filter(event => event.type && ['step', 'think', 'tool', 'act', 'result'].includes(event.type))
      .map(event => ({
        step: event.step || 0,
        result: event.result || '',
        type: event.type || 'step'
      }));
    
    if (steps.length > 0) {
      // 保存所有步骤用于控制
      setAllReplaySteps(steps);
      // 同时更新ref中的步骤数组，避免状态更新延迟问题
      stepsArrayRef.current = steps;
      const stepsCount = steps.length;
      setTotalSteps(stepsCount);
      
      // 清空当前显示
      setEvents([]);
      setCurrentStepIndex(0);
      
      // 先设置重放状态为播放
      setReplayState('playing');
      replayStateRef.current = 'playing';
      
      // 显示第一个步骤 - 直接传递步骤数组
      console.log('准备显示第一个步骤，步骤总数:', stepsCount);
      handleSeekToStep(0, steps);
      
      // 直接开始播放
      playFromCurrentStep(steps, 0);
    } else {
      console.error('没有找到可用的步骤信息');
      alert('无法重放：未找到步骤信息');
      setIsReplaying(false);
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
  const renderEvent = (event: TaskStep) => {
    switch (event.type) {
      case 'think':
        return (
          <div className={styles.thinkEvent}>
            <div className={styles.eventTitle}>Thinking:</div>
            <div className={styles.eventContent}>{event.result}</div>
          </div>
        );
      case 'tool':
        return (
          <div className={styles.toolEvent}>
            <div className={styles.eventTitle}>Using Tool:</div>
            <div className={styles.eventContent}>{event.result}</div>
          </div>
        );
      case 'act':
        return (
          <div className={styles.actEvent}>
            <div className={styles.eventTitle}>Action:</div>
            <div className={styles.eventContent}>{event.result}</div>
          </div>
        );
      case 'result':
        return (
          <div className={styles.resultEvent}>
            <div className={styles.eventTitle}>Result:</div>
            <div className={styles.eventContent}>{event.result}</div>
          </div>
        );
      default:
        return (
          <div className={styles.genericEvent}>
            <div className={styles.eventContent}>{event.result}</div>
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

  // 更新可视化内容
  const updateVisualContent = useCallback((steps: TaskStep[]) => {
    // 重置可视化内容
    const newVisualContent = { code: '', doc: '', web: '' };
    
    // 逐步更新可视化内容
    steps.forEach(step => {
      if (step.type === 'tool' && step.result) {
        if (step.result.includes('code:')) {
          newVisualContent.code = step.result.replace('code:', '');
        } else if (step.result.includes('document:')) {
          newVisualContent.doc = step.result.replace('document:', '');
        } else if (step.result.includes('web:')) {
          newVisualContent.web = step.result.replace('web:', '');
        }
      }
    });
    
    setVisualContent(newVisualContent);
  }, []);
  
  // 跳转到指定步骤
  const handleSeekToStep = useCallback((stepIndex: number, stepsArray?: TaskStep[]) => {
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
    setEvents(visibleSteps);
    
    // 更新可视化内容
    updateVisualContent(visibleSteps);
    
    console.log('已跳转到步骤:', stepIndex, '显示步骤数:', visibleSteps.length);
  }, [allReplaySteps, updateVisualContent]);
  
  // 从当前步骤开始播放
  const playFromCurrentStep = useCallback((stepsArray?: TaskStep[], currentIndex?: number) => {
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
    
    setCurrentStepIndex(nextStepIndex);
    
    // 更新显示的步骤
    const visibleSteps = stepsToUse.slice(0, nextStepIndex + 1);
    setEvents(visibleSteps);
    
    // 更新可视化内容
    updateVisualContent(visibleSteps);
    
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
  }, [allReplaySteps, currentStepIndex, updateVisualContent]);
  
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
  };

  return (
    <div className={`${styles.chatContainer} ${expanded ? styles.expanded : ''}`}>
      <div className={styles.mainSection}>
        {status && events.length > 0 && (
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
                    <div className={styles.emptyState}>Waiting for task to start...</div>
                  ) : (
                    <div className={styles.eventsList}>
                      {events.map((event, index) => (
                        <div key={index} className={styles.eventItem}>
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
                <CardTitle className="text-xl">Visualization</CardTitle>
                <Badge variant="outline">Real-time</Badge>
              </div>
              <CardDescription>Watch AI actions in real-time</CardDescription>
              <Separator />
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="code" value={activeVisualTab} onValueChange={setActiveVisualTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-4 mx-4 mt-2">
                  <TabsTrigger value="code" className="flex items-center gap-2">
                    <CodeIcon className="h-4 w-4" />
                    Code
                  </TabsTrigger>
                  <TabsTrigger value="doc" className="flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4" />
                    Document
                  </TabsTrigger>
                  <TabsTrigger value="web" className="flex items-center gap-2">
                    <LaptopIcon className="h-4 w-4" />
                    Web
                  </TabsTrigger>
                </TabsList>
                <ScrollArea className="h-[calc(100vh-350px)] px-4">
                  <TabsContent value="code" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <div className={styles.codeViewer}>
                      <pre className="bg-muted p-4 rounded-md">
                        {visualContent.code || 'No code execution yet'}
                      </pre>
                    </div>
                  </TabsContent>
                  <TabsContent value="doc" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <div className={styles.docViewer}>
                      <div className="p-4 rounded-md bg-muted">
                        {visualContent.doc || 'No document generation yet'}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="web" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <div className={styles.webViewer}>
                      <div className="p-4 rounded-md bg-muted">
                        {visualContent.web ? (
                          <div dangerouslySetInnerHTML={{ __html: visualContent.web }} />
                        ) : (
                          'No web content yet'
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
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