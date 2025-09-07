import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'hi' | 'or';

type Translations = {
  [key: string]: {
    [L in Language]: string;
  };
};

const translations: Translations = {
  'KrishiChain': {
    en: 'KrishiChain',
    hi: 'कृषिचेन',
    or: 'କୃଷିଚେନ୍'
  },
  'farmer': {
    en: 'Farmer',
    hi: 'किसान',
    or: 'କୃଷକ'
  },
  'distributor': {
    en: 'Distributor',
    hi: 'वितरक',
    or: 'ବିତରଣକାରୀ'
  },
  'retailer': {
    en: 'Retailer',
    hi: 'खुदरा विक्रेता',
    or: 'ଖୁଚୁରା ବିକ୍ରେତା'
  },
  'customer': {
    en: 'Customer',
    hi: 'ग्राहक',
    or: 'ଗ୍ରାହକ'
  },
  'continue': {
    en: 'Continue',
    hi: 'जारी रखें',
    or: 'ଆଗେଇ ଚାଲନ୍ତୁ'
  },
  'scanQR': {
    en: 'Scan QR Code',
    hi: 'QR कोड स्कैन करें',
    or: 'QR କୋଡ୍ ସ୍କାନ୍ କରନ୍ତୁ'
  },
  'login': {
    en: 'Login',
    hi: 'लॉगिन',
    or: 'ଲଗଇନ୍'
  },
  'signup': {
    en: 'Sign Up',
    hi: 'साइन अप',
    or: 'ସାଇନ୍ ଅପ୍'
  },
  'name': {
    en: 'Name',
    hi: 'नाम',
    or: 'ନାମ'
  },
  'email': {
    en: 'Email',
    hi: 'ईमेल',
    or: 'ଇମେଲ୍'
  },
  'password': {
    en: 'Password',
    hi: 'पासवर्ड',
    or: 'ପାସୱାର୍ଡ'
  },
  'mobile': {
    en: 'Mobile Number',
    hi: 'मोबाइल नंबर',
    or: 'ମୋବାଇଲ୍ ନମ୍ବର'
  },
  'village': {
    en: 'Village',
    hi: 'गांव',
    or: 'ଗ୍ରାମ'
  },
  'state': {
    en: 'State',
    hi: 'राज्य',
    or: 'ରାଜ୍ୟ'
  },
  'district': {
    en: 'District',
    hi: 'जिला',
    or: 'ଜିଲ୍ଲା'
  },
  'dashboard': {
    en: 'Dashboard',
    hi: 'डैशबोर्ड',
    or: 'ଡ୍ୟାସବୋର୍ଡ'
  },
  'addCrop': {
    en: 'Add Crop',
    hi: 'फसल जोड़ें',
    or: 'ଫସଲ ଯୋଗ କରନ୍ତୁ'
  },
  'cropName': {
    en: 'Crop Name',
    hi: 'फसल का नाम',
    or: 'ଫସଲର ନାମ'
  },
  'totalWeight': {
    en: 'Total Weight (kg)',
    hi: 'कुल वजन (किलो)',
    or: 'ମୋଟ ଓଜନ (କିଲୋ)'
  },
  'harvestDate': {
    en: 'Date of Harvest',
    hi: 'कटाई की तारीख',
    or: 'ଅମଳ ତାରିଖ'
  },
  'expectedPrice': {
    en: 'Expected Price (₹/kg)',
    hi: 'अपेक्ष���त मूल्य (₹/किलो)',
    or: 'ଆଶାକରାଯାଉଥିବା ମୂଲ୍ୟ (₹/କିଲୋ)'
  },
  'marketPrices': {
    en: 'Market Prices',
    hi: 'बाजार भाव',
    or: 'ବଜାର ଦର'
  },
  'transactionHistory': {
    en: 'Transaction History',
    hi: 'लेनदेन इतिहास',
    or: 'କାରବାର ଇତିହାସ'
  }
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}