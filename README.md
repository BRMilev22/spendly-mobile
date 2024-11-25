# 📸 Spendly - Mobile 🧾 

**Spendly - Mobile** е мобилно приложение, което позволява на потребителите да управляват своите финанси, да сканират касови бележки, да извличат необходимата информация и автоматично да я съхраняват. Това е идеалното решение за следене на разходите, докато сте в движение. 📱💼

## 🛠️ Използвани технологии

- **React Native** - За създаване на мобилното приложение, което работи на множество платформи.  
- **Expo Camera** - Използва се за улавяне на изображения и сканиране на бележки.  
- **Firebase** - Сигурно управление на потребителски акаунти и съхранение на данни.  
- **Taggun API** - Извлича данни от сканираните бележки като дата, търговец и обща сума.  
- **NativeWind** - За лесно стилизиране на компоненти с помощта на утилити класове.  
- **Axios** - За обработка на HTTP заявки към Taggun API.  

## ✨ Функции

- **📸 Сканиране на бележки** - Заснемане на бележки с камерата и автоматично извличане на данни като дата и сума.  
- **🔐 Безопасност** - Сигурен вход чрез Firebase Authentication.  
- **☁️ Съхранение на данни в реално време** - Съхраняване на бележките в Firebase Firestore за достъп по всяко време.  

## 📋 Предварителни изисквания  

За да стартирате приложението, трябва да инсталирате следното:  

- [Node.js](https://nodejs.org/en/) ( версия 14 или по-висока)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) ( за стартиране на приложението)
- Firebase акаунт с настроена Firestore база данни.  

## ⚡ Инструкции за стартиране  

Follow these steps to get the app up and running:
1. **Клонирайте repository-то**

   ```bash
   git clone https://github.com/BRMilev22/spendly-mobile.git
   cd spendly-mobile
   ```

2. **Инсталирайте библиотеките**

   ```bash
   npm install i
   ```
   
3. **Стартирайте приложението**

   ```bash
   npm start
   ```

   - Използвайте приложението Expo Go на вашия телефон, за да сканирате QR кода и стартирате приложението на устройството си, или стартирайте iOS/Android симулатор.  

## 🔄 Работен процес
**1. Потребителят влиза чрез Firebase Authentication.  
2. Приложението прави снимка на бележката с помощта на Expo Camera.  
3. Данните от бележката се извличат чрез Taggun API.  
4. Извлечените данни се записват във Firebase Firestore под уникалния ID на потребителя.  
5. Потребителят получава известие при успешно съхранение на данните.**

## 📚 Основни зависимости  

Here are some key dependencies used in this project:

- `react-native:` Фреймуърк за разработка на мобилни приложения.  
- `expo-camera:` За функционалност на камерата.  
- `firebase:` За удостоверяване на потребители и база данни.  
- `axios:` За обработка на HTTP заявки.  
- `nativewind:` За стилизиране на компоненти.  

  ## Насладете се на Spendly! Направено с ❤️
