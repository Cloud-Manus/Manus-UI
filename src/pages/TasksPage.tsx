import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ExternalLinkIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import apiService, { Task } from '../services/api';

const TasksPage = () => {
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: apiService.getTasks,
    refetchInterval: 5000, // Refetch every 5 seconds to get updates
  });

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get status color based on task status
  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'text-green-600';
    if (status === 'running') return 'text-blue-600';
    if (status.startsWith('failed')) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading tasks...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">Error loading tasks: {error.toString()}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Tasks</h1>
      
      {tasks && tasks.length === 0 ? (
        <div className="text-center p-8">
          <p>No tasks yet. Start a conversation with Manus AI to create a task.</p>
          <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Go to Chat
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks?.map((task: Task) => (
            <Link key={task.id} to={`/tasks/${task.id}`}>
              <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg truncate">{task.prompt.substring(0, 50)}{task.prompt.length > 50 ? '...' : ''}</CardTitle>
                    <ExternalLinkIcon size={16} className="flex-shrink-0 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-2">
                    {formatDate(task.created_at)}
                  </div>
                  <div className={`text-sm font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksPage; 