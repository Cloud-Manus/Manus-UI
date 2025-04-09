import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserSettings, AuthProvider as AuthProviderType } from '../types/auth';
import { db } from './db';

// Default settings
const defaultSettings: UserSettings = {
  llm: {
    modelName: '',
    baseUrl: '',
    apiKey: '',
  },
  vision: {
    modelName: '',
    baseUrl: '',
    apiKey: '',
  },
  searchProvider: 'google',
  tavilyApiKey: '',
};

interface AuthContextType {
  user: UserProfile | null;
  settings: UserSettings;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (provider: AuthProviderType) => Promise<void>;
  logout: () => void;
  updateSettings: (newSettings: UserSettings) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from IndexedDB
    const initAuth = async () => {
      try {
        // Try to connect to the database first
        await db.connect();
        
        // Get user from DB
        const storedUser = await db.getUser();
        if (storedUser) {
          setUser(storedUser);
        }

        // Get settings from DB
        const storedSettings = await db.getSettings();
        if (storedSettings) {
          setSettings(storedSettings);
        }
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (provider: AuthProviderType) => {
    setIsLoading(true);
    try {
      // This is a mockup function - in reality, we would implement OAuth logic here
      // For now, we'll just create a fake user
      const mockUser: UserProfile = {
        id: `user_${Math.random().toString(36).substring(2, 9)}`,
        name: provider === 'google' ? 'Google User' : 'GitHub User',
        email: provider === 'google' ? 'user@gmail.com' : 'user@github.com',
        avatarUrl: provider === 'google' 
          ? 'https://lh3.googleusercontent.com/a/default-user' 
          : 'https://github.com/identicons/default.png',
        provider,
      };
      
      setUser(mockUser);
      await db.saveUser(mockUser);
    } catch (error) {
      console.error(`Failed to login with ${provider}:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await db.clearUser();
      setUser(null);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const updateSettings = async (newSettings: UserSettings) => {
    try {
      await db.saveSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        settings,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 