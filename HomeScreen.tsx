import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ImageBackground,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { firestore } from './firebase';
import { LineChart } from 'react-native-chart-kit';

const HomeScreen = () => {
  const [username, setUsername] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [latestPurchase, setLatestPurchase] = useState(null);
  const [biggestPurchase, setBiggestPurchase] = useState(null);
  const [isFormVisible, setFormVisible] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [formSlideAnim] = useState(new Animated.Value(0));
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const loadProfileData = async () => {
      const storedUsername = await AsyncStorage.getItem('username');
      setUsername(storedUsername || 'User');

      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.log('User ID not found');
        return;
      }

      const userDocRef = doc(firestore, 'users', userId);
      onSnapshot(userDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data();
          setMonthlyIncome(userData.monthlyIncome?.toFixed(2) || '0');
        } else {
          console.log('No such user document!');
        }
      });
    };

    const loadReceiptsData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          console.log('User ID not found');
          return;
        }

        const userReceiptsRef = doc(firestore, 'users-receipts', userId);
        onSnapshot(userReceiptsRef, (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.data();
            const receipts = Object.values(userData).map((receipt) => ({
              date: receipt.date?.data,
              totalAmount: receipt.totalAmount?.data ? parseFloat(receipt.totalAmount.data) : 0,
            }));

            const latest = receipts.reduce((latestReceipt, receipt) => {
              return !latestReceipt || new Date(receipt.date) > new Date(latestReceipt.date)
                ? receipt
                : latestReceipt;
            }, null);

            const biggest = receipts.reduce((maxReceipt, receipt) => {
              return !maxReceipt || receipt.totalAmount > maxReceipt.totalAmount
                ? receipt
                : maxReceipt;
            }, null);

            setLatestPurchase(latest ? `${latest.totalAmount.toFixed(2)} BGN` : 'No data');
            setBiggestPurchase(biggest ? `${biggest.totalAmount.toFixed(2)} BGN` : 'No data');

            const sortedReceipts = receipts.sort((a, b) => new Date(a.date) - new Date(b.date));
            const data = sortedReceipts.map((receipt) => receipt.totalAmount);

            setChartData({
              labels: [],
              datasets: [
                {
                  data,
                  strokeWidth: 3,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                },
              ],
            });
          } else {
            console.log('No receipts data found!');
          }
        });
      } catch (error) {
        console.log('Error fetching receipts:', error);
      }
    };

    loadProfileData();
    loadReceiptsData();
  }, []);

  const toggleForm = () => {
    setFormVisible(!isFormVisible);

    Animated.timing(formSlideAnim, {
      toValue: isFormVisible ? 0 : 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const saveProfile = async () => {
    try {
      const incomeValue = parseFloat(monthlyIncome);

      if (isNaN(incomeValue) || incomeValue < 1 || incomeValue > 6600) {
        alert('Your monthly income cannot exceed 6600. Please contact Spendly admins to resolve the issue.');
        return; // Prevent further execution if the income is too high
      }

      const formattedIncome = parseFloat(monthlyIncome).toFixed(2);

      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('monthlyIncome', formattedIncome);

      const userId = await AsyncStorage.getItem('userId');

      if (userId) {
        const userRef = doc(firestore, 'users', userId);
        await updateDoc(userRef, {
          username: username,
          monthlyIncome: parseFloat(formattedIncome),
        });

        setMonthlyIncome(formattedIncome);

        console.log('Profile updated in Firestore');
      } else {
        console.log('User ID not found');
      }

      toggleForm();
    } catch (error) {
      console.log('Error saving profile:', error);
    }
  };

  const logout = async () => {
    await AsyncStorage.clear();
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1 }}
    >
    <ImageBackground
      source={require('./assets/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.editButton} onPress={toggleForm}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcomeText}>Welcome</Text>
        <Text style={styles.usernameText}>{username}</Text>

        <View style={styles.balanceContainer}>
          <Text style={styles.balance}>{parseFloat(monthlyIncome).toFixed(2)}</Text>
          <Text style={styles.currency}>BGN</Text>
        </View>

        {/* Chart and Purchases */}
          <View style={styles.chartCard}>
            {chartData ? (
              <LineChart
                data={chartData}
                width={Dimensions.get('window').width - 60} // Proper padding adjustment
                height={220}
                chartConfig={{
                  backgroundColor: 'transparent',
                  backgroundGradientFrom: '#3b3b3b',
                  backgroundGradientTo: '#5a5a5a',
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  propsForDots: { r: '5', strokeWidth: '2', stroke: '#00FF00' },
                }}
                bezier
                style={styles.chart}
              />
            ) : (
              <Text style={styles.noDataText}>No purchase data available.</Text>
            )}
          </View>

          <View style={styles.purchaseCards}>
            <View style={styles.purchaseCard}>
              <Text style={styles.cardTitle}>Latest Purchase</Text>
              <Text style={styles.cardValue}>{latestPurchase}</Text>
            </View>
            <View style={styles.purchaseCard}>
              <Text style={styles.cardTitle}>Biggest Purchase</Text>
              <Text style={styles.cardValue}>{biggestPurchase}</Text>
            </View>
          </View>
      </ScrollView>

      {/* Edit Profile Form */}
      <Animated.View
        style={[
          styles.formContainer,
          {
            transform: [
              {
                translateY: formSlideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [Dimensions.get('window').height, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.inputLabel}>Username</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} />
        <Text style={styles.inputLabel}>Monthly Income</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={monthlyIncome}
          onChangeText={setMonthlyIncome}
        />
        <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </Animated.View>
      </View>
    </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  logoutButton: {
    backgroundColor: '#FD7C20',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#3B3B3B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    color: '#fff',
    marginTop: 50,
  },
  usernameText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  balance: {
    fontSize: 48,
    fontWeight: '800',
    color: '#D9D9D9',
  },
  currency: {
    fontSize: 20,
    color: '#00D048',
    marginLeft: 5,
  },
  chartCard: {
    marginTop: 70,
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
    width: '100%',
  },
  chart: {
    borderRadius: 15,
  },
  noDataText: {
    color: '#fff',
    textAlign: 'center',
  },
  purchaseCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  purchaseCard: {
    backgroundColor: '#3B3B3B',
    borderRadius: 15,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    height: 115,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D9D9D9',
    marginBottom: 10,
  },
  cardValue: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: '800',
    color: '#D9D9D9',
  },
  formContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#424242',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  inputLabel: {
    color: '#ccc',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#555',
    borderRadius: 10,
    padding: 10,
    color: 'white',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#00D048',
    borderRadius: 10,
    alignItems: 'center',
    padding: 12,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default HomeScreen;
