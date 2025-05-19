import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import supabase from '../lib/supabase';

interface System {
  id: string;
  name: string;
  auth_code: string;
  admin_password: string;
  admin_name?: string;
  security_question?: string;
  security_answer?: string;
}

interface Devotee {
  id: string;
  name: string;
  system_id: string;
  is_resident: boolean;
}

interface Entry {
  id: string;
  devotee_id: string;
  date: string;
  mangla: number;
  japa: number;
  lecture: number;
  temple_visit: boolean;
  temple_visit_type: 'none' | 'normal' | 'mangla' | 'japa' | 'lecture';
  devotee_name?: string;
}

interface SystemContextType {
  system: System | null;
  devotees: Devotee[];
  entries: Entry[];
  loadSystem: () => Promise<void>;
  loadDevotees: () => Promise<Devotee[]>;
  loadEntries: () => Promise<Entry[]>;
  addDevotee: (name: string, isResident: boolean) => Promise<boolean>;
  updateDevotee: (id: string, name: string, isResident: boolean) => Promise<boolean>;
  deleteDevotee: (id: string) => Promise<boolean>;
  addEntry: (
    devoteeId: string, 
    date: string, 
    mangla: number, 
    japa: number, 
    lecture: number, 
    templeVisit: boolean,
    templeVisitType: 'none' | 'normal' | 'mangla' | 'japa' | 'lecture'
  ) => Promise<boolean>;
  updateEntry: (
    id: string,
    devoteeId: string, 
    date: string, 
    mangla: number, 
    japa: number, 
    lecture: number, 
    templeVisit: boolean,
    templeVisitType: 'none' | 'normal' | 'mangla' | 'japa' | 'lecture'
  ) => Promise<boolean>;
  deleteEntry: (id: string) => Promise<boolean>;
  updateSystemSettings: (updates: Partial<System>) => Promise<boolean>;
}

const SystemContext = createContext<SystemContextType>({
  system: null,
  devotees: [],
  entries: [],
  loadSystem: async () => {},
  loadDevotees: async () => [],
  loadEntries: async () => [],
  addDevotee: async () => false,
  updateDevotee: async () => false,
  deleteDevotee: async () => false,
  addEntry: async () => false,
  updateEntry: async () => false,
  deleteEntry: async () => false,
  updateSystemSettings: async () => false,
});

export const useSystem = () => useContext(SystemContext);

