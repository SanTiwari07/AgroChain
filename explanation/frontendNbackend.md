# 🖥️ Frontend & Backend Technology Stack

## Table of Contents
1. [What is React?](#what-is-react)
2. [Frontend Architecture](#frontend-architecture)
3. [Technology Stack Breakdown](#technology-stack-breakdown)
4. [Component Structure](#component-structure)
5. [State Management](#state-management)
6. [UI/UX Design System](#uiux-design-system)
7. [Authentication Flow](#authentication-flow)
8. [Role-Based Dashboards](#role-based-dashboards)
9. [QR Code Integration](#qr-code-integration)
10. [Build & Deployment](#build--deployment)

---

## What is React?

### Basic Concept
**React** is a JavaScript library for building user interfaces, particularly web applications. It was created by Facebook and is now maintained by Meta and the community.

### Key Features
1. **Component-Based**: Build UI using reusable components
2. **Virtual DOM**: Efficient updates and rendering
3. **Declarative**: Describe what the UI should look like
4. **Unidirectional Data Flow**: Data flows down, events flow up
5. **JSX**: JavaScript syntax extension for writing HTML-like code

### Why React for KrishiSetu?
- **Reusable Components**: Perfect for role-based dashboards
- **Fast Development**: Rich ecosystem and tools
- **TypeScript Support**: Type safety for better code quality
- **State Management**: Handle complex application state
- **Mobile Responsive**: Works on all devices

---

## Frontend Architecture

### Project Structure
```
frontendNbackend/
├── src/
│   ├── components/          # React components
│   ├── services/           # API and blockchain services
│   ├── styles/            # CSS and styling
│   ├── lib/               # Utility functions
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── public/                # Static assets
├── package.json           # Dependencies and scripts
└── vite.config.ts         # Build configuration
```

### Application Flow
```
User → HomePage → Role Selection → Authentication → Dashboard → Blockchain Integration
```

---

## Technology Stack Breakdown

### Core Technologies

#### 1. **React 18** (UI Library)
- **Version**: ^18.3.1
- **Features Used**:
  - Functional Components with Hooks
  - Context API for global state
  - useEffect for side effects
  - useState for local state

#### 2. **TypeScript** (Type Safety)
- **Version**: ^20.10.0
- **Benefits**:
  - Compile-time error checking
  - IntelliSense and autocomplete
  - Interface definitions
  - Refactoring safety

#### 3. **Vite** (Build Tool)
- **Version**: 6.3.5
- **Features**:
  - Fast development server
  - Hot module replacement
  - Optimized production builds
  - Modern ES modules

### UI Framework

#### 1. **Tailwind CSS** (Styling)
- **Purpose**: Utility-first CSS framework
- **Features**:
  - Responsive design
  - Dark/light mode support
  - Custom color schemes
  - Component-based styling

#### 2. **Radix UI** (Component Primitives)
- **Purpose**: Accessible, unstyled components
- **Components Used**:
  - Buttons, Cards, Dialogs
  - Forms, Inputs, Selects
  - Navigation, Tabs
  - Tooltips, Popovers

#### 3. **Lucide React** (Icons)
- **Purpose**: Beautiful, customizable icons
- **Usage**: Consistent iconography throughout the app

### Blockchain Integration

#### 1. **Ethers.js** (Blockchain Library)
- **Version**: ^6.15.0
- **Purpose**: Interact with Ethereum blockchain
- **Features**:
  - Wallet connection
  - Contract interaction
  - Transaction management

#### 2. **QR Code Libraries**
- **html5-qrcode**: ^2.3.8 (QR scanning)
- **qrcode**: ^1.5.4 (QR generation)
- **qr-scanner**: ^1.4.2 (Advanced scanning)

### Firebase Integration

#### 1. **Firebase SDK** (Backend Services)
- **Version**: ^12.2.1
- **Services Used**:
  - Authentication
  - Firestore Database
  - Hosting

---

## Component Structure

### Main Application Component (App.tsx)

```typescript
export default function App() {
  const [appState, setAppState] = useState<AppState>({
    currentPage: 'home',
    selectedRole: null,
    isAuthenticated: false,
    userData: null
  });

  // Authentication monitoring
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        const userData = await getUserData(user.uid);
        setAppState(prev => ({
          ...prev,
          isAuthenticated: true,
          userData,
          selectedRole: userData.role,
          currentPage: 'dashboard'
        }));
      }
    });
    return () => unsubscribe();
  }, []);
}
```

### Key Components

#### 1. **HomePage Component**
- **Purpose**: Landing page with role selection
- **Features**:
  - Role-based navigation cards
  - Responsive design
  - Language support
  - Background animations

#### 2. **Authentication Components**
- **LoginPage**: User login with email/password
- **SignupPage**: User registration with role selection
- **Features**:
  - Form validation
  - Error handling
  - Loading states
  - Role-specific fields

#### 3. **Dashboard Components**
- **FarmerDashboard**: Crop management and blockchain integration
- **DistributorDashboard**: Supply chain logistics
- **RetailerDashboard**: Store management and pricing
- **Features**:
  - Role-specific functionality
  - Real-time data updates
  - Blockchain connectivity
  - QR code generation

#### 4. **Utility Components**
- **Header**: Navigation and user info
- **BackgroundWrapper**: Animated backgrounds
- **ChatBot**: AI assistant for users
- **CropPriceNotification**: Price alerts for farmers

---

## State Management

### Local State (useState)
```typescript
const [crops, setCrops] = useState<BlockchainCrop[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [isBlockchainConnected, setIsBlockchainConnected] = useState(false);
```

### Global State (Context API)
```typescript
// Language Context
const { t } = useLanguage();

// Theme Context
const { theme, setTheme } = useTheme();
```

### Authentication State
```typescript
interface AppState {
  currentPage: AppPage;
  selectedRole: UserRole | null;
  isAuthenticated: boolean;
  userData: UserData | null;
}
```

### State Flow
1. **User Action** → Component State Update
2. **Component State** → UI Re-render
3. **Global State** → Multiple Component Updates
4. **Firebase State** → Authentication Changes
5. **Blockchain State** → Real-time Data Updates

---

## UI/UX Design System

### Design Principles

#### 1. **Accessibility First**
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG compliant colors
- **Focus Management**: Clear focus indicators

#### 2. **Mobile Responsive**
- **Breakpoints**: sm, md, lg, xl
- **Flexible Layouts**: Grid and flexbox
- **Touch-Friendly**: Appropriate button sizes
- **Viewport Optimization**: Mobile-first design

#### 3. **Consistent Theming**
```css
:root {
  --primary: 142 69% 58%;
  --secondary: 142 69% 48%;
  --forest-green: 142 69% 38%;
  --deep-green: 142 69% 28%;
}
```

### Component Library

#### 1. **Button Components**
```typescript
<Button 
  className="w-full mt-4 bg-primary hover:bg-primary/90"
  onClick={handleAction}
>
  Continue
</Button>
```

#### 2. **Card Components**
```typescript
<Card className="group cursor-pointer transition-all duration-300 hover:scale-105">
  <CardContent className="p-6 text-center">
    {/* Card content */}
  </CardContent>
</Card>
```

#### 3. **Form Components**
```typescript
<Input
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### Animation System

#### 1. **CSS Transitions**
```css
.transition-all {
  transition: all 0.3s ease;
}

.hover:scale-105:hover {
  transform: scale(1.05);
}
```

#### 2. **Loading States**
```typescript
{isLoading ? (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
) : (
  <Button>Submit</Button>
)}
```

---

## Authentication Flow

### Firebase Authentication

#### 1. **Sign Up Process**
```typescript
const handleSignup = async (formData: any) => {
  try {
    await signUp(formData.email, formData.password, {
      role: appState.selectedRole!,
      name: formData.name,
      phone: formData.mobile,
      address: formData.address
    });
    toast.success('Account created successfully!');
  } catch (error) {
    toast.error(`Signup failed: ${error.message}`);
  }
};
```

#### 2. **Sign In Process**
```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    await signIn(email, password);
    toast.success('Welcome back!');
  } catch (error) {
    toast.error(`Login failed: ${error.message}`);
  }
};
```

#### 3. **Authentication State Monitoring**
```typescript
useEffect(() => {
  const unsubscribe = onAuthChange(async (user) => {
    if (user) {
      const userData = await getUserData(user.uid);
      setAppState(prev => ({
        ...prev,
        isAuthenticated: true,
        userData,
        selectedRole: userData.role,
        currentPage: 'dashboard'
      }));
    } else {
      setAppState(prev => ({
        ...prev,
        isAuthenticated: false,
        userData: null,
        selectedRole: null,
        currentPage: 'home'
      }));
    }
  });
  return () => unsubscribe();
}, []);
```

### Role-Based Access Control

#### 1. **User Roles**
```typescript
type UserRole = 'farmer' | 'distributor' | 'retailer' | 'customer';
```

#### 2. **Role Validation**
```typescript
// Check if user has required role
if (userData?.role !== 'farmer') {
  return <AccessDenied />;
}
```

#### 3. **Dynamic Navigation**
```typescript
const renderDashboard = () => {
  switch (appState.selectedRole) {
    case 'farmer':
      return <FarmerDashboard onLogout={handleLogout} />;
    case 'distributor':
      return <DistributorDashboard onLogout={handleLogout} />;
    case 'retailer':
      return <RetailerDashboard onLogout={handleLogout} />;
    default:
      return <HomePage onRoleSelect={handleRoleSelect} />;
  }
};
```

---

## Role-Based Dashboards

### Farmer Dashboard

#### Features:
1. **Crop Registration**
   - Add new crops to blockchain
   - Set prices and quality grades
   - Generate QR codes
   - Track crop status

2. **Blockchain Integration**
   - Connect MetaMask wallet
   - Register products on blockchain
   - View transaction history
   - Monitor crop journey

3. **Price Monitoring**
   - Real-time price alerts
   - Market intelligence
   - Competitor analysis
   - Profit calculations

### Distributor Dashboard

#### Features:
1. **Supply Chain Management**
   - View available crops
   - Update transport information
   - Add handling costs
   - Track delivery status

2. **Logistics Tracking**
   - Route optimization
   - Delivery scheduling
   - Cost management
   - Quality control

### Retailer Dashboard

#### Features:
1. **Store Management**
   - Inventory tracking
   - Price setting
   - Customer management
   - Sales analytics

2. **Product Verification**
   - Verify product authenticity
   - Check supply chain history
   - Quality assurance
   - Customer transparency

### Customer Interface

#### Features:
1. **QR Code Scanning**
   - Scan product QR codes
   - View complete product history
   - Verify authenticity
   - Support farmers

2. **Product Information**
   - Farm location and details
   - Harvest date and quality
   - Price breakdown
   - Supply chain journey

---

## QR Code Integration

### QR Code Generation

#### 1. **Product QR Codes**
```typescript
import QRCode from 'qrcode';

const generateQRCode = async (productId: string) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(productId);
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
  }
};
```

#### 2. **QR Code Display**
```typescript
<img 
  src={qrCodeDataURL} 
  alt="Product QR Code"
  className="w-32 h-32 mx-auto"
/>
```

### QR Code Scanning

#### 1. **Scanner Component**
```typescript
import { Html5QrcodeScanner } from 'html5-qrcode';

const CustomerQRScanner = () => {
  const [scanResult, setScanResult] = useState<string>('');

  const onScanSuccess = (decodedText: string) => {
    setScanResult(decodedText);
    // Verify product on blockchain
    verifyProduct(decodedText);
  };

  return (
    <Html5QrcodeScanner
      fps={10}
      qrbox={250}
      onScanSuccess={onScanSuccess}
    />
  );
};
```

#### 2. **Product Verification**
```typescript
const verifyProduct = async (productId: string) => {
  try {
    const product = await blockchainService.getProduct(productId);
    const history = await blockchainService.getProductHistory(productId);
    
    // Display product information
    setProductInfo(product);
    setProductHistory(history);
  } catch (error) {
    toast.error('Product not found or invalid QR code');
  }
};
```

---

## Build & Deployment

### Development Setup

#### 1. **Installation**
```bash
cd frontendNbackend
npm install
```

#### 2. **Development Server**
```bash
npm run dev
# Starts Vite dev server on http://localhost:5173
```

#### 3. **Environment Variables**
```bash
# .env file
VITE_AGRICHAIN_CONTRACT_ADDRESS=0x0165878A594ca255338adfa4d48449f69242Eb8F
VITE_CHAIN_ID=31337
VITE_NETWORK_NAME=AgroChain Local
```

### Production Build

#### 1. **Build Process**
```bash
npm run build
# Creates optimized build in /dist folder
```

#### 2. **Build Output**
```
dist/
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
├── index.html
└── KrishiSetu_logo.svg
```

### Firebase Hosting

#### 1. **Firebase Configuration**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

#### 2. **Deployment**
```bash
firebase deploy --only hosting
```

### Performance Optimization

#### 1. **Code Splitting**
- Automatic route-based splitting
- Lazy loading of components
- Dynamic imports for heavy libraries

#### 2. **Asset Optimization**
- Image compression
- CSS minification
- JavaScript bundling
- Tree shaking for unused code

#### 3. **Caching Strategy**
- Static asset caching
- Service worker implementation
- CDN integration
- Browser caching headers

---

## Summary

The frontend and backend of KrishiSetu provide:

1. **Modern React Architecture**: Component-based, type-safe, and maintainable
2. **Responsive Design**: Works seamlessly across all devices
3. **Role-Based Access**: Tailored experiences for each user type
4. **Blockchain Integration**: Seamless connection to smart contracts
5. **Firebase Backend**: Scalable authentication and data management
6. **QR Code System**: Complete product tracking and verification
7. **Real-time Updates**: Live data synchronization
8. **Production Ready**: Optimized builds and deployment pipeline

This technology stack enables a modern, scalable, and user-friendly agricultural supply chain platform that bridges traditional farming with cutting-edge technology.

