# 🔌 API Integration Guide for KrishiSetu

## Table of Contents
1. [Overview](#overview)
2. [Blockchain API Endpoints](#blockchain-api-endpoints)
3. [Firebase API Integration](#firebase-api-integration)
4. [QR Code API Services](#qr-code-api-services)
5. [External API Integrations](#external-api-integrations)
6. [Authentication & Security](#authentication--security)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [Testing & Debugging](#testing--debugging)
10. [Production Deployment](#production-deployment)

---

## Overview

KrishiSetu provides multiple API layers for seamless integration with external systems, mobile applications, and third-party services. This guide covers all available APIs and integration patterns.

### API Architecture
```
External Systems
       ↓
   API Gateway
       ↓
┌─────────────────┬─────────────────┬─────────────────┐
│  Blockchain API │  Firebase API   │  QR Code API    │
│  (Ethers.js)    │  (Firebase SDK) │  (Custom)       │
└─────────────────┴─────────────────┴─────────────────┘
       ↓
   KrishiSetu Core
```

---

## Blockchain API Endpoints

### Smart Contract Functions

#### 1. **Product Registration**
```typescript
// Register a new product
const registerProduct = async (
  id: string,
  name: string,
  quantity: number,
  basePrice: number,
  harvestDate: string,
  quality: string,
  location: string
): Promise<string> => {
  const tx = await contract.registerProduct(
    id, name, quantity, basePrice, harvestDate, quality, location
  );
  return tx.hash;
};
```

#### 2. **Supply Chain Updates**
```typescript
// Distributor update
const updateAsDistributor = async (
  productId: string,
  handlingCost: number,
  transportDetails: string
): Promise<string> => {
  const tx = await contract.updateAsDistributor(
    productId, handlingCost, transportDetails
  );
  return tx.hash;
};

// Retailer update
const updateAsRetailer = async (
  productId: string,
  retailMargin: number,
  storeDetails: string
): Promise<string> => {
  const tx = await contract.updateAsRetailer(
    productId, retailMargin, storeDetails
  );
  return tx.hash;
};
```

#### 3. **Data Retrieval**
```typescript
// Get product details
const getProduct = async (productId: string): Promise<Product> => {
  return await contract.getProduct(productId);
};

// Get product history
const getProductHistory = async (productId: string): Promise<Transaction[]> => {
  return await contract.getProductHistory(productId);
};

// Get all products
const getAllProducts = async (): Promise<string[]> => {
  return await contract.getAllProductIds();
};
```

### Event Listeners

#### 1. **Real-time Events**
```typescript
// Listen to product registration
contract.on('ProductRegistered', (productId, farmer, name, quantity, basePrice, quality, location) => {
  console.log('New product registered:', { productId, farmer, name });
  // Update UI or send notifications
});

// Listen to supply chain updates
contract.on('ProductUpdated', (productId, actor, action, newPrice, status) => {
  console.log('Product updated:', { productId, actor, action, newPrice, status });
  // Update product status in UI
});
```

---

## Firebase API Integration

### Authentication API

#### 1. **User Management**
```typescript
// Sign up new user
const signUp = async (email: string, password: string, userData: UserData) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Store additional user data
  await setDoc(doc(db, 'users', user.uid), {
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  return user;
};

// Sign in user
const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Sign out user
const signOut = async () => {
  await signOut(auth);
};
```

#### 2. **User Data Management**
```typescript
// Get user data
const getUserData = async (uid: string): Promise<UserData | null> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() ? userDoc.data() as UserData : null;
};

// Update user data
const updateUserData = async (uid: string, updates: Partial<UserData>) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: new Date()
  });
};
```

### Firestore Database API

#### 1. **Crop Data Management**
```typescript
// Add new crop
const addCrop = async (cropData: CropData) => {
  const cropRef = await addDoc(collection(db, 'crops'), {
    ...cropData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return cropRef.id;
};

// Get crops by farmer
const getCropsByFarmer = async (farmerId: string): Promise<CropData[]> => {
  const q = query(
    collection(db, 'crops'),
    where('farmerId', '==', farmerId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as CropData[];
};
```

#### 2. **Real-time Data Sync**
```typescript
// Listen to crops changes
const subscribeToCrops = (farmerId: string, callback: (crops: CropData[]) => void) => {
  const q = query(
    collection(db, 'crops'),
    where('farmerId', '==', farmerId)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const crops = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CropData[];
    callback(crops);
  });
};
```

---

## QR Code API Services

### QR Code Generation

#### 1. **Product QR Codes**
```typescript
import QRCode from 'qrcode';

// Generate QR code for product
const generateProductQR = async (productId: string): Promise<string> => {
  const qrData = {
    productId,
    timestamp: Date.now(),
    type: 'product',
    url: `${window.location.origin}/verify/${productId}`
  };
  
  const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
    width: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
  
  return qrCodeDataURL;
};
```

#### 2. **QR Code Scanning**
```typescript
import { Html5QrcodeScanner } from 'html5-qrcode';

// Initialize QR scanner
const initializeQRScanner = (onScanSuccess: (decodedText: string) => void) => {
  const scanner = new Html5QrcodeScanner(
    "qr-reader",
    {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    },
    false
  );
  
  scanner.render(onScanSuccess, onScanFailure);
  
  return scanner;
};

// Handle scan success
const onScanSuccess = (decodedText: string) => {
  try {
    const qrData = JSON.parse(decodedText);
    if (qrData.type === 'product') {
      verifyProduct(qrData.productId);
    }
  } catch (error) {
    console.error('Invalid QR code:', error);
  }
};
```

---

## External API Integrations

### Weather API Integration

#### 1. **Weather Data for Crops**
```typescript
// Get weather data for farm location
const getWeatherData = async (latitude: number, longitude: number) => {
  const API_KEY = process.env.VITE_WEATHER_API_KEY;
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
  );
  return await response.json();
};

// Get weather forecast
const getWeatherForecast = async (latitude: number, longitude: number) => {
  const API_KEY = process.env.VITE_WEATHER_API_KEY;
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
  );
  return await response.json();
};
```

### Market Price API Integration

#### 1. **Crop Price Data**
```typescript
// Get current market prices
const getMarketPrices = async (cropType: string) => {
  const response = await fetch(
    `https://api.agriprice.com/v1/prices?crop=${cropType}&location=india`
  );
  return await response.json();
};

// Get price history
const getPriceHistory = async (cropType: string, days: number = 30) => {
  const response = await fetch(
    `https://api.agriprice.com/v1/history?crop=${cropType}&days=${days}`
  );
  return await response.json();
};
```

### SMS/Email Notifications

#### 1. **Twilio SMS Integration**
```typescript
// Send SMS notification
const sendSMS = async (phoneNumber: string, message: string) => {
  const response = await fetch('/api/send-sms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: phoneNumber,
      message: message
    })
  });
  return await response.json();
};
```

#### 2. **Email Notifications**
```typescript
// Send email notification
const sendEmail = async (to: string, subject: string, body: string) => {
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to,
      subject,
      body
    })
  });
  return await response.json();
};
```

---

## Authentication & Security

### API Key Management

#### 1. **Environment Variables**
```bash
# .env file
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_WEATHER_API_KEY=your_weather_api_key
VITE_KRISHISETU_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_CHAIN_ID=31337
```

#### 2. **API Key Validation**
```typescript
// Validate API keys
const validateAPIKeys = () => {
  const requiredKeys = [
    'VITE_FIREBASE_API_KEY',
    'VITE_KRISHISETU_CONTRACT_ADDRESS'
  ];
  
  const missingKeys = requiredKeys.filter(key => !process.env[key]);
  
  if (missingKeys.length > 0) {
    throw new Error(`Missing required environment variables: ${missingKeys.join(', ')}`);
  }
};
```

### Rate Limiting

#### 1. **API Rate Limiting**
```typescript
// Rate limiter implementation
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  isAllowed(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= limit) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}

