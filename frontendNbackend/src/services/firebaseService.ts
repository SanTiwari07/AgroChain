import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { auth, db } from '../../firebase.js';

export interface UserData {
  uid: string;
  email: string;
  role: 'farmer' | 'distributor' | 'retailer' | 'customer';
  name: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CropData {
  id?: string;
  farmerId: string;
  cropName: string;
  quantity: number;
  unit: string;
  price: number;
  harvestDate: Date;
  location: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionData {
  id?: string;
  sellerId: string;
  buyerId: string;
  cropId: string;
  quantity: number;
  price: number;
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// Authentication functions
export const signUp = async (email: string, password: string, userData: Partial<UserData>): Promise<UserData> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const newUser: UserData = {
      uid: user.uid,
      email: user.email!,
      role: userData.role!,
      name: userData.name!,
      phone: userData.phone,
      address: userData.address,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Store user data in Firestore
    await setDoc(doc(db, 'users', user.uid), newUser);
    
    return newUser;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// User data functions
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateUserData = async (uid: string, updates: Partial<UserData>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Crop data functions
export const addCrop = async (cropData: Omit<CropData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const cropRef = await addDoc(collection(db, 'crops'), {
      ...cropData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return cropRef.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getCropsByFarmer = async (farmerId: string): Promise<CropData[]> => {
  try {
    const q = query(collection(db, 'crops'), where('farmerId', '==', farmerId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CropData[];
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllCrops = async (): Promise<CropData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'crops'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CropData[];
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Transaction functions
export const createTransaction = async (transactionData: Omit<TransactionData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const transactionRef = await addDoc(collection(db, 'transactions'), {
      ...transactionData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return transactionRef.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getTransactionsByUser = async (userId: string): Promise<TransactionData[]> => {
  try {
    const q = query(
      collection(db, 'transactions'), 
      where('sellerId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TransactionData[];
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Get all users (admin function)
export const getAllUsers = async (): Promise<UserData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as UserData[];
  } catch (error: any) {
    throw new Error(error.message);
  }
};
