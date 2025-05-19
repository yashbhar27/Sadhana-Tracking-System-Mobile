import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { KeyRound, LogIn } from 'lucide-react-native';

export default function LoginScreen() {
  const [authCode, setAuthCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!authCode.trim()) {
      alert('Authentication code is required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(authCode);
      
      if (success) {
        router.replace('/');
      } else {
        alert('Invalid authentication code');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <KeyRound size={48} color="#f97316" />
          <Text style={styles.title}>Sadhana Tracking System</Text>
          <Text style={styles.subtitle}>
            Enter your authentication code to access your tracking system
          </Text>
        </View>
        
        <View style={styles.form}>
          <Text style={styles.label}>Authentication Code</Text>
          <TextInput
            style={styles.input}
            value={authCode}
            onChangeText={(text) => setAuthCode(text.toUpperCase())}
            placeholder="Enter your authentication code"
            autoCapitalize="characters"
            autoCorrect={false}
          />
          
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <LogIn size={20} color="white" />
            <Text style={styles.buttonText}>
              {isLoading ? 'Authenticating...' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Need a new tracking system?{' '}
            <Link href="/new-system" style={styles.link}>
              Request one here
            </Link>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#f97316',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  link: {
    color: '#f97316',
    fontWeight: '500',
  },
});