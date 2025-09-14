# 📱 Mobile App Development Guide for KrishiSetu

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [App Architecture](#app-architecture)
4. [Core Features](#core-features)
5. [UI/UX Design](#uiux-design)
6. [Blockchain Integration](#blockchain-integration)
7. [Offline Support](#offline-support)
8. [Push Notifications](#push-notifications)
9. [Security & Authentication](#security--authentication)
10. [Testing & Deployment](#testing--deployment)

---

## Overview

KrishiSetu mobile application extends the web platform's functionality to mobile devices, providing farmers, distributors, retailers, and customers with on-the-go access to the agricultural supply chain transparency platform.

### Key Benefits
- **Portability**: Access from anywhere, anytime
- **Offline Support**: Work without internet connection
- **Camera Integration**: Direct QR code scanning
- **Push Notifications**: Real-time updates and alerts
- **GPS Integration**: Location-based features
- **Native Performance**: Optimized for mobile devices

---

## Technology Stack

### Core Technologies

#### 1. **React Native** (Cross-platform Framework)
```json
{
  "react-native": "^0.72.0",
  "react": "^18.2.0",
  "typescript": "^5.0.0"
}
```

**Why React Native?**
- **Code Reuse**: Share code between iOS and Android
- **Performance**: Near-native performance
- **Ecosystem**: Rich library ecosystem
- **Familiar**: Same React patterns as web app

#### 2. **Expo** (Development Platform)
```json
{
  "expo": "^49.0.0",
  "@expo/cli": "^0.10.0"
}
```

**Benefits:**
- **Rapid Development**: Quick setup and testing
- **Over-the-Air Updates**: Deploy updates instantly
- **Built-in APIs**: Camera, GPS, notifications
- **Easy Publishing**: Simplified app store deployment

#### 3. **Navigation**
```json
{
  "@react-navigation/native": "^6.1.0",
  "@react-navigation/stack": "^6.3.0",
  "@react-navigation/bottom-tabs": "^6.5.0"
}
```

### Blockchain Integration

#### 1. **Ethers.js** (Blockchain Library)
```json
{
  "ethers": "^6.15.0"
}
```

#### 2. **Wallet Integration**
```json
{
  "react-native-wallet-connect": "^1.0.0",
  "react-native-keychain": "^8.0.0"
}
```

### State Management

#### 1. **Redux Toolkit**
```json
{
  "@reduxjs/toolkit": "^1.9.0",
  "react-redux": "^8.1.0"
}
```

#### 2. **Async Storage**
```json
{
  "@react-native-async-storage/async-storage": "^1.19.0"
}
```

---

## App Architecture

### Project Structure
```
KrishiSetuMobile/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Screen components
│   ├── navigation/         # Navigation configuration
│   ├── services/           # API and blockchain services
│   ├── store/              # Redux store and slices
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   └── constants/          # App constants
├── assets/                 # Images, fonts, icons
├── android/                # Android-specific code
├── ios/                    # iOS-specific code
└── app.json               # Expo configuration
```

### Navigation Structure
```typescript
// Navigation types
type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProductDetail: { productId: string };
  QRScanner: undefined;
  Profile: undefined;
};

type MainTabParamList = {
  Home: undefined;
  Products: undefined;
  Scanner: undefined;
  Notifications: undefined;
  Profile: undefined;
};
```

---

## Core Features

### 1. **Authentication System**

#### Login Screen
```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { loginUser } from '../store/slices/authSlice';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      await dispatch(loginUser({ email, password }));
      // Navigate to main app
    } catch (error) {
      // Handle error
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>KrishiSetu</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### 2. **QR Code Scanner**

#### Camera Integration
```typescript
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useCodeScanner } from 'vision-camera-code-scanner';

const QRScannerScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const devices = useCameraDevices();
  const device = devices.back;

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if (codes.length > 0) {
        const scannedCode = codes[0].value;
        handleQRCodeScanned(scannedCode);
      }
    }
  });

  const handleQRCodeScanned = async (code: string) => {
    try {
      const qrData = JSON.parse(code);
      if (qrData.type === 'product') {
        navigation.navigate('ProductDetail', { productId: qrData.productId });
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid QR code');
    }
  };

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    })();
  }, []);

  if (!hasPermission) {
    return <Text>No camera permission</Text>;
  }

  if (device == null) {
    return <Text>No camera device</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFillObject}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
      />
    </View>
  );
};
```

### 3. **Product Management**

#### Product List Screen
```typescript
import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';

const ProductListScreen = ({ navigation }) => {
  const { products, loading } = useSelector(state => state.products);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productStatus}>{item.status}</Text>
      <Text style={styles.productPrice}>₹{item.currentPrice}/kg</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        refreshing={loading}
        onRefresh={() => dispatch(fetchProducts())}
      />
    </View>
  );
};
```

### 4. **Blockchain Integration**

#### Blockchain Service
```typescript
import { ethers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';

class MobileBlockchainService {
  private provider: ethers.Provider | null = null;
  private contract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;

  async connectWallet() {
    try {
      // Connect to mobile wallet (WalletConnect, MetaMask Mobile, etc.)
      const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_PROJECT_ID');
      this.provider = provider;
      
      // Get signer from connected wallet
      this.signer = await provider.getSigner();
      
      // Initialize contract
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ABI,
        this.signer
      );
      
      return true;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      return false;
    }
  }

  async registerProduct(productData: ProductData) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    const tx = await this.contract.registerProduct(
      productData.id,
      productData.name,
      productData.quantity,
      productData.basePrice,
      productData.harvestDate,
      productData.quality,
      productData.location
    );

    await tx.wait();
    return tx.hash;
  }

  async getProduct(productId: string) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    return await this.contract.getProduct(productId);
  }
}

