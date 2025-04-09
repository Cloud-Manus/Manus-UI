export type AuthProvider = 'google' | 'github';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: AuthProvider;
}

export interface UserSettings {
  llm: {
    modelName: string;
    baseUrl: string;
    apiKey: string;
  };
  vision: {
    modelName: string;
    baseUrl: string;
    apiKey: string;
  };
  searchProvider: 'tavily' | 'google' | 'duckduckgo' | 'bing';
  tavilyApiKey?: string;
} 