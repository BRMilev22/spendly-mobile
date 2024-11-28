import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ImageBackground, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore'; 
import { firestore } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HistoryScreen = () => {
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [sortOrder, setSortOrder] = useState('date'); // 'date' or 'amount'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          console.log('User ID not found');
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
                  details: receipt.details,  // assuming you have a 'details' field for each receipt
                };
              })
              .sort((a, b) => parseInt(a.id.split(' ')[1]) - parseInt(b.id.split(' ')[1])); 

            setReceipts(receiptsData);
            setFilteredReceipts(receiptsData); // Initialize filtered receipts
          } else {
            console.log('No such user document!');
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.log('Error fetching receipts:', error);
      }
    };

    fetchReceipts();
  }, []);

  useEffect(() => {
    const filterAndSortReceipts = () => {
      let filtered = [...receipts];

      if (sortOrder === 'date') {
        filtered = filtered.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        });
      } else if (sortOrder === 'amount') {
        filtered = filtered.sort((a, b) => {
          const amountA = parseFloat(a.totalAmount);
          const amountB = parseFloat(b.totalAmount);
          return sortDirection === 'asc' ? amountA - amountB : amountB - amountA;
        });
      }

      setFilteredReceipts(filtered);
    };

    filterAndSortReceipts();
  }, [sortOrder, sortDirection, receipts]);

  const handleSortChange = (order: string) => {
    if (sortOrder === order) {
      // Toggle the sort direction if the same criteria is selected again
      setSortDirection(prevDirection => (prevDirection === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortOrder(order);
      setSortDirection('desc'); // Default to descending when changing sort criteria
    }
  };

  const handleReceiptClick = (receiptId: string) => {
    // Navigate to a detailed receipt screen or show a modal with details
    console.log('Show details for receipt: ', receiptId);
  };

  return (
    <ImageBackground
      source={require('./assets/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>History of Purchase</Text>

        {/* Sort Buttons */}
        <View style={styles.sortButtons}>
          <TouchableOpacity
            onPress={() => handleSortChange('date')}
            style={[
              styles.sortButton,
              sortOrder === 'date' && styles.activeSortButton,  // Conditionally apply active style
            ]}
          >
            <Text style={styles.sortButtonText}>Sort by Date {sortDirection === 'asc' ? '↑' : '↓'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSortChange('amount')}
            style={[
              styles.sortButton,
              sortOrder === 'amount' && styles.activeSortButton,  // Conditionally apply active style
            ]}
          >
            <Text style={styles.sortButtonText}>Sort by Amount {sortDirection === 'asc' ? '↑' : '↓'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          {filteredReceipts.map((receipt) => (
            <TouchableOpacity key={receipt.id} onPress={() => handleReceiptClick(receipt.id)}>
              <View style={styles.receiptContainer}>
                <View style={styles.receiptContent}>
                  <View style={styles.receiptDetails}>
                    <Text style={styles.amountText}>
                      {receipt.totalAmount !== null ? `${receipt.totalAmount} BGN` : 'No amount available'}
                    </Text>
                    {/* Line below the amount */}
                    <View style={styles.breakLine} />
                    {/* "Receipt" label below the line */}
                    <Text style={styles.receiptText}>Receipt</Text>
                    <Text style={styles.dateText}>
                      {receipt.date ? new Date(receipt.date).toLocaleDateString() : 'No date available'}
                    </Text>
                  </View>

                  {/* QR Code Image */}
                  <Image
                    source={require('./assets/qr-code.png')} // Path to your QR code image
                    style={styles.qrCodeImage}
                  />
                </View>
              </View>
            </TouchableOpacity>
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
  sortButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  sortButton: {
    backgroundColor: '#555',
    padding: 10,
    borderRadius: 8,
  },
  activeSortButton: {
    backgroundColor: '#00D048',  // Green color for active filter
  },
  sortButtonText: {
    color: 'white',
    fontSize: 16,
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
  receiptContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptDetails: {
    flex: 1,
  },
  breakLine: {
    height: 2,
    backgroundColor: '#fff', // Adjust the color as needed
    marginVertical: 10,
    width: '60%',
  },
  receiptText: {
    color: '#fff', // Adjust the text color
    marginBottom: 10,
    fontSize: 14, // Smaller font size for the label
    textAlign: 'left',
  },
  amountText: {
    color: 'white',
    fontSize: 24,
  },
  dateText: {
    color: '#999',
  },
  qrCodeImage: {
    width: 100,
    height: 100,
    marginLeft: 10,
    borderRadius: 12,
  },
});

export default HistoryScreen;