export const mobileBlockchainService = new MobileBlockchainService();
```

---

## UI/UX Design

### Design System

#### 1. **Color Palette**
```typescript
const colors = {
  primary: '#22C55E',      // Green
  secondary: '#16A34A',    // Dark Green
  accent: '#84CC16',       // Light Green
  background: '#F9FAFB',   // Light Gray
  surface: '#FFFFFF',      // White
  text: '#1F2937',         // Dark Gray
  textSecondary: '#6B7280', // Medium Gray
  error: '#EF4444',        // Red
  warning: '#F59E0B',      // Orange
  success: '#10B981',      // Green
};
```

#### 2. **Typography**
```typescript
const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 20,
  },
};
```

#### 3. **Component Styles**
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.textSecondary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginVertical: 8,
  },
});
```

---

## Offline Support

### Data Synchronization

#### 1. **Offline Storage**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

class OfflineStorage {
  async saveProduct(product: Product) {
    try {
      const products = await this.getProducts();
      const updatedProducts = [...products, product];
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      const products = await AsyncStorage.getItem('products');
      return products ? JSON.parse(products) : [];
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  }

  async syncWithServer() {
    try {
      const offlineProducts = await this.getProducts();
      const pendingProducts = offlineProducts.filter(p => !p.synced);
      
      for (const product of pendingProducts) {
        await mobileBlockchainService.registerProduct(product);
        product.synced = true;
      }
      
      await AsyncStorage.setItem('products', JSON.stringify(offlineProducts));
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}
```

#### 2. **Network Status Detection**
```typescript
import NetInfo from '@react-native-community/netinfo';

const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  return isConnected;
};
```

---

## Push Notifications

### Notification System

#### 1. **Expo Notifications**
```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const setupNotifications = async () => {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }
};
```

#### 2. **Notification Handlers**
```typescript
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Handle notification received
useEffect(() => {
  const subscription = Notifications.addNotificationReceivedListener(notification => {
    console.log(notification);
  });

  return () => subscription.remove();
}, []);
```

---

## Security & Authentication

### Biometric Authentication

#### 1. **Touch ID / Face ID**
```typescript
import TouchID from 'react-native-touch-id';

const authenticateWithBiometrics = async () => {
  try {
    const biometryType = await TouchID.isSupported();
    
    if (biometryType) {
      const result = await TouchID.authenticate('Authenticate to access KrishiSetu');
      return result;
    }
  } catch (error) {
    console.error('Biometric authentication failed:', error);
  }
};
```

#### 2. **Secure Storage**
```typescript
import Keychain from 'react-native-keychain';

const storeCredentials = async (email: string, password: string) => {
  try {
    await Keychain.setInternetCredentials('krishisetu', email, password);
  } catch (error) {
    console.error('Failed to store credentials:', error);
  }
};

const getCredentials = async () => {
  try {
    const credentials = await Keychain.getInternetCredentials('krishisetu');
    if (credentials) {
      return {
        email: credentials.username,
        password: credentials.password,
      };
    }
  } catch (error) {
    console.error('Failed to get credentials:', error);
  }
};
```

---

## Testing & Deployment

### Testing Framework

#### 1. **Unit Testing**
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';

describe('LoginScreen', () => {
  it('should render login form', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('should handle login', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));
    
    // Assert login behavior
  });
});
```

#### 2. **E2E Testing**
```typescript
import { device, element, by } from 'detox';

describe('KrishiSetu App', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should login successfully', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});
```

### Deployment

#### 1. **Expo Build**
```bash
# Install Expo CLI
npm install -g @expo/cli

# Build for Android
expo build:android

# Build for iOS
expo build:ios

# Publish update
expo publish
```

#### 2. **App Store Deployment**
```json
{
  "expo": {
    "name": "KrishiSetu",
    "slug": "krishisetu",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#22C55E"
    },
    "ios": {
      "bundleIdentifier": "com.krishisetu.app"
    },
    "android": {
      "package": "com.krishisetu.app"
    }
  }
}
```

---

## Summary

The KrishiSetu mobile app provides:

1. **Cross-Platform Development**: Single codebase for iOS and Android
2. **Native Performance**: Optimized for mobile devices
3. **Offline Support**: Work without internet connection
4. **QR Code Integration**: Direct camera scanning
5. **Push Notifications**: Real-time updates
6. **Biometric Security**: Touch ID/Face ID authentication
7. **Blockchain Integration**: Full smart contract functionality
8. **Modern UI/UX**: Intuitive and responsive design

This mobile application extends KrishiSetu's reach to mobile users, providing a complete agricultural supply chain transparency solution accessible anywhere, anytime.