export const SystemProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [system, setSystem] = useState<System | null>(null);
  const [devotees, setDevotees] = useState<Devotee[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    if (user) {
      loadSystem();
      loadDevotees();
      loadEntries();
    } else {
      setSystem(null);
      setDevotees([]);
      setEntries([]);
    }
  }, [user]);

  const loadSystem = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('systems')
        .select('*')
        .eq('id', user.systemId)
        .single();

      if (error) throw error;
      setSystem(data);
    } catch (error) {
      console.error('Error loading system:', error);
    }
  };

  const loadDevotees = async (): Promise<Devotee[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('devotees')
        .select('*')
        .eq('tracking_system_id', user.systemId)
        .order('name');

      if (error) throw error;
      setDevotees(data || []);
      return data || [];
    } catch (error) {
      console.error('Error loading devotees:', error);
      return [];
    }
  };

  const loadEntries = async (): Promise<Entry[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('entries')
        .select(`
          id,
          devotee_id,
          date,
          mangla,
          japa,
          lecture,
          temple_visit,
          temple_visit_type,
          devotees (
            name
          )
        `)
        .eq('tracking_system_id', user.systemId)
        .order('date', { ascending: false });

      if (error) throw error;
      
      const transformedEntries = data.map(entry => ({
        id: entry.id,
        devotee_id: entry.devotee_id,
        date: entry.date,
        mangla: entry.mangla,
        japa: entry.japa,
        lecture: entry.lecture,
        temple_visit: entry.temple_visit || false,
        temple_visit_type: entry.temple_visit_type || 'none',
        devotee_name: entry.devotees?.name
      }));
      
      setEntries(transformedEntries);
      return transformedEntries;
    } catch (error) {
      console.error('Error loading entries:', error);
      return [];
    }
  };

  const addDevotee = async (name: string, isResident: boolean): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('devotees')
        .insert([
          { name, tracking_system_id: user.systemId, is_resident: isResident }
        ])
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        setDevotees([...devotees, data[0]]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding devotee:', error);
      return false;
    }
  };

  const updateDevotee = async (id: string, name: string, isResident: boolean): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('devotees')
        .update({ name, is_resident: isResident })
        .eq('id', id)
        .eq('tracking_system_id', user.systemId);

      if (error) throw error;
      
      setDevotees(devotees.map(d => d.id === id ? { ...d, name, is_resident: isResident } : d));
      return true;
    } catch (error) {
      console.error('Error updating devotee:', error);
      return false;
    }
  };

  const deleteDevotee = async (id: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('devotees')
        .delete()
        .eq('id', id)
        .eq('tracking_system_id', user.systemId);

      if (error) throw error;
      
      setDevotees(devotees.filter(d => d.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting devotee:', error);
      return false;
    }
  };

  const addEntry = async (
    devoteeId: string, 
    date: string, 
    mangla: number, 
    japa: number, 
    lecture: number,
    templeVisit: boolean,
    templeVisitType: 'none' | 'normal' | 'mangla' | 'japa' | 'lecture'
  ): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Check if an entry already exists for this devotee and date
      const { data: existingEntries } = await supabase
        .from('entries')
        .select('id')
        .eq('devotee_id', devoteeId)
        .eq('date', date)
        .eq('tracking_system_id', user.systemId);
      
      if (existingEntries && existingEntries.length > 0) {
        // Update existing entry
        return updateEntry(
          existingEntries[0].id, 
          devoteeId, 
          date, 
          mangla, 
          japa, 
          lecture, 
          templeVisit,
          templeVisitType
        );
      }
      
      const devotee = devotees.find(d => d.id === devoteeId);
      const { data, error } = await supabase
        .from('entries')
        .insert([
          { 
            devotee_id: devoteeId, 
            date, 
            mangla, 
            japa, 
            lecture,
            temple_visit: templeVisit,
            temple_visit_type: templeVisitType,
            tracking_system_id: user.systemId
          }
        ])
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        const newEntry = {
          ...data[0],
          devotee_name: devotee?.name
        };
        setEntries([newEntry, ...entries]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding entry:', error);
      return false;
    }
  };

  const updateEntry = async (
    id: string,
    devoteeId: string, 
    date: string, 
    mangla: number, 
    japa: number, 
    lecture: number,
    templeVisit: boolean,
    templeVisitType: 'none' | 'normal' | 'mangla' | 'japa' | 'lecture'
  ): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const devotee = devotees.find(d => d.id === devoteeId);
      const { error } = await supabase
        .from('entries')
        .update({ 
          devotee_id: devoteeId, 
          date, 
          mangla, 
          japa, 
          lecture,
          temple_visit: templeVisit,
          temple_visit_type: templeVisitType
        })
        .eq('id', id)
        .eq('tracking_system_id', user.systemId);

      if (error) throw error;
      
      setEntries(entries.map(e => {
        if (e.id === id) {
          return { 
            ...e, 
            devotee_id: devoteeId, 
            date, 
            mangla, 
            japa, 
            lecture,
            temple_visit: templeVisit,
            temple_visit_type: templeVisitType,
            devotee_name: devotee?.name
          };
        }
        return e;
      }));
      
      return true;
    } catch (error) {
      console.error('Error updating entry:', error);
      return false;
    }
  };

  const deleteEntry = async (id: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id)
        .eq('tracking_system_id', user.systemId);

      if (error) throw error;
      
      setEntries(entries.filter(e => e.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting entry:', error);
      return false;
    }
  };

  const updateSystemSettings = async (updates: Partial<System>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('systems')
        .update(updates)
        .eq('id', user.systemId);

      if (error) throw error;
      
      if (system) {
        const updatedSystem = { ...system, ...updates };
        setSystem(updatedSystem);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating system settings:', error);
      return false;
    }
  };

  return (
    <SystemContext.Provider value={{
      system,
      devotees,
      entries,
      loadSystem,
      loadDevotees,
      loadEntries,
      addDevotee,
      updateDevotee,
      deleteDevotee,
      addEntry,
      updateEntry,
      deleteEntry,
      updateSystemSettings
    }}>
      {children}
    </SystemContext.Provider>
  );
};

export default SystemProvider;