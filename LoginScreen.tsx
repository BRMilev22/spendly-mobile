// LoginScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Text, Image, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

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
});

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const navigation = useNavigation(); // Get the navigation object

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setUserId(user.uid); // Store the user ID in state
      setError('');
      console.log('Logged in');
      navigation.navigate('Receipt'); // Navigate to ReceiptScreen
    } catch (err) {
      setError(err.message);
      setUserId(null); // Clear user ID if login fails
    }
  };

  return (
    <ImageBackground
        source={require('./assets/background.png')}
        style={styles.background}
        resizeMode="cover"
    >
      <StyledView className="items-center justify-center flex-1 relative">
        <StyledImage className="bottom-16" source={require('./assets/login-img.png')} style={styles.logo} />

        <View style={styles.claymorphicCard}>
          {/* Centered Login with lines */}
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
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Sign In Button */}
          <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
            <Text style={styles.signInButtonText}>Sign in</Text>
          </TouchableOpacity>

          {/* Display the user ID if logged in */}
          {userId && <Text style={styles.userIdText}>User ID: {userId}</Text>}
        </View>
      </StyledView>
    </ImageBackground>
  );
};

export default LoginScreen;
