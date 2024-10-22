// ReceiptScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Button, StyleSheet, Text, Image, View, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { auth, firestore } from './firebase'; // Import Firebase authentication and Firestore
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'; // Import Firestore functions
import axios from 'axios';

const ReceiptScreen = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false); // State to track loading status
  const [permissionResponse, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<Camera | null>(null);

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
      setLoading(true); // Set loading state to true when starting the process
      const options = { skipProcessing: false, base64: true };
      try {
        const photoData = await cameraRef.current.takePictureAsync(options);
        setPhoto(photoData.uri);

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
        setResult(receiptData);
        await saveReceiptToFirestore(receiptData);
      } catch (error) {
        console.error('Error capturing or processing the receipt:', error);
      } finally {
        setLoading(false); // Set loading state to false once the process is completed
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

      const receiptDocument = {
        date: receiptData.date || null,
        totalAmount: receiptData.totalAmount || null,
      };

      const userReceiptsRef = doc(firestore, 'users-receipts', userId);
      const userReceiptsSnapshot = await getDoc(userReceiptsRef);
      const receipts = userReceiptsSnapshot.data() || {};
      const nextReceiptNumber = Object.keys(receipts).length + 1;

      await setDoc(
        userReceiptsRef,
        { [`Receipt ${nextReceiptNumber}`]: receiptDocument },
        { merge: true }
      );

      console.log('Receipt saved to Firestore');
      Alert.alert('Success', 'Receipt saved to Firestore');
    } catch (error) {
      console.error('Error saving receipt to Firestore:', error);
    }
  };

  return (
    <View style={styles.container}>
      {permissionResponse === null ? (
        <Text>Requesting for camera permission</Text>
      ) : permissionResponse?.status === 'denied' ? (
        <Text>No access to camera</Text>
      ) : (
        <>
          <CameraView style={styles.camera} ref={cameraRef}>
            <View style={styles.buttonContainer}>
              <Button title="Take a photo" onPress={handleCapture} />
            </View>
            {photo && <Image source={{ uri: photo }} style={styles.preview} />}
          </CameraView>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FD7C20" />
              <Text style={styles.loadingText}>Processing...</Text>
            </View>
          )}
        </>
      )}
      {/* Commented out result display, only log it to console */}
      {/* {result && <Text>{JSON.stringify(result)}</Text>} */}
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
  },
  preview: {
    width: 100,
    height: 100,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#FD7C20',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReceiptScreen;
