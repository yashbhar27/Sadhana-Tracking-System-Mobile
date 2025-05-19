import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useSystem } from '../contexts/SystemContext';
import { UserPlus, ClipboardList } from 'lucide-react-native';

export default function HomeScreen() {
  const { system, devotees } = useSystem();

  // Sort devotees: residents first, then non-residents
  const sortedDevotees = [...devotees].sort((a, b) => {
    if (a.is_resident === b.is_resident) {
      return a.name.localeCompare(b.name);
    }
    return a.is_resident ? -1 : 1;
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Home</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sadhana Tracking System</Text>
        <Text style={styles.cardDescription}>
          Track daily devotional activities including Mangla Arti, Japa, and Lecture attendance.
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <UserPlus size={24} color="white" />
            <Text style={styles.buttonText}>Add New Devotee</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => {}}>
            <ClipboardList size={24} color="white" />
            <Text style={styles.buttonText}>Mark Attendance</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Registered Devotees</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Total: {devotees.length}</Text>
          </View>
        </View>
        
        {sortedDevotees.map((devotee) => (
          <View key={devotee.id} style={styles.devoteeItem}>
            <View>
              <Text style={styles.devoteeName}>{devotee.name}</Text>
              <View style={[
                styles.statusBadge,
                devotee.is_resident ? styles.residentBadge : styles.nonResidentBadge
              ]}>
                <Text style={[
                  styles.statusText,
                  devotee.is_resident ? styles.residentText : styles.nonResidentText
                ]}>
                  {devotee.is_resident ? 'Resident' : 'Non-Resident'}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    backgroundColor: '#f97316',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#3b82f6',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#fff7ed',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    color: '#9a3412',
    fontSize: 12,
    fontWeight: '500',
  },
  devoteeItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  devoteeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  residentBadge: {
    backgroundColor: '#dcfce7',
  },
  nonResidentBadge: {
    backgroundColor: '#dbeafe',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  residentText: {
    color: '#166534',
  },
  nonResidentText: {
    color: '#1e40af',
  },
});