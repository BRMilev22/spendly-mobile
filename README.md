# 📸 Spendly - Mobile 🧾

Welcome to the **Spendly - Mobile**! 🚀 This  is our mobile app which lets users scan and process receipts effortlessly using their mobile device's camera and automatically saves the receipt details to our desktop app. It's the perfect solution for tracking expenses on the go! 📱💼

## 🛠️ Technologies Used

- **React Native** - For building a seamless, cross-platform mobile app.
- **Expo Camera** - Utilized for camera functionality and scanning receipts.
- **Firebase (Firestore & Authentication)** - Manages user authentication and stores receipt data securely.
- **TypeScript** - Adds static typing for improved development experience.
- **Taggun API** - Used for extracting receipt data (date, merchant, total amount) from images.
- **NativeWind** - Enables a seamless, utility-first styling approach for React Native.
- **Axios** - Handles HTTP requests to the Taggun API.

## ✨ Features

- **📸 Receipt Scanning** - Capture receipts using the camera and automatically extract data like the date, and amount.
- **🔐 User Authentication** - Secure login using Firebase Authentication.
- **☁️ Real-time Data Storage** - Save your receipts in Firebase Firestore, where they can be accessed anytime.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/) (version 14 or higher)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (for running the app)
- Firebase account with a Firestore database set up

## ⚡ Getting Started

Follow these steps to get the app up and running:
1. **Clone the Repository**

   ```bash
   git clone https://github.com/BRMilev22/spendly-mobile.git
   cd spendly-mobile
   ```

2. **Install Dependencies**

   ```bash
   npm install i
   ```
   
3. **Run the App**

   ```bash
   npm start
   ```

   - Use the Expo Go app on your phone to scan the QR code and run the app on your device, or launch the iOS/Android simulator.

## 🔄 App Workflow

1. **User Authentication**: The user logs in through Firebase.
2. **Receipt Scanning**: The app captures a photo using Expo Camera.
3. **Receipt Processing**: Taggun API extracts relevant information.
4. **Data Storage**: The extracted data is saved to Firestore under the user's ID.
5. **Notifications**: The app notifies the user upon successful data storage.

## 📚 Dependencies

Here are some key dependencies used in this project:

- `react-native`: Mobile app development framework
- `expo-camera`: For camera functionality
- `firebase`: For authentication and database
- `axios`: For making HTTP requests to the Taggun API
- `nativewind`: For styling components with utility classes

  ## 🎉 Enjoy using Spendly! Made with ❤️
