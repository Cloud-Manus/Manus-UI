import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import apiService, { TaskEvent, TaskStep } from '../services/api';
import styles from './TaskDetailPage.module.scss';

const TaskDetailPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [events, setEvents] = useState<TaskStep[]>([]);
  const [status, setStatus] = useState<string>('loading');
  const [error, setError] = useState<string | null>(null);

  const { data: task } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => apiService.getTask(taskId || ''),
    enabled: !!taskId,
    refetchInterval: (data) => {
      // Stop refetching if task is complete or failed
      if (data && typeof data === 'object' && 'status' in data) {
        const taskStatus = data.status as string;
        return taskStatus === 'completed' || taskStatus.startsWith('failed') ? false : 5000;
      }
      return 5000;
    },
  });

  useEffect(() => {
    if (!taskId) return;

    // Set up SSE connection
    const eventSource = apiService.createTaskEventSource(taskId);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('SSE event:', data);
    };

    const handleEventWithData = (event: Event, type: string) => {
      if (event instanceof MessageEvent) {
        const data = JSON.parse(event.data) as TaskEvent;
        if (data.result) {
          const newEvent: TaskStep = {
            step: data.step ?? 0,
            result: data.result,
            type
          };
          setEvents((prev) => [...prev, newEvent]);
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
        if (data.status) {
          setStatus(data.status);
        }
      }
    });

    eventSource.addEventListener('error', (event) => {
      if (event instanceof MessageEvent) {
        const data = JSON.parse(event.data) as TaskEvent;
        if (data.message) {
          setError(data.message);
          setStatus('error');
        }
      }
    });

    eventSource.addEventListener('complete', () => {
      setStatus('completed');
      eventSource.close();
    });

    return () => {
      eventSource.close();
    };
  }, [taskId]);

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

  // Get status indicator
  const getStatusIndicator = () => {
    const statusClass = status === 'running' 
      ? styles.running 
      : status === 'completed' 
        ? styles.completed 
        : status === 'error' || status.startsWith('failed') 
          ? styles.error 
          : styles.pending;
          
    return (
      <div className={`${styles.statusIndicator} ${statusClass}`}>
        {status === 'running' && 'Processing...'}
        {status === 'completed' && 'Completed'}
        {(status === 'error' || status.startsWith('failed')) && `Failed: ${error}`}
        {!['running', 'completed', 'error'].includes(status) && !status.startsWith('failed') && status}
      </div>
    );
  };

  return (
    <div className={styles.detailContainer}>
      <div className={styles.header}>
        <Link to="/tasks">
          <Button variant="outline" size="sm" className={styles.backButton}>
            <ArrowLeftIcon size={16} />
            <span>Back to Tasks</span>
          </Button>
        </Link>
        {getStatusIndicator()}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{task?.prompt || 'Task Details'}</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskDetailPage; 