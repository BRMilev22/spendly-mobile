import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ImageBackground, StyleSheet } from 'react-native';
import { doc, getDoc, onSnapshot } from 'firebase/firestore'; 
import { firestore } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HistoryScreen = () => {
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          console.error('User ID not found');
          return;
        }

        const userDocRef = doc(firestore, 'users-receipts', userId);

        const unsubscribe = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();

            const receiptsData = Object.keys(userData)
              .map(receiptKey => {
                const receipt = userData[receiptKey];
                return {
                  id: receiptKey,
                  date: receipt.date?.data,
                  totalAmount: receipt.totalAmount?.data
                    ? parseFloat(receipt.totalAmount.data).toFixed(2)
                    : null,
                };
              })
              .sort((a, b) => parseInt(a.id.split(' ')[1]) - parseInt(b.id.split(' ')[1])); 

            setReceipts(receiptsData);
          } else {
            console.log('No such user document!');
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching receipts:', error);
      }
    };

    fetchReceipts();
  }, []);

  return (
    <ImageBackground
      source={require('./assets/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>History of Purchase</Text>
        <ScrollView style={styles.scrollView}>
          {receipts.map((receipt) => (
            <View key={receipt.id} style={styles.receiptContainer}>
              <Text style={styles.amountText}>
                {receipt.totalAmount !== null ? `${receipt.totalAmount} BGN` : 'No amount available'}
              </Text>
              <Text style={styles.dateText}>
                {receipt.date ? new Date(receipt.date).toLocaleDateString() : 'No date available'}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    color: 'white',
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  receiptContainer: {
    marginVertical: 10,
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
  },
  amountText: {
    color: 'white',
    fontSize: 18,
  },
  dateText: {
    color: '#999',
  },
});

export default HistoryScreen;
