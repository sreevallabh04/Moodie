import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Import initialized auth instance

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start loading until auth state is determined

  useEffect(() => {
    // Listener for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Auth state determined, stop loading
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Google Sign-In function
  const signInWithGoogle = async () => {
    setLoading(true); // Indicate loading during sign-in process
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle setting the user and setLoading(false)
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setLoading(false); // Stop loading on error
      // Handle error appropriately (e.g., show message to user)
    }
  };

  // Sign-Out function
  const signOut = async () => {
    setLoading(true); // Indicate loading during sign-out
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will set currentUser to null and setLoading(false)
    } catch (error) {
      console.error("Error signing out:", error);
      setLoading(false); // Stop loading on error
    }
  };

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signOut,
  };

  // Render children immediately; components can use the 'loading' state
  // from the context to show their own loading indicators if needed.
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
