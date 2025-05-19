import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://epjxjnuhkcewbzqbiwtm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwanhqbnVoa2Nld2J6cWJpd3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NjE2NDgsImV4cCI6MjA2MjEzNzY0OH0.Soffh89c-xsB7CV5D-BklW4dQJqoLdrfuKEGF__N8w8';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;