import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Alert, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { auth, firestore } from './firebase'; 
import { doc, setDoc, getDoc } from 'firebase/firestore';
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
      setLoading(true);  
      Animated.spring(scaleAnim, {
        toValue: 1,  
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
              apikey: '413f6580ab4d11ef84c965d8c9fc1f19',
            },
          }
        );
  
        const receiptData = response.data;
  
        if (receiptData.totalAmount?.data === 0) {
          Alert.alert('Warning', 'This is not a receipt.');
          return;
        }
  
        await saveReceiptToFirestore(receiptData);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 400) {
          Alert.alert('Warning', 'This is not a receipt.');
        } else {
          console.error('Error capturing or processing the receipt:', error);
        }
      } finally {
        setLoading(false);
        Animated.spring(scaleAnim, {
          toValue: 0,
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
  
      const receiptAmountData = receiptData.totalAmount?.data || 0;
      const confidenceLevel = receiptData.totalAmount?.confidence || 0; 
  
      if (receiptAmountData === 0) {
        console.warn('Receipt total amount is 0, not adding to database.');
        Alert.alert('Warning', 'This is not a receipt.');
        return;
      }
  
      const adjustedReceiptAmount = receiptAmountData + 0.00000000001;
  
      const receiptDocument = {
        date: receiptData.date || null,
        totalAmount: {
          data: adjustedReceiptAmount, 
          confidence: confidenceLevel, 
        },
      };
  
      const userReceiptsRef = doc(firestore, 'users-receipts', userId);
      const userReceiptsSnapshot = await getDoc(userReceiptsRef);
      const receipts = userReceiptsSnapshot.data() || {};
      
      const startingReceiptNumber = 9999;
      const nextReceiptNumber = startingReceiptNumber - Object.keys(receipts).length;
  
      const formattedReceiptNumber = `Receipt ${String(nextReceiptNumber)}`;
  
      await setDoc(
        userReceiptsRef,
        { [formattedReceiptNumber]: receiptDocument }, 
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
      const newIncome = currentIncome - adjustedReceiptAmount;
  
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
              <TouchableOpacity style={styles.transparentButton} onPress={handleCapture} />
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
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    margin: 10,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 30,
  },
  transparentButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#282c34',
  },
  loadingIndicator: {
    alignItems: 'center',
    backgroundColor: '#282c34',
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
