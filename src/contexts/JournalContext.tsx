import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  setDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuthContext } from './AuthContext';
import { subDays, format } from 'date-fns';

// Define the shape of a journal entry
export interface JournalEntry {
  id: string;
  date: Timestamp;
  content: string;
  mood: number; // 1-5 scale
}

// Define the shape of a journal summary
export interface JournalSummary {
  id: string;
  createdAt: Timestamp;
  startDate: Timestamp;
  endDate: Timestamp;
  summary: string;
  moodTrends: {
    average: number;
    trend: 'improving' | 'declining' | 'stable';
    highestDay?: { date: Timestamp; mood: number };
    lowestDay?: { date: Timestamp; mood: number };
  };
  themes: string[];
  insights: string[];
  recommendations: string[];
}

// Define data for adding entries
interface NewJournalEntryData {
  content: string;
  mood: number;
}

// Define the context type
interface JournalContextType {
  entries: JournalEntry[];
  addEntry: (entryData: NewJournalEntryData) => Promise<void>;
  updateEntry: (id: string, updates: Partial<Omit<JournalEntry, 'id' | 'date'>>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  loading: boolean;
  
  // Weekly summary functionality
  weeklySummary: JournalSummary | null;
  weeklySummaryLoading: boolean;
  generateWeeklySummary: () => Promise<void>;
  streakCount: number;
  longestStreak: number;
  getEntryCountForDate: (date: Date) => number;
}

// Firestore collection paths
const BASE_JOURNAL_COLLECTION = 'userJournals';
const SUMMARIES_COLLECTION = 'summaries';

// Local storage keys
const LOCAL_STORAGE_ENTRIES_KEY = 'moodie_journal_entries';
const LOCAL_STORAGE_SUMMARY_KEY = 'moodie_journal_summary';

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [weeklySummary, setWeeklySummary] = useState<JournalSummary | null>(null);
  const [weeklySummaryLoading, setWeeklySummaryLoading] = useState<boolean>(false);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  
  const { currentUser } = useAuthContext();

  // Helper function: Convert Timestamp objects for localStorage serialization
  const serializeTimestamp = (timestamp: Timestamp) => ({
    seconds: timestamp.seconds,
    nanoseconds: timestamp.nanoseconds
  });

  // Helper function: Convert serialized timestamps back to Firestore Timestamp
  const deserializeTimestamp = (serialized: any): Timestamp => {
    if (!serialized) return Timestamp.now();
    
    if (serialized.seconds !== undefined) {
      return new Timestamp(serialized.seconds, serialized.nanoseconds || 0);
    }
    
    // Handle if it's a number (milliseconds)
    if (typeof serialized === 'number') {
      return Timestamp.fromMillis(serialized);
    }
    
    // Default
    return Timestamp.now();
  };

  // Load entries from local storage on initial mount
  useEffect(() => {
    if (!currentUser) return;
    
    try {
      const storedEntries = localStorage.getItem(`${LOCAL_STORAGE_ENTRIES_KEY}_${currentUser.uid}`);
      if (storedEntries) {
        const parsedEntries = JSON.parse(storedEntries);
        
        // Convert serialized dates back to Firestore Timestamps
        const convertedEntries = parsedEntries.map((entry: any) => ({
          ...entry,
          date: deserializeTimestamp(entry.date)
        }));
        
        setEntries(convertedEntries);
        calculateStreaks(convertedEntries);
        console.log("Successfully loaded entries from local storage:", convertedEntries.length);
      }
    } catch (error) {
      console.error("Error loading entries from local storage:", error);
    }
  }, [currentUser]);

  // Load summary from local storage on initial mount
  useEffect(() => {
    if (!currentUser) return;
    
    try {
      const storedSummary = localStorage.getItem(`${LOCAL_STORAGE_SUMMARY_KEY}_${currentUser.uid}`);
      if (storedSummary) {
        const parsedSummary = JSON.parse(storedSummary);
        
        // Convert serialized timestamps back to Firestore Timestamps
        const convertedSummary = {
          ...parsedSummary,
          createdAt: deserializeTimestamp(parsedSummary.createdAt),
          startDate: deserializeTimestamp(parsedSummary.startDate),
          endDate: deserializeTimestamp(parsedSummary.endDate),
          moodTrends: {
            ...parsedSummary.moodTrends,
            highestDay: parsedSummary.moodTrends.highestDay ? {
              ...parsedSummary.moodTrends.highestDay,
              date: deserializeTimestamp(parsedSummary.moodTrends.highestDay.date)
            } : undefined,
            lowestDay: parsedSummary.moodTrends.lowestDay ? {
              ...parsedSummary.moodTrends.lowestDay,
              date: deserializeTimestamp(parsedSummary.moodTrends.lowestDay.date)
            } : undefined
          }
        };
        
        setWeeklySummary(convertedSummary as JournalSummary);
        console.log("Successfully loaded summary from local storage");
      }
    } catch (error) {
      console.error("Error loading summary from local storage:", error);
    }
  }, [currentUser]);

