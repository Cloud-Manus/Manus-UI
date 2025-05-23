import axios from 'axios';

const API_HOST = process.env.VITE_API_HOST;

// Create an axios instance
const api = axios.create({
  baseURL: API_HOST,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Define interfaces for API responses
export interface Task {
  id: string;
  prompt: string;
  created_at: string;
  status: string;
  steps: TaskStep[];
}

export interface TaskStep {
  step: number;
  result: string;
  type: string;
}

export interface TaskEvent {
  type: string;
  step?: number;
  result?: string;
  status?: string;
  steps?: TaskStep[];
  message?: string;
}

// API functions
export const apiService = {
  // Create a new task
  createTask: async (prompt: string): Promise<{ task_id: string }> => {
    const response = await api.post('/tasks', { prompt });
    return response.data;
  },

  // Get all tasks
  getTasks: async (): Promise<Task[]> => {
    const response = await api.get('/tasks');
    return response.data;
  },

  // Get a specific task by ID
  getTask: async (taskId: string): Promise<Task> => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  // Function to create an EventSource for streaming task events
  createTaskEventSource: (taskId: string): EventSource => {
    return new EventSource(`${API_HOST}/tasks/${taskId}/events`);
  },

  terminateTask: async (taskId: string): Promise<void> => {
    const response = await api.post(`/tasks/${taskId}/terminate`);
    return response.data;
  },

  // Download files
  downloadFile: async (filePath: string): Promise<Blob> => {
    const response = await api.get(`/download?file_path=${filePath}`, { responseType: 'blob' });
    return response.data;
  },
};

export default apiService; 