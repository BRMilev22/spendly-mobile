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
  const [isFormVisible, setFormVisible] = useState(false);
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

            const labels = sortedReceipts.map(receipt => new Date(receipt.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }));
            const data = sortedReceipts.map(receipt => receipt.totalAmount);

            setChartData({
              labels,
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
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.welcomeText}>Welcome</Text>
          <Text style={styles.usernameText}>{username}</Text>

          <View style={styles.balanceContainer}>
            <Text style={styles.balance}>{parseFloat(monthlyIncome).toFixed(2)}</Text>
            <Text style={styles.currency}>BGN</Text>
          </View>

          <View style={styles.claymorphicBox}>
            <View style={styles.wideBox}>
              {chartData ? (
                <LineChart
                  data={chartData}
                  width={Dimensions.get('window').width - 40}
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
                      stroke: '#ff6347',
                    },
                    propsForLabels: {
                      fontSize: 10,
                    },
                  }}
                  bezier
                  style={styles.chart}
                  onDataPointClick={(e) => {
                    alert(`You clicked on ${e.index} - ${chartData.labels[e.index]} with value: ${e.value}`);
                  }}
                />
              ) : (
                <Text>No purchase data available.</Text>
              )}
            </View>
            <View style={styles.row}>
              <View style={styles.smallBox}>
                <Text style={styles.boxTitle}>Latest Purchase</Text>
                <Text style={styles.boxContent}>{latestPurchase}</Text>
              </View>
              <View style={styles.smallBox}>
                <Text style={styles.boxTitle}>Biggest Purchase</Text>
                <Text style={styles.boxContent}>{biggestPurchase}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>

          {isFormVisible && (
            <View style={styles.slidingForm}>
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

          <TouchableOpacity style={styles.editButton} onPress={toggleForm}>
            <Text>Edit Profile</Text>
          </TouchableOpacity>
        </ScrollView>
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
  claymorphicBox: {
    width: '100%',
    padding: 15,
    borderRadius: 23,
    backgroundColor: '#464646',
    marginVertical: 20,
  },
  wideBox: {
    height: 300,
    backgroundColor: '#D9D9D9',
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallBox: {
    flex: 1,
    height: 120,
    backgroundColor: '#D9D9D9',
    borderRadius: 15,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3B3B3B',
  },
  boxContent: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3B3B3B',
  },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FD7C20',
    borderRadius: 20,
    marginTop: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  slidingForm: {
    width: '100%',
    padding: 20,
    backgroundColor: '#424242',
    marginTop: 20,
    borderRadius: 10,
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
  editButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#222222',
    borderRadius: 10,
  },
});

export default HomeScreen;
