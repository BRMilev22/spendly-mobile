import React, { useEffect, useState, useRef } from 'react';
import { Button, StyleSheet, Text, Image, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import tailwindConfig from './tailwind.config';
import axios from 'axios';

const ReceiptScreen = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [permissionResponse, requestPermission] = useCameraPermissions(); // Get camera permissions
  const cameraRef = useRef<Camera | null>(null); // Create a ref for the camera

  // Request camera permission on component mount
  useEffect(() => {
    const requestCameraPermission = async () => {
      if (permissionResponse?.status !== 'granted') {
        const { status } = await requestPermission();
        console.log('Camera permission status:', status);
      }
    };

    requestCameraPermission();
  }, [permissionResponse, requestPermission]);

  // Updated handleCapture function
  const handleCapture = async () => {
    if (cameraRef.current) {
      // Define options for takePictureAsync
      const options = {
        skipProcessing: false, // Set to true if you want to skip processing
        base64: true, // Include base64 string in the response if needed
      };

      try {
        const photoData = await cameraRef.current.takePictureAsync(options); // Capture the photo
        setPhoto(photoData.uri); // Update photo state

        // Call Taggun API with the captured image
        const formData = new FormData();
        formData.append('file', {
          uri: photoData.uri,
          type: 'image/jpeg',
          name: 'receipt.jpg',
        });

        const response = await axios.post('https://api.taggun.io/api/receipt', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-api-key': 'YOUR_TAGGUN_API_KEY',
          },
        });
        setResult(response.data); // Handle the response as needed
      } catch (error) {
        console.error(error);
      }
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
          <View style={styles.buttonContainer}>
            <Button title="Take a photo" onPress={handleCapture} />
          </View>
          {photo && <Image source={{ uri: photo }} style={styles.preview} />}
        </CameraView>
      )}
      {result && <Text>{JSON.stringify(result)}</Text>}
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
});

export default ReceiptScreen;

