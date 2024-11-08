import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Alert, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { auth, firestore } from './firebase'; // Import Firebase authentication and Firestore
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import axios from 'axios';

const ReceiptScreen = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [permissionResponse, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<Camera | null>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const requestCameraPermission = async () => {
      if (permissionResponse?.status !== 'granted') {
        const { status } = await requestPermission();
        console.log('Camera permission status:', status);
      }
    };

    requestCameraPermission();
  }, [permissionResponse, requestPermission]);

  const handleCapture = async () => {
    if (cameraRef.current) {
      setLoading(true);  // Set loading to true immediately
      Animated.spring(scaleAnim, {
        toValue: 1,  // Scale to full size
        friction: 2,
        useNativeDriver: true,
      }).start();
  
      const options = { skipProcessing: false, base64: true };
      try {
        const photoData = await cameraRef.current.takePictureAsync(options);
        const formData = new FormData();
        formData.append('file', {
          uri: photoData.uri,
          type: 'image/jpeg',
          name: 'receipt.jpg',
        });
  
        const response = await axios.post(
          'https://api.taggun.io/api/receipt/v1/simple/file',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              accept: 'application/json',
              apikey: 'd4465e4090b011efb0f8efd54ea213cb',
            },
          }
        );
  
        const receiptData = response.data;
  
        // Check for the totalAmount to validate receipt
        if (receiptData.totalAmount?.data === 0) {
          Alert.alert('Warning', 'This is not a receipt.');
          return;
        }
  
        await saveReceiptToFirestore(receiptData);
      } catch (error) {
        // Check for Axios error response status
        if (axios.isAxiosError(error) && error.response?.status === 400) {
          Alert.alert('Warning', 'This is not a receipt.');
        } else {
          console.error('Error capturing or processing the receipt:', error);
        }
      } finally {
        // Ensure loading state is updated and camera view is resumed
        setLoading(false);
        Animated.spring(scaleAnim, {
          toValue: 0,  // Scale back to original size
          friction: 2,
          useNativeDriver: true,
        }).start();
      }
    }
  };
  

  const saveReceiptToFirestore = async (receiptData: any) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('User is not authenticated');
        return;
      }
  
      // Get the total amount and confidence from the receipt data
      const receiptAmountData = receiptData.totalAmount?.data || 0;
      const confidenceLevel = receiptData.totalAmount?.confidence || 0; // Adjust if the confidence level field differs
  
      // Check if the receipt total amount is 0, if so, exit early
      if (receiptAmountData === 0) {
        console.warn('Receipt total amount is 0, not adding to database.');
        Alert.alert('Warning', 'This is not a receipt.');
        return;
      }
  
      // Add a very small value to the receipt amount
      const adjustedReceiptAmount = receiptAmountData + 0.00000000001;
  
      // Structure the receipt document as a map with confidence and data
      const receiptDocument = {
        date: receiptData.date || null,
        totalAmount: {
          data: adjustedReceiptAmount, // Save the adjusted amount
          confidence: confidenceLevel, // Save the confidence level
        },
      };
  
      const userReceiptsRef = doc(firestore, 'users-receipts', userId);
      const userReceiptsSnapshot = await getDoc(userReceiptsRef);
      const receipts = userReceiptsSnapshot.data() || {};
      
      // Start from 9999 and decrement based on the number of existing receipts
      const startingReceiptNumber = 9999;
      const nextReceiptNumber = startingReceiptNumber - Object.keys(receipts).length;
  
      // Format the receipt number to have leading zeros (e.g., Receipt 9999)
      const formattedReceiptNumber = `Receipt ${String(nextReceiptNumber)}`;
  
      await setDoc(
        userReceiptsRef,
        { [formattedReceiptNumber]: receiptDocument }, // Use formatted receipt number
        { merge: true }
      );
  
      const userRef = doc(firestore, 'users', userId);
      const userSnapshot = await getDoc(userRef);
      const userData = userSnapshot.data();
  
      if (!userData || typeof userData.monthlyIncome !== 'number') {
        console.error('Monthly income data is missing or invalid');
        return;
      }
  
      const currentIncome = userData.monthlyIncome;
      const newIncome = currentIncome - adjustedReceiptAmount; // Use the adjusted amount
  
      await setDoc(userRef, { monthlyIncome: newIncome }, { merge: true });
  
      console.log('Receipt saved and monthly income updated in Firestore');
      Alert.alert('Success', 'Receipt saved and user balance updated');
    } catch (error) {
      console.error('Error saving receipt or updating monthly income:', error);
    }
  };
  
  
  
  
  return (
    <View style={styles.container}>
      {permissionResponse === null ? (
        <Text>Requesting for camera permission</Text>
      ) : permissionResponse?.status === 'denied' ? (
        <Text>No access to camera</Text>
      ) : (
        <CameraView style={styles.camera} ref={cameraRef}>
          {loading ? (
            <View style={styles.loadingOverlay}>
              <Animated.View style={[styles.loadingIndicator, { transform: [{ scale: scaleAnim }] }]}>
                <ActivityIndicator size="large" color="#FD7C20" />
                <Text style={styles.loadingText}>Processing...</Text>
              </Animated.View>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
                <View style={styles.innerCircle} />
              </TouchableOpacity>
            </View>
          )}
        </CameraView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 30,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FD7C20',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#282c34',  // Dark background color
  },
  loadingIndicator: {
    alignItems: 'center',
    backgroundColor: '#282c34',  // Same as overlay to blend in
    padding: 20,
    borderRadius: 10,
  },
  loadingText: {
    marginTop: 10,
    color: '#FD7C20',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReceiptScreen;
