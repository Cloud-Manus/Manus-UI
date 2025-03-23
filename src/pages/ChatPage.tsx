import { useState, FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { SendIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import apiService from '../services/api';
import styles from './ChatPage.module.scss';

const ChatPage = () => {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();
  
  const createTaskMutation = useMutation({
    mutationFn: apiService.createTask,
    onSuccess: (data) => {
      navigate(`/tasks/${data.task_id}`);
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    createTaskMutation.mutate(prompt);
  };

  return (
    <div className={styles.chatContainer}>
      <Card>
        <CardHeader>
          <CardTitle>Chat with Manus AI</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Ask Manus AI anything..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className={styles.textareaContainer}
            />
            <div className={styles.buttonContainer}>
              <Button 
                type="submit" 
                disabled={createTaskMutation.isPending || !prompt.trim()}
                className={styles.sendButton}
              >
                <SendIcon size={18} />
                <span>{createTaskMutation.isPending ? 'Sending...' : 'Send'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatPage; 