import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { LanguageProvider } from './components/LanguageProvider';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { FarmerDashboard } from './components/FarmerDashboard';
import { DistributorDashboard } from './components/DistributorDashboard';
import { RetailerDashboard } from './components/RetailerDashboard';
import { CustomerQRScanner } from './components/CustomerQRScanner';
import { ChatBot } from './components/ChatBot';
import { CropPriceNotification } from './components/CropPriceNotification';
import { onAuthChange, getUserData, signOutUser, signUp, signIn, UserData } from './services/firebaseService';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

type UserRole = 'farmer' | 'distributor' | 'retailer' | 'customer';
type AppPage = 'home' | 'login' | 'signup' | 'dashboard' | 'qr-scanner';

interface AppState {
  currentPage: AppPage;
  selectedRole: UserRole | null;
  isAuthenticated: boolean;
  userData: UserData | null;
}

export default function App() {
  const [appState, setAppState] = useState<AppState>({
    currentPage: 'home',
    selectedRole: null,
    isAuthenticated: false,
    userData: null
  });

  const [showPriceNotification, setShowPriceNotification] = useState(false);

  // Monitor Firebase authentication state
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        try {
          const userData = await getUserData(user.uid);
          if (userData) {
            setAppState(prev => ({
              ...prev,
              isAuthenticated: true,
              userData,
              selectedRole: userData.role,
              currentPage: 'dashboard' // Automatically redirect to dashboard on successful auth
            }));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setAppState(prev => ({
          ...prev,
          isAuthenticated: false,
          userData: null,
          selectedRole: null,
          currentPage: 'home' // Redirect to home on logout
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  // Show price notification for farmers after a delay
  useEffect(() => {
    if (appState.selectedRole === 'farmer' && appState.isAuthenticated) {
      const timer = setTimeout(() => {
        setShowPriceNotification(true);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setShowPriceNotification(false);
    }
  }, [appState.selectedRole, appState.isAuthenticated]);

  const handleRoleSelect = (role: UserRole) => {
    if (role === 'customer') {
      setAppState({
        ...appState,
        selectedRole: role,
        currentPage: 'qr-scanner'
      });
    } else {
      setAppState({
        ...appState,
        selectedRole: role,
        currentPage: 'login'
      });
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      toast.loading('Signing you in...', { id: 'auth-loading' });
      
      // Firebase authentication will automatically trigger the onAuthChange listener
      // which will update the app state and show success message
      await signIn(email, password);
      
      toast.dismiss('auth-loading');
      toast.success(`Welcome back! You're now logged in.`, {
        duration: 4000,
        style: {
          background: 'var(--forest-green)',
          color: 'white',
          border: '1px solid var(--deep-green)'
        }
      });
    } catch (error: any) {
      toast.dismiss('auth-loading');
      toast.error(`Login failed: ${error.message}`, {
        duration: 5000
      });
    }
  };

  const handleSignup = async (formData: any) => {
    try {
      toast.loading('Creating your account...', { id: 'signup-loading' });
      
      // Firebase authentication will automatically trigger the onAuthChange listener
      // which will update the app state and show success message
      await signUp(formData.email, formData.password, {
        role: appState.selectedRole!,
        name: formData.name,
        phone: formData.mobile,
        address: formData.address || `${formData.village || ''}, ${formData.district || ''}, ${formData.state || ''}`.replace(/^,\s*|,\s*$/g, '')
      });
      
      toast.dismiss('signup-loading');
      toast.success(
        `🎉 Account created successfully! Welcome to KrishiChain, ${formData.name}!`, 
        {
          duration: 5000,
          style: {
            background: 'var(--forest-green)',
            color: 'white',
            border: '1px solid var(--deep-green)'
          }
        }
      );
    } catch (error: any) {
      toast.dismiss('signup-loading');
      toast.error(`Signup failed: ${error.message}`, {
        duration: 5000
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      setAppState({
        currentPage: 'home',
        selectedRole: null,
        isAuthenticated: false,
        userData: null
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleBackToHome = () => {
    setAppState({
      currentPage: 'home',
      selectedRole: null,
      isAuthenticated: false,
      userData: null
    });
  };

  const handleGoToSignup = () => {
    setAppState({
      ...appState,
      currentPage: 'signup'
    });
  };

  const handleGoToLogin = () => {
    setAppState({
      ...appState,
      currentPage: 'login'
    });
  };

  const renderCurrentPage = () => {
    switch (appState.currentPage) {
      case 'home':
        return <HomePage onRoleSelect={handleRoleSelect} />;
      
      case 'login':
        return (
          <LoginPage
            role={appState.selectedRole as 'farmer' | 'distributor' | 'retailer'}
            onBack={handleBackToHome}
            onLogin={handleLogin}
            onSignupRedirect={handleGoToSignup}
          />
        );
      
      case 'signup':
        return (
          <SignupPage
            role={appState.selectedRole as 'farmer' | 'distributor' | 'retailer'}
            onBack={handleBackToHome}
            onSignup={handleSignup}
            onLoginRedirect={handleGoToLogin}
          />
        );
      
      case 'dashboard':
        if (!appState.isAuthenticated) {
          return <HomePage onRoleSelect={handleRoleSelect} />;
        }
        
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
      
      case 'qr-scanner':
        return <CustomerQRScanner onBack={handleBackToHome} />;
      
      
      default:
        return <HomePage onRoleSelect={handleRoleSelect} />;
    }
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-background text-foreground">
          {renderCurrentPage()}
          <ChatBot />
          <CropPriceNotification
            isVisible={showPriceNotification}
            onClose={() => setShowPriceNotification(false)}
          />
          <Toaster 
            position="top-right"
            richColors
            closeButton
          />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}