// LoginScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { styled } from 'nativewind';
import tailwindConfig from './tailwind.config';

const StyledView = styled(View);
const StyledText = styled(Text);

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Logged in')
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <StyledView className='items-center justify-center'>
      <StyledText className='text-red mx-2 text-sm'>Sign In With Google</StyledText>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {error ? <Text>{error}</Text> : null}
      <Button title="Login" onPress={handleLogin} />
    </StyledView>
  );
};

export default LoginScreen;
