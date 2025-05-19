import { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthUser = {
  systemId: string;
  authCode: string;
  isAdmin: boolean;
};

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (authCode: string) => Promise<boolean>;
  logout: () => void;
  checkAdminPassword: (password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => false,
  logout: () => {},
  checkAdminPassword: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('sadhanaUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (authCode: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('systems')
        .select('*')
        .eq('auth_code', authCode)
        .single();

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      if (!data) {
        return false;
      }

      const userData: AuthUser = {
        systemId: data.id,
        authCode: data.auth_code,
        isAdmin: false
      };

      setUser(userData);
      await AsyncStorage.setItem('sadhanaUser', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('sadhanaUser');
  };

  const checkAdminPassword = async (password: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('systems')
        .select('admin_password')
        .eq('id', user.systemId)
        .single();

      if (error || !data) {
        return false;
      }

      const match = data.admin_password === password;
      
      if (match) {
        const updatedUser = { ...user, isAdmin: true };
        setUser(updatedUser);
        await AsyncStorage.setItem('sadhanaUser', JSON.stringify(updatedUser));
      }
      
      return match;
    } catch (error) {
      console.error('Admin check error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        loading, 
        login, 
        logout, 
        checkAdminPassword 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};