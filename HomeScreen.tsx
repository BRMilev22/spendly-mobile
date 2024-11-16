import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Button, TextInput, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { firestore } from './firebase';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const HomeScreen = () => {
  const [username, setUsername] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [latestPurchase, setLatestPurchase] = useState(null);
  const [biggestPurchase, setBiggestPurchase] = useState(null);
  const [isFormVisible, setFormVisible] = useState(false); // Form is hidden by default
  const [chartData, setChartData] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const loadProfileData = async () => {
      const storedUsername = await AsyncStorage.getItem('username');
      setUsername(storedUsername || 'User');
      
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found');
        return;
      }
  
      const userDocRef = doc(firestore, 'users', userId);
      onSnapshot(userDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data();
          setMonthlyIncome(userData.monthlyIncome?.toFixed(2) || '0');
        } else {
          console.error("No such user document!");
        }
      });
    };

    const loadReceiptsData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          console.error('User ID not found');
          return;
        }

        const userReceiptsRef = doc(firestore, 'users-receipts', userId);
        onSnapshot(userReceiptsRef, (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.data();
            const receipts = Object.values(userData).map(receipt => ({
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

            const data = sortedReceipts.map(receipt => receipt.totalAmount);

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
            //console.error("No receipts data found!");
          }
        });
      } catch (error) {
        console.error('Error fetching receipts:', error);
      }
    };

    loadProfileData();
    loadReceiptsData();
  }, []);

  const toggleForm = () => {
    setFormVisible(!isFormVisible);
  };

  const saveProfile = async () => {
    try {
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
        console.error('User ID not found');
      }

      toggleForm();
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const logout = async () => {
    await AsyncStorage.clear();
    navigation.navigate('Login');
  };

  return (
    <ImageBackground
      source={require('./assets/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.editButton} onPress={toggleForm}>
        <Text>Edit Profile</Text>
      </TouchableOpacity>

      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.welcomeText}>Welcome</Text>
          <Text style={styles.usernameText}>{username}</Text>

          <View style={styles.balanceContainer}>
            <Text style={styles.balance}>{parseFloat(monthlyIncome).toFixed(2)}</Text>
            <Text style={styles.currency}>BGN</Text>
          </View>
        </ScrollView>

        {isFormVisible && (
          <View style={styles.slidingFormBottomCentered}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput style={styles.input} value={username} onChangeText={setUsername} />
            <Text style={styles.inputLabel}>Monthly Income</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={monthlyIncome}
              onChangeText={setMonthlyIncome}
            />
            <Button title="Save" onPress={saveProfile} style={styles.saveButton} />
          </View>
        )}
      </View>

      <View style={styles.wideBoxContainer}>
        <View style={styles.wideBox}>
          {chartData ? (
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width-30}
              height={300}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: '#3b3b3b',
                backgroundGradientTo: '#5a5a5a',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  stroke: '#00FF00',
                },
                propsForBackgroundLines: {
                  strokeWidth: 0,
                },
              }}
              bezier
              style={styles.chart}
              onDataPointClick={(e) => {
                alert(`You clicked on ${e.index} with value: ${e.value}`);
              }}
            />
          ) : (
            <Text>No purchase data available.</Text>
          )}
        </View>

        <View style={styles.rowBottomLargeCentered}>
          <View style={styles.largeBoxBottomCentered}>
            <Text style={styles.boxTitleLarge}>Latest Purchase</Text>
            <Text style={styles.boxContentLarge}>{latestPurchase}</Text>
          </View>
          <View style={styles.largeBoxBottomCentered}>
            <Text style={styles.boxTitleLarge}>Biggest Purchase</Text>
            <Text style={styles.boxContentLarge}>{biggestPurchase}</Text>
          </View>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  content: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
  },
  usernameText: {
    fontSize: 18,
    color: 'white',
    marginBottom: 20,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  balance: {
    fontSize: 60,
    fontWeight: '800',
    color: '#00D048',
  },
  currency: {
    marginLeft: 5,
    fontSize: 20,
    color: '#00D048',
  },
  wideBoxContainer: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    width: Dimensions.get('window').width,
    alignSelf: 'center',
  },
  wideBox: {
    height: 300,
    backgroundColor: '#D9D9D9',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  chart: {
    borderRadius: 16,
  },
  rowBottomLargeCentered: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  largeBoxBottomCentered: {
    flex: 1,
    height: 160,
    backgroundColor: '#D9D9D9',
    borderRadius: 15,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxTitleLarge: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3B3B3B',
  },
  boxContentLarge: {
    fontSize: 28,
    fontWeight: '800',
    color: '#3B3B3B',
  },
  logoutButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FD7C20',
    borderRadius: 20,
    zIndex: 10, // Ensures it appears on top
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  editButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#222222',
    borderRadius: 10,
    zIndex: 10, // Ensures it appears on top
  },
  slidingFormBottomCentered: {
    width: '90%',
    padding: 30,
    backgroundColor: '#424242',
    position: 'absolute',
    bottom: 0,
    left: '5%',
    zIndex: 20,
    borderRadius: 20,
  },
  inputLabel: {
    color: '#636363',
    marginBottom: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#636363',
    color: 'white',
    marginBottom: 20,
  },
  saveButton: {
    marginTop: 20,
  },
});

export default HomeScreen;
