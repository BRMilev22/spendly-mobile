import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Modal, StyleSheet, Alert, ImageBackground, Platform } from 'react-native';
import { firestore } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, onSnapshot, deleteField } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Timestamp } from 'firebase/firestore';

const RemindersScreen = () => {
  const [reminders, setReminders] = useState([]);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDescription, setReminderDescription] = useState('');
  const [reminderDueDate, setReminderDueDate] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      const userRemindersRef = doc(firestore, 'users-reminders', userId);
      const unsubscribe = onSnapshot(userRemindersRef, (docSnapshot) => {
        const data = docSnapshot.data();
        if (data) {
          const sortedReminders = Object.entries(data).sort(([a], [b]) => b - a);
          setReminders(sortedReminders);
        }
      });
      return () => unsubscribe();
    }
  }, [userId]);

  const handleAddReminder = async () => {
    if (!reminderTitle || !reminderDueDate) {
      Alert.alert('Please fill in the title and due date');
      return;
    }
    if (reminderDueDate < new Date()) {
      Alert.alert('Please select a future date for the reminder');
      return;
    }
  
    const newReminderData = {
      title: reminderTitle,
      description: reminderDescription || '',
      dueDate: Timestamp.fromDate(reminderDueDate),
      createdAt: new Date(),
    };
  
    try {
      if (userId) {
        const userRemindersRef = doc(firestore, 'users-reminders', userId);
        const userDoc = await getDoc(userRemindersRef);
  
        if (userDoc.exists()) {
          const data = userDoc.data();
          const existingIds = Object.keys(data).map(Number);
          let nextId = existingIds.length > 0 ? Math.min(...existingIds) - 1 : 9999;
  
          await updateDoc(userRemindersRef, {
            [nextId]: newReminderData,
          });
        } else {
          await setDoc(userRemindersRef, {
            9999: newReminderData,
          });
        }
  
        setReminderTitle('');
        setReminderDescription('');
        setReminderDueDate(new Date());
        setIsModalVisible(false);
  
      } else {
        Alert.alert('User ID not found');
      }
    } catch (error) {
      console.error('Error adding reminder: ', error);
      Alert.alert('Error adding reminder');
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    try {
      if (userId) {
        const userRemindersRef = doc(firestore, 'users-reminders', userId);
        const userDoc = await getDoc(userRemindersRef);

        if (userDoc.exists()) {
          await updateDoc(userRemindersRef, {
            [reminderId]: deleteField(),
          });
        } else {
          Alert.alert('No reminders found');
        }
      } else {
        Alert.alert('User ID not found');
      }
    } catch (error) {
      console.error('Error deleting reminder: ', error);
      Alert.alert('Error deleting reminder');
    }
  };

  const showDateTimePicker = () => {
    setShowDatePicker(true);
  };

  const onDateTimeChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setReminderDueDate(selectedDate);
    }
  };

  const formatDueDate = (timestamp) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date();
    return date instanceof Date && !isNaN(date) ? date.toLocaleString() : 'Invalid date';
  };

  return (
    <ImageBackground source={require('./assets/background.png')} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.header}>Reminders</Text>
          <View style={styles.addButton}>
            <Button title="Add Reminder" onPress={() => setIsModalVisible(true)} color="#48BB78" />
          </View>
          <Modal visible={isModalVisible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalHeader}>Add a New Reminder</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Title"
                  value={reminderTitle}
                  onChangeText={setReminderTitle}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Description (optional)"
                  value={reminderDescription}
                  onChangeText={setReminderDescription}
                />
                <TouchableOpacity onPress={showDateTimePicker} style={styles.datePickerButton}>
                  <Text style={styles.datePickerText}>{`Due Date: ${reminderDueDate.toLocaleString()}`}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={reminderDueDate}
                    mode="datetime"
                    is24Hour={true}
                    display={'default'}
                    onChange={onDateTimeChange}
                    minimumDate={new Date()}
                  />
                )}
                <View style={styles.modalButtons}>
                  <Button title="Save" onPress={handleAddReminder} color="#48BB78" />
                  <Button title="Cancel" onPress={() => setIsModalVisible(false)} color="#FD7C20" />
                </View>
              </View>
            </View>
          </Modal>
          <FlatList
            data={reminders}
            keyExtractor={(item, index) => item[0]}
            renderItem={({ item, index }) => (
              <View style={styles.reminderItem}>
                <Text style={styles.reminderTitle}>{item[1].title}</Text>
                {item[1].description ? <Text style={styles.reminderText}>{item[1].description}</Text> : null}
                <Text style={styles.reminderDueDate}>{`Due: ${formatDueDate(item[1].dueDate)}`}</Text>
                <TouchableOpacity onPress={() => handleDeleteReminder(item[0])}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#444',
    color: 'white',
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 15,
    width: '80%',
  },
  modalHeader: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  datePickerButton: {
    padding: 10,
    backgroundColor: '#444',
    borderRadius: 10,
    marginVertical: 10,
  },
  datePickerText: {
    color: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  reminderItem: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  reminderTitle: {
    fontSize: 18,
    color: 'white',
  },
  reminderText: {
    color: '#888',
  },
  reminderDueDate: {
    color: '#888',
  },
  deleteText: {
    color: '#FD7C20',
    marginTop: 10,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  addButton: {
    marginBottom: 20,
    borderRadius: 10, // Less rounded corners
    overflow: 'hidden',
  },
});

export default RemindersScreen;
