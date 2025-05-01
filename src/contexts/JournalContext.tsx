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

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [weeklySummary, setWeeklySummary] = useState<JournalSummary | null>(null);
  const [weeklySummaryLoading, setWeeklySummaryLoading] = useState<boolean>(false);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  
  const { currentUser } = useAuthContext();

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
    }, (error) => {
      console.error("Error fetching journal entries:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

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
          setWeeklySummary({
            id: summaryDoc.id,
            ...summaryDoc.data()
          } as JournalSummary);
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

  // Add a new journal entry
  const addEntry = async (entryData: NewJournalEntryData) => {
    if (!currentUser) {
      console.error("Cannot add entry: No user logged in.");
      return;
    }
    try {
      const userJournalCollection = `${BASE_JOURNAL_COLLECTION}/${currentUser.uid}/entries`;
      const journalCollectionRef = collection(db, userJournalCollection);
      await addDoc(journalCollectionRef, {
        ...entryData,
        date: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding journal entry:", error);
    }
  };

  // Update an existing entry
  const updateEntry = async (id: string, updates: Partial<Omit<JournalEntry, 'id' | 'date'>>) => {
    if (!currentUser) {
      console.error("Cannot update entry: No user logged in.");
      return;
    }
    try {
      const userJournalCollection = `${BASE_JOURNAL_COLLECTION}/${currentUser.uid}/entries`;
      const entryDocRef = doc(db, userJournalCollection, id);
      await updateDoc(entryDocRef, updates);
    } catch (error) {
      console.error("Error updating journal entry:", error);
    }
  };

  // Delete an entry
  const deleteEntry = async (id: string) => {
    if (!currentUser) {
      console.error("Cannot delete entry: No user logged in.");
      return;
    }
    try {
      const userJournalCollection = `${BASE_JOURNAL_COLLECTION}/${currentUser.uid}/entries`;
      const entryDocRef = doc(db, userJournalCollection, id);
      await deleteDoc(entryDocRef);
    } catch (error) {
      console.error("Error deleting journal entry:", error);
    }
  };

  // Generate weekly AI summary
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
      
      // Fetch entries for the past 7 days
      const userJournalCollection = `${BASE_JOURNAL_COLLECTION}/${currentUser.uid}/entries`;
      const journalCollectionRef = collection(db, userJournalCollection);
      const q = query(
        journalCollectionRef,
        where('date', '>=', startTimestamp),
        where('date', '<=', endTimestamp),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const recentEntries: JournalEntry[] = [];
      
      querySnapshot.forEach((doc) => {
        recentEntries.push({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date as Timestamp,
        } as JournalEntry);
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
      const apiEndpoint = import.meta.env.VITE_API_ENDPOINT?.replace('/chat', '/journal-summary');
      if (!apiEndpoint) {
        throw new Error("API endpoint is missing. Please check your .env file.");
      }
      
      // Call our backend proxy for Gemini
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
        summary: aiAnalysis.summary,
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
        themes: aiAnalysis.themes || [],
        insights: aiAnalysis.insights || [],
        recommendations: aiAnalysis.recommendations || []
      };
      
      // Save to Firestore
      const summariesPath = `${BASE_JOURNAL_COLLECTION}/${currentUser.uid}/${SUMMARIES_COLLECTION}`;
      const summariesRef = collection(db, summariesPath);
      const docRef = await addDoc(summariesRef, summaryData);
      
      // Update state with new summary
      const newSummary: JournalSummary = {
        id: docRef.id,
        ...summaryData
      };
      
      setWeeklySummary(newSummary);
    } catch (error) {
      console.error("Error generating weekly summary:", error);
      // Create simplified summary on error as fallback
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
          
          const fallbackSummary: Omit<JournalSummary, 'id'> = {
            createdAt: Timestamp.now(),
            startDate: Timestamp.fromDate(subDays(new Date(), 7)),
            endDate: Timestamp.now(),
            summary: "Weekly summary could not be generated with AI. Here's a simple statistical summary instead.",
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
            themes: ["Theme analysis unavailable"],
            insights: ["AI insights unavailable"],
            recommendations: ["Try journaling more regularly for better insights"]
          };
          
          // Save fallback summary
          const summariesPath = `${BASE_JOURNAL_COLLECTION}/${currentUser.uid}/${SUMMARIES_COLLECTION}`;
          const summariesRef = collection(db, summariesPath);
          addDoc(summariesRef, fallbackSummary)
            .then(docRef => {
              setWeeklySummary({
                id: docRef.id,
                ...fallbackSummary
              });
            })
            .catch(err => console.error("Error saving fallback summary:", err));
        }
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