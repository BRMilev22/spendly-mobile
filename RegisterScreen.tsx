import React, { useState } from 'react';
import { View, TextInput, Text, Image, StyleSheet, ImageBackground, TouchableOpacity, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from './firebase';
import { doc, setDoc } from 'firebase/firestore';  
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
    maxWidth: 400, 
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
    paddingVertical: 10, 
    fontSize: 16, 
  },  
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  signInButton: {
    backgroundColor: '#FD7C20', 
    borderRadius: 8,
    padding: 12,
    width: '100%', 
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
    backgroundColor: '#636363', 
    marginHorizontal: 10,
  },
  userIdText: {
    color: 'white',
    marginTop: 20,
    fontWeight: 'bold',
  },
});

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setError('');

      await setDoc(doc(firestore, 'users', user.uid), {
        username: username,
        email: email,
        monthlyIncome: 0,
      });

      await AsyncStorage.setItem('userId', user.uid);
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('email', email);

      console.log('User registered successfully');

      navigation.replace('App');
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
                <StyledText className="text-white font-bold">Register</StyledText>
                <View style={styles.line} />
              </View>

              <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardAppearance="dark"
              />

              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardAppearance="dark"
                textContentType="emailAddress"
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

              <TouchableOpacity style={styles.signInButton} onPress={handleRegister}>
                <Text style={styles.signInButtonText}>Sign Up</Text>
              </TouchableOpacity>

            </View>
          </StyledView>
        </ImageBackground>
      </KeyboardAvoidingView>
    </>
  );
};

export default RegisterScreen;