const rateLimiter = new RateLimiter();

// Apply rate limiting to API calls
const rateLimitedAPI = async (key: string, apiCall: () => Promise<any>) => {
  if (!rateLimiter.isAllowed(key, 100, 60000)) { // 100 requests per minute
    throw new Error('Rate limit exceeded');
  }
  
  return await apiCall();
};
```

---

## Error Handling

### Comprehensive Error Management

#### 1. **API Error Types**
```typescript
enum APIErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  BLOCKCHAIN_ERROR = 'BLOCKCHAIN_ERROR',
  FIREBASE_ERROR = 'FIREBASE_ERROR'
}

class APIError extends Error {
  constructor(
    public type: APIErrorType,
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}
```

#### 2. **Error Handler**
```typescript
const handleAPIError = (error: any): APIError => {
  if (error.code === 'NETWORK_ERROR') {
    return new APIError(APIErrorType.NETWORK_ERROR, 'Network connection failed');
  }
  
  if (error.code === 'auth/user-not-found') {
    return new APIError(APIErrorType.AUTHENTICATION_ERROR, 'User not found');
  }
  
  if (error.code === 'permission-denied') {
    return new APIError(APIErrorType.AUTHENTICATION_ERROR, 'Permission denied');
  }
  
  if (error.message?.includes('rate limit')) {
    return new APIError(APIErrorType.RATE_LIMIT_ERROR, 'Rate limit exceeded');
  }
  
  return new APIError(APIErrorType.NETWORK_ERROR, 'Unknown error occurred', 500, error);
};
```

---

## Testing & Debugging

### API Testing

#### 1. **Unit Tests**
```typescript
// Test blockchain API
describe('Blockchain API', () => {
  test('should register product successfully', async () => {
    const productData = {
      id: 'KRISHI-TEST-001',
      name: 'Test Wheat',
      quantity: 100,
      basePrice: 50,
      harvestDate: '2024-01-01',
      quality: 'A',
      location: 'Test Farm'
    };
    
    const txHash = await registerProduct(
      productData.id,
      productData.name,
      productData.quantity,
      productData.basePrice,
      productData.harvestDate,
      productData.quality,
      productData.location
    );
    
    expect(txHash).toBeDefined();
    expect(typeof txHash).toBe('string');
  });
});
```

#### 2. **Integration Tests**
```typescript
// Test complete flow
describe('Complete Integration Flow', () => {
  test('should complete product journey from farmer to customer', async () => {
    // 1. Farmer registers product
    const productId = await registerProduct(/* ... */);
    
    // 2. Distributor updates product
    await updateAsDistributor(productId, 10, 'Transport details');
    
    // 3. Retailer updates product
    await updateAsRetailer(productId, 15, 'Store details');
    
    // 4. Customer verifies product
    const product = await getProduct(productId);
    expect(product.status).toBe('Available for Consumers');
  });
});
```

### Debugging Tools

#### 1. **API Logger**
```typescript
class APILogger {
  static log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }
}

