import { useState, useEffect, FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { SendIcon, ChevronLeftIcon, ChevronRightIcon, CodeIcon, FileTextIcon, LaptopIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import apiService, { TaskEvent, TaskStep } from '../services/api';
import styles from './ChatPage.module.scss';

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
  const navigate = useNavigate();
  
  const createTaskMutation = useMutation({
    mutationFn: apiService.createTask,
    onSuccess: (data) => {
      setCurrentTaskId(data.task_id);
      setEvents([]);
      setStatus('running');
    },
  });

  useEffect(() => {
    if (!currentTaskId) return;

    // Set up SSE connection
    const eventSource = apiService.createTaskEventSource(currentTaskId);
    
    eventSource.onmessage = (event) => {
      console.log('SSE event:', JSON.parse(event.data));
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
        if (data.status) {
          setStatus(data.status);
          if (data.status === 'completed') {
            // Navigate to task detail page when complete
            navigate(`/tasks/${currentTaskId}`);
          }
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
  }, [currentTaskId, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
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

  return (
    <div className={`${styles.chatContainer} ${expanded ? styles.expanded : ''}`}>
      <div className={styles.mainSection}>
        {status && events.length > 0 && (
          <Card className={styles.eventsCard}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Task Progress</CardTitle>
                {getStatusBadge()}
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
              />
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              {createTaskMutation.isPending ? 'Creating task...' : 'Type your message and press Enter'}
            </div>
            <Button 
              type="submit" 
              onClick={handleSubmit}
              disabled={createTaskMutation.isPending || !prompt.trim()}
              className={styles.sendButton}
            >
              <SendIcon className="mr-2 h-4 w-4" />
              {createTaskMutation.isPending ? 'Sending...' : 'Send'}
            </Button>
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