// Inside LoginScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Text, Image, StyleSheet, ImageBackground, TouchableOpacity, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from './firebase';
import { doc, getDoc } from 'firebase/firestore';  
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  background: {
    flex: 1,
  },
  claymorphicCard: {
    backgroundColor: 'rgba(66, 66, 66, 0.5)',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400, // Set a maximum width for larger screens
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  logo: {
    width: 192,
    height: 128,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderBottomWidth: 2,
    borderBottomColor: '#636363',
    marginBottom: 20,
    color: 'white',
    paddingVertical: 10, // Add padding for a larger tap area
    fontSize: 16, // Increase font size for better readability
  },  
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  signInButton: {
    backgroundColor: '#FD7C20', // Orange color
    borderRadius: 8,
    padding: 12,
    width: '100%', // Make the button full width
    alignItems: 'center',
    marginTop: 10,
  },
  signInButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#636363', // Line color
    marginHorizontal: 10,
  },
  userIdText: {
    color: 'white',
    marginTop: 20,
    fontWeight: 'bold',
  },
  registerText: {
    color: '#00D048', // Green color
    marginTop: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation(); // Get the navigation object

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setError('');
  
      await AsyncStorage.setItem('userId', user.uid);

      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
  
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const { username, monthlyIncome } = userData;
  
        await AsyncStorage.setItem('username', username);
        await AsyncStorage.setItem('monthlyIncome', monthlyIncome.toString());
  
        console.log('Logged in and user data saved');
        navigation.replace('App');
      } else {
        setError('User data not found');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ImageBackground
            source={require('./assets/background.png')}
            style={styles.background}
            resizeMode="cover"
        >
          <StyledView className="items-center justify-center flex-1 relative">
            <StyledImage className="bottom-16" source={require('./assets/login-img.png')} style={styles.logo} />

            <View style={styles.claymorphicCard}>
              <View style={styles.loginContainer}>
                <View style={styles.line} />
                <StyledText className="text-white font-bold">Login</StyledText>
                <View style={styles.line} />
              </View>

              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardAppearance="dark"
                textContentType="oneTimeCode"
              />

              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                autoCapitalize="none" 
                autoCorrect={false} 
                keyboardAppearance="dark"
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
                <Text style={styles.signInButtonText}>Sign in</Text>
              </TouchableOpacity>

              {/* Navigate to Register Screen */}
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerText}>Don't have an account? Sign Up</Text>
              </TouchableOpacity>

            </View>
          </StyledView>
        </ImageBackground>
      </KeyboardAvoidingView>
    </>
  );
};

export default LoginScreen;