  // Set up real-time listener for journal entries
  useEffect(() => {
    if (!currentUser) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const userJournalCollection = `${BASE_JOURNAL_COLLECTION}/${currentUser.uid}/entries`;
    const journalCollectionRef = collection(db, userJournalCollection);
    const q = query(journalCollectionRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedEntries: JournalEntry[] = [];
      querySnapshot.forEach((doc) => {
        fetchedEntries.push({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date as Timestamp,
        } as JournalEntry);
      });
      setEntries(fetchedEntries);
      setLoading(false);
      
      // Calculate streaks when entries change
      calculateStreaks(fetchedEntries);
      
      // Save to local storage for offline access
      saveEntriesToLocalStorage(fetchedEntries);
      
    }, (error) => {
      console.error("Error fetching journal entries:", error);
      setLoading(false);
      
      // No need to load from localStorage here as we already did it in the mount effect
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Save entries to local storage
  const saveEntriesToLocalStorage = (entriesToSave: JournalEntry[]) => {
    if (!currentUser || entriesToSave.length === 0) return;
    
    try {
      // Serialize entries for local storage (convert Timestamps)
      const serializedEntries = entriesToSave.map(entry => ({
        ...entry,
        date: serializeTimestamp(entry.date)
      }));
      
      localStorage.setItem(
        `${LOCAL_STORAGE_ENTRIES_KEY}_${currentUser.uid}`, 
        JSON.stringify(serializedEntries)
      );
      console.log("Saved entries to local storage:", entriesToSave.length);
    } catch (error) {
      console.error("Error saving entries to local storage:", error);
    }
  };

  // Save summary to local storage
  const saveSummaryToLocalStorage = (summary: JournalSummary) => {
    if (!currentUser || !summary) return;
    
    try {
      // Serialize summary for local storage (convert Timestamps)
      const serializedSummary = {
        ...summary,
        createdAt: serializeTimestamp(summary.createdAt),
        startDate: serializeTimestamp(summary.startDate),
        endDate: serializeTimestamp(summary.endDate),
        moodTrends: {
          ...summary.moodTrends,
          highestDay: summary.moodTrends.highestDay ? {
            ...summary.moodTrends.highestDay,
            date: serializeTimestamp(summary.moodTrends.highestDay.date)
          } : undefined,
          lowestDay: summary.moodTrends.lowestDay ? {
            ...summary.moodTrends.lowestDay,
            date: serializeTimestamp(summary.moodTrends.lowestDay.date)
          } : undefined
        }
      };
      
      localStorage.setItem(
        `${LOCAL_STORAGE_SUMMARY_KEY}_${currentUser.uid}`, 
        JSON.stringify(serializedSummary)
      );
      console.log("Saved summary to local storage");
    } catch (error) {
      console.error("Error saving summary to local storage:", error);
    }
  };

  // Load the most recent weekly summary
  useEffect(() => {
    if (!currentUser) {
      setWeeklySummary(null);
      return;
    }

    const loadLatestSummary = async () => {
      try {
        const summariesPath = `${BASE_JOURNAL_COLLECTION}/${currentUser.uid}/${SUMMARIES_COLLECTION}`;
        const summariesRef = collection(db, summariesPath);
        const q = query(summariesRef, orderBy('createdAt', 'desc'), limit(1));
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const summaryDoc = querySnapshot.docs[0];
          const newSummary = {
            id: summaryDoc.id,
            ...summaryDoc.data()
          } as JournalSummary;
          
          setWeeklySummary(newSummary);
          
          // Save to local storage
          saveSummaryToLocalStorage(newSummary);
        } else {
          setWeeklySummary(null);
        }
      } catch (error) {
        console.error("Error loading latest summary:", error);
        setWeeklySummary(null);
      }
    };

    loadLatestSummary();
  }, [currentUser]);

  // Calculate streaks
  const calculateStreaks = (journalEntries: JournalEntry[]) => {
    if (!journalEntries.length) {
      setStreakCount(0);
      setLongestStreak(0);
      return;
    }

    // Sort entries by date (newest first)
    const sortedEntries = [...journalEntries].sort((a, b) => 
      b.date.toMillis() - a.date.toMillis()
    );

    // Map entries to date strings (YYYY-MM-DD)
    const entryDates = sortedEntries.map(entry => 
      format(entry.date.toDate(), 'yyyy-MM-dd')
    );

    // Get unique dates (handle multiple entries per day)
    const uniqueDates = [...new Set(entryDates)];

    // Calculate current streak
    let currentStreak = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    // Check if there's an entry today or yesterday to start the streak
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      currentStreak = 1;
      
      // Check consecutive days
      for (let i = 1; i < uniqueDates.length; i++) {
        const currentDate = new Date(uniqueDates[i-1]);
        const prevDate = new Date(uniqueDates[i]);
        
        // Calculate difference in days
        const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break; // Streak broken
        }
      }
    }

    setStreakCount(currentStreak);

    // Calculate longest streak (iterating through all entries)
    let maxStreak = currentStreak;
    let tempStreak = 0;
    
    for (let i = 0; i < uniqueDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const currentDate = new Date(uniqueDates[i-1]);
        const prevDate = new Date(uniqueDates[i]);
        
        const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          // Reset streak counter
          if (tempStreak > maxStreak) {
            maxStreak = tempStreak;
          }
          tempStreak = 1;
        }
      }
    }
    
    // Check if the last streak calculation is the max
    if (tempStreak > maxStreak) {
      maxStreak = tempStreak;
    }
    
    setLongestStreak(maxStreak);
  };

  // Get entry count for a specific date (for calendar heatmap)
  const getEntryCountForDate = (date: Date): number => {
    const dateString = format(date, 'yyyy-MM-dd');
    return entries.filter(entry => 
      format(entry.date.toDate(), 'yyyy-MM-dd') === dateString
    ).length;
  };

  // Add a new journal entry with local storage backup
  const addEntry = async (entryData: NewJournalEntryData) => {
    if (!currentUser) {
      console.error("Cannot add entry: No user logged in.");
      return;
    }
    
    // Create a temporary local entry first for immediate UI update
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newEntry: JournalEntry = {
      id: tempId,
      content: entryData.content,
      mood: entryData.mood,
      date: Timestamp.now() // Use local timestamp for now
    };
    
    // Update local state immediately for responsive UI
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    calculateStreaks(updatedEntries);
    
    // Save to local storage immediately
    saveEntriesToLocalStorage(updatedEntries);
    
    try {
      // Then try to save to Firestore
      const userJournalCollection = `${BASE_JOURNAL_COLLECTION}/${currentUser.uid}/entries`;
      const journalCollectionRef = collection(db, userJournalCollection);
      const docRef = await addDoc(journalCollectionRef, {
        ...entryData,
        date: serverTimestamp(),
      });
      
      // If successful, update the temp entry with the real Firestore ID
      // This will happen automatically via the onSnapshot listener
      console.log("Entry successfully saved to Firestore with ID:", docRef.id);
      
    } catch (error) {
      console.error("Error adding journal entry to Firestore:", error);
      // Entry is already saved locally, so UI remains updated
      alert("Your journal entry was saved locally but couldn't be synced to the cloud. It will sync when your connection is restored.");
    }
  };

  // Update an existing entry with local storage backup
  const updateEntry = async (id: string, updates: Partial<Omit<JournalEntry, 'id' | 'date'>>) => {
    if (!currentUser) {
      console.error("Cannot update entry: No user logged in.");
      return;
    }
    
    // Update in local state first for immediate UI response
    const updatedEntries = entries.map(entry => 
      entry.id === id 
        ? { ...entry, ...updates } 
        : entry
    );
    
    setEntries(updatedEntries);
    calculateStreaks(updatedEntries);
    
    // Save to local storage immediately
    saveEntriesToLocalStorage(updatedEntries);
    
    try {
      // Then update in Firestore
      const userJournalCollection = `${BASE_JOURNAL_COLLECTION}/${currentUser.uid}/entries`;
      const entryDocRef = doc(db, userJournalCollection, id);
      await updateDoc(entryDocRef, updates);
      console.log("Entry successfully updated in Firestore");
      
    } catch (error) {
      console.error("Error updating journal entry in Firestore:", error);
      // Entry is already updated locally, so UI remains updated
      alert("Your journal update was saved locally but couldn't be synced to the cloud. It will sync when your connection is restored.");
    }
  };

  // Delete an entry with local storage backup
  const deleteEntry = async (id: string) => {
    if (!currentUser) {
      console.error("Cannot delete entry: No user logged in.");
      return;
    }
    
    // Remove from local state first for immediate UI response
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    calculateStreaks(updatedEntries);
    
    // Update local storage immediately
    saveEntriesToLocalStorage(updatedEntries);
    
    try {
      // Then delete from Firestore
      // Skip deletion if it's a temporary ID (not yet saved to Firestore)
      if (!id.startsWith('temp_')) {
        const userJournalCollection = `${BASE_JOURNAL_COLLECTION}/${currentUser.uid}/entries`;
        const entryDocRef = doc(db, userJournalCollection, id);
        await deleteDoc(entryDocRef);
        console.log("Entry successfully deleted from Firestore");
      }
      
    } catch (error) {
      console.error("Error deleting journal entry from Firestore:", error);
      // Entry is already deleted locally, so UI remains updated
      alert("The entry was removed locally but couldn't be deleted from the cloud. This will sync when your connection is restored.");
    }
  };

  // Generate weekly AI summary with local storage backup
  const generateWeeklySummary = async () => {
    if (!currentUser) {
      console.error("Cannot generate summary: No user logged in.");
      return;
    }

    setWeeklySummaryLoading(true);

    try {
      // Calculate date range for past 7 days
      const endDate = new Date();
      const startDate = subDays(endDate, 7);
      
      // Convert to Firestore Timestamps
      const endTimestamp = Timestamp.fromDate(endDate);
      const startTimestamp = Timestamp.fromDate(startDate);
      
      // Use entries from local state (which includes entries from both Firestore and local storage)
      const recentEntries = entries.filter(entry => {
        const entryDate = entry.date.toDate();
        return entryDate >= startDate && entryDate <= endDate;
      });
      
      // If no entries in the past week, return early
      if (recentEntries.length === 0) {
        setWeeklySummaryLoading(false);
        throw new Error("No journal entries found for the past week");
      }
      
      // Calculate basic mood trends
      const moodValues = recentEntries.map(entry => entry.mood);
      const avgMood = moodValues.reduce((a, b) => a + b, 0) / moodValues.length;
      
      // Sort entries by mood to find highest and lowest
      const sortedByMood = [...recentEntries].sort((a, b) => b.mood - a.mood);
      const highestMoodEntry = sortedByMood[0];
      const lowestMoodEntry = sortedByMood[sortedByMood.length - 1];
      
      // Format entries for AI analysis
      const entriesForAI = recentEntries.map(entry => ({
        date: format(entry.date.toDate(), 'yyyy-MM-dd'),
        content: entry.content,
        mood: entry.mood
      }));
      
      // Get our API endpoint
      const apiEndpoint = import.meta.env.VITE_JOURNAL_SUMMARY_ENDPOINT || 
                           import.meta.env.VITE_API_ENDPOINT?.replace('/chat', '/journal-summary');
      
      if (!apiEndpoint) {
        throw new Error("API endpoint is missing. Please check your .env file.");
      }
      
      // Call our backend proxy for AI analysis
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entries: entriesForAI,
          userName: currentUser.displayName || 'User'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
      
      const aiAnalysis = await response.json();
      
      // Create the summary object
      const summaryData: Omit<JournalSummary, 'id'> = {
        createdAt: Timestamp.now(),
        startDate: startTimestamp,
        endDate: endTimestamp,
        summary: aiAnalysis.summary || "Here's a summary of your journal entries for the past week.",
        moodTrends: {
          average: avgMood,
          trend: aiAnalysis.trend || 'stable',
          highestDay: {
            date: highestMoodEntry.date,
            mood: highestMoodEntry.mood
          },
          lowestDay: {
            date: lowestMoodEntry.date,
            mood: lowestMoodEntry.mood
          }
        },
        themes: aiAnalysis.themes || ["Journaling"],
        insights: aiAnalysis.insights || ["Regular journaling helps track your mood patterns."],
        recommendations: aiAnalysis.recommendations || ["Continue to journal regularly for better insights."]
      };
      
      // Create temp ID for local storage in case Firestore fails
      const tempSummary: JournalSummary = {
        id: `temp_summary_${Date.now()}`,
        ...summaryData
      };
      
      // Update state immediately
      setWeeklySummary(tempSummary);
      
      // Save to local storage immediately
      saveSummaryToLocalStorage(tempSummary);
      
      try {
        // Save to Firestore
        const summariesPath = `${BASE_JOURNAL_COLLECTION}/${currentUser.uid}/${SUMMARIES_COLLECTION}`;
        const summariesRef = collection(db, summariesPath);
        const docRef = await addDoc(summariesRef, summaryData);
        
        // Update with real ID if Firestore succeeds
        const newSummary = {
          id: docRef.id,
          ...summaryData
        };
        
        setWeeklySummary(newSummary);
        saveSummaryToLocalStorage(newSummary);
        
      } catch (firestoreError) {
        console.error("Error saving summary to Firestore:", firestoreError);
        // Summary is already in state and local storage, so UI remains updated
        alert("Your journal summary was generated and saved locally but couldn't be synced to the cloud. It will sync when your connection is restored.");
      }
      
    } catch (error) {
      console.error("Error generating weekly summary:", error);
      
      // Create local fallback summary without API
      if (entries.length > 0) {
        // Calculate basic stats without AI
        const recentEntries = entries.filter(entry => 
          entry.date.toDate() >= subDays(new Date(), 7)
        );
        
        if (recentEntries.length > 0) {
          const moodValues = recentEntries.map(entry => entry.mood);
          const avgMood = moodValues.reduce((a, b) => a + b, 0) / moodValues.length;
          
          const sortedByMood = [...recentEntries].sort((a, b) => b.mood - a.mood);
          const highestMoodEntry = sortedByMood[0];
          const lowestMoodEntry = sortedByMood[sortedByMood.length - 1];
          
          const fallbackSummary: JournalSummary = {
            id: `local_${Date.now()}`,
            createdAt: Timestamp.now(),
            startDate: Timestamp.fromDate(subDays(new Date(), 7)),
            endDate: Timestamp.now(),
            summary: "Weekly summary could not be generated with AI. Here's a simple statistical summary based on your entries.",
            moodTrends: {
              average: avgMood,
              trend: 'stable',
              highestDay: {
                date: highestMoodEntry.date,
                mood: highestMoodEntry.mood
              },
              lowestDay: {
                date: lowestMoodEntry.date,
                mood: lowestMoodEntry.mood
              }
            },
            themes: ["Journaling"],
            insights: ["You've been journaling regularly."],
            recommendations: ["Continue journaling to track your mood patterns."]
          };
          
          // Update state with local fallback
          setWeeklySummary(fallbackSummary);
          
          // Save local fallback to local storage
          saveSummaryToLocalStorage(fallbackSummary);
          
          // Try to save to Firestore if possible
          try {
            const summariesPath = `${BASE_JOURNAL_COLLECTION}/${currentUser.uid}/${SUMMARIES_COLLECTION}`;
            const summariesRef = collection(db, summariesPath);
            
            // Use destructuring to create a new object without id
            const { id, ...fallbackDataWithoutId } = fallbackSummary;
            
            addDoc(summariesRef, fallbackDataWithoutId)
              .then(docRef => {
                const updatedSummary = {
                  ...fallbackSummary,
                  id: docRef.id
                };
                setWeeklySummary(updatedSummary);
                saveSummaryToLocalStorage(updatedSummary);
              })
              .catch(err => console.error("Error saving fallback summary to Firestore:", err));
              
          } catch (firestoreError) {
            console.error("Error initializing Firestore save for fallback summary:", firestoreError);
          }
        } else {
          alert("No journal entries found for the past week. Please add some entries first.");
        }
      } else {
        alert("No journal entries found. Please add some entries first.");
      }
    } finally {
      setWeeklySummaryLoading(false);
    }
  };

  // Context value
  const value = {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    loading,
    weeklySummary,
    weeklySummaryLoading,
    generateWeeklySummary,
    streakCount,
    longestStreak,
    getEntryCountForDate
  };

  return (
    <JournalContext.Provider value={value}>
      {children}
    </JournalContext.Provider>
  );
};

// Hook for using the journal context
export const useJournalContext = (): JournalContextType => {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error('useJournalContext must be used within a JournalProvider');
  }
  return context;
};