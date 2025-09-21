import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from "expo-secure-store";

interface AuthContextType {
  token: string | null;
  refreshToken: string | null;
  user: { id: string; username: string; email?: string } | null;
  isLoading: boolean;
  login: (username: string, accessToken: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
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
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; username: string; email?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('jwt');
      const storedRefreshToken = await SecureStore.getItemAsync('refreshToken');
      
      if (storedToken) {
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
        // You can decode the JWT to extract user info here
        setUser({ 
          id: 'user-id-from-jwt', 
          username: 'user-from-jwt' // Extract from JWT payload
        });
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, accessToken: string): Promise<boolean> => {
    try {
      setToken(accessToken);
      setUser({ id: 'user-id', username }); // Update with real user data from JWT
      
      // The tokens are already stored in SecureStore by the login component
      return true;
    } catch (error) {
      console.error('Login context update error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('jwt');
      await SecureStore.deleteItemAsync('refreshToken');
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    token,
    refreshToken,
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};