// Usage
APILogger.log('info', 'Product registered successfully', { productId, txHash });
APILogger.log('error', 'Failed to connect to blockchain', error);
```

---

## Production Deployment

### API Configuration

#### 1. **Production Environment**
```typescript
const config = {
  development: {
    blockchain: {
      contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      networkId: 31337,
      rpcUrl: 'http://localhost:8545'
    },
    firebase: {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      projectId: 'sih-agro-chain'
    }
  },
  production: {
    blockchain: {
      contractAddress: process.env.VITE_PRODUCTION_CONTRACT_ADDRESS,
      networkId: 1,
      rpcUrl: process.env.VITE_PRODUCTION_RPC_URL
    },
    firebase: {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      projectId: 'sih-agro-chain'
    }
  }
};
```

#### 2. **API Monitoring**
```typescript
// Monitor API performance
const monitorAPI = (apiName: string, apiCall: () => Promise<any>) => {
  return async (...args: any[]) => {
    const startTime = Date.now();
    
    try {
      const result = await apiCall(...args);
      const duration = Date.now() - startTime;
      
      // Log successful API call
      APILogger.log('info', `${apiName} completed successfully`, {
        duration: `${duration}ms`,
        args: args.length
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log failed API call
      APILogger.log('error', `${apiName} failed`, {
        duration: `${duration}ms`,
        error: error.message
      });
      
      throw error;
    }
  };
};
```

---

## Summary

The KrishiSetu API Integration Guide provides:

1. **Complete API Coverage**: Blockchain, Firebase, and external APIs
2. **Security Best Practices**: Authentication, rate limiting, and error handling
3. **Testing Framework**: Unit tests, integration tests, and debugging tools
4. **Production Ready**: Configuration, monitoring, and deployment strategies
5. **Developer Experience**: Clear examples, error handling, and documentation

This comprehensive API system enables seamless integration with external systems while maintaining security, performance, and reliability standards required for production agricultural supply chain applications.
