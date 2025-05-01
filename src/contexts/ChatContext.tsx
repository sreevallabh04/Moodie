import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Import the initialized db instance
import { useAuthContext } from './AuthContext';

// Define the shape of a chat message using Firestore Timestamp
interface Message {
  id?: string; // Firestore document ID (optional for new messages)
  text: string;
  isUser: boolean;
  timestamp: Timestamp; // Use Firestore Timestamp
}

// Define the shape of the data for adding (timestamp handled by server)
interface NewMessageData {
  text: string;
  isUser: boolean;
}

// Add Personality Type
export type AIPersonalityType = 'gen_z_bff' | 'mindful_therapist' | 'stoic_philosopher' | 'default';

// Expand the context type
interface ChatContextType {
  messages: Message[];
  sendMessage: (text: string) => Promise<void>;
  loadingApi: boolean;
  loadingMessages: boolean;
  aiPersonality: AIPersonalityType;
  setAIPersonality: (personality: AIPersonalityType) => Promise<void>;
  conversations: Array<{id: string, title: string, lastUpdated: Date}>;
  currentConversationId: string | null;
  startNewConversation: () => Promise<string | undefined>;
  selectConversation: (conversationId: string) => Promise<void>;
  // Pagination properties
  hasMoreMessages: boolean;
  loadMoreMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Base collections
const BASE_CHAT_COLLECTION = 'userChats';
const USER_SETTINGS_COLLECTION = 'userSettings';
const CONVERSATIONS_COLLECTION = 'conversations';

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingApi, setLoadingApi] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [aiPersonality, setPersonality] = useState<AIPersonalityType>('default');
  const [conversations, setConversations] = useState<Array<{id: string, title: string, lastUpdated: Date}>>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  const { currentUser } = useAuthContext();

  // Load user settings (including preferred AI personality)
  useEffect(() => {
    if (!currentUser) return;

    const loadUserSettings = async () => {
      try {
        const userSettingsRef = doc(db, USER_SETTINGS_COLLECTION, currentUser.uid);
        const userSettingsDoc = await getDoc(userSettingsRef);
        
        if (userSettingsDoc.exists()) {
          const data = userSettingsDoc.data();
          // Set personality if found in settings
          if (data.aiPersonality) {
            setPersonality(data.aiPersonality as AIPersonalityType);
          }
          
          // Set active conversation if found
          if (data.activeConversationId) {
            setCurrentConversationId(data.activeConversationId);
          }
        } else {
          // Create default settings document
          await setDoc(userSettingsRef, {
            aiPersonality: 'default',
            activeConversationId: null,
            createdAt: serverTimestamp()
          });
        }
      } catch (error) {
        console.error("Error loading user settings:", error);
      }
    };
    
    loadUserSettings();
  }, [currentUser]);

  // Load user conversations
  useEffect(() => {
    if (!currentUser) {
      setConversations([]);
      return;
    }
    
    const userConversationsRef = collection(db, `${USER_SETTINGS_COLLECTION}/${currentUser.uid}/${CONVERSATIONS_COLLECTION}`);
    const q = query(userConversationsRef, orderBy('lastUpdated', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversationsList: Array<{id: string, title: string, lastUpdated: Date}> = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        conversationsList.push({
          id: doc.id,
          title: data.title || 'Unnamed Conversation',
          lastUpdated: data.lastUpdated?.toDate() || new Date()
        });
      });
      
      setConversations(conversationsList);
      
      // If no current conversation is selected and we have conversations, select the first one
      if (!currentConversationId && conversationsList.length > 0) {
        setCurrentConversationId(conversationsList[0].id);
      }
    });
    
    return () => unsubscribe();
  }, [currentUser, currentConversationId]);

  // Message pagination control
  const [messageLimit, setMessageLimit] = useState(20); // Default: load 20 most recent messages
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  
  // Function to load more messages
  const loadMoreMessages = () => {
    setMessageLimit(prevLimit => prevLimit + 20);
  };
  
  // Message cache to improve performance
  const messageCache = useRef<Record<string, Message[]>>({});
  
  // Set up real-time listener for chat messages with pagination
  useEffect(() => {
    if (!currentUser || !currentConversationId) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    setLoadingMessages(true);
    const messagesPath = `${BASE_CHAT_COLLECTION}/${currentUser.uid}/${CONVERSATIONS_COLLECTION}/${currentConversationId}/messages`;
    const messagesRef = collection(db, messagesPath);
    
    // Get the most recent messages first, limited by messageLimit
    const q = query(
      messagesRef, 
      orderBy('timestamp', 'desc'), 
      limit(messageLimit)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages: Message[] = [];
      
      querySnapshot.forEach((doc) => {
        fetchedMessages.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp as Timestamp,
        } as Message);
      });
      
      // Reverse to get chronological order
      fetchedMessages.reverse();
      
      // Check if we have more messages to load
      setHasMoreMessages(fetchedMessages.length >= messageLimit);
      
      // Update message cache
      messageCache.current[currentConversationId] = fetchedMessages;
      
      setMessages(fetchedMessages);
      setLoadingMessages(false);
    }, (error) => {
      console.error("Error fetching chat messages:", error);
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [currentUser, currentConversationId, messageLimit]);

  // Function to add a message to the current conversation in Firestore
  const addMessageToFirestore = async (messageData: NewMessageData) => {
    if (!currentUser || !currentConversationId) {
      console.error("Cannot add message: No user logged in or no active conversation.");
      return;
    }
    
    try {
      const messagesPath = `${BASE_CHAT_COLLECTION}/${currentUser.uid}/${CONVERSATIONS_COLLECTION}/${currentConversationId}/messages`;
      const messagesRef = collection(db, messagesPath);
      
      // Add the message
      await addDoc(messagesRef, {
        ...messageData,
        timestamp: serverTimestamp(),
      });
      
      // Update conversation's lastUpdated timestamp
      const conversationRef = doc(db, `${USER_SETTINGS_COLLECTION}/${currentUser.uid}/${CONVERSATIONS_COLLECTION}`, currentConversationId);
      await setDoc(conversationRef, {
        lastUpdated: serverTimestamp()
      }, { merge: true });
      
      // If this is the first message, update the conversation title
      if (messages.length === 0 && messageData.isUser) {
        // Use first few words of user message as conversation title
        const title = messageData.text.split(' ').slice(0, 5).join(' ') + '...';
        await setDoc(conversationRef, { title }, { merge: true });
      }
    } catch (error) {
      console.error("Error adding message to Firestore:", error);
    }
  };

  // Start a new conversation
  const startNewConversation = async () => {
    if (!currentUser) return;
    
    try {
      // Create a new conversation document
      const userConversationsRef = collection(db, `${USER_SETTINGS_COLLECTION}/${currentUser.uid}/${CONVERSATIONS_COLLECTION}`);
      const newConversationRef = await addDoc(userConversationsRef, {
        title: 'New Conversation',
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      
      // Set as active conversation
      setCurrentConversationId(newConversationRef.id);
      
      // Update user settings with new active conversation
      const userSettingsRef = doc(db, USER_SETTINGS_COLLECTION, currentUser.uid);
      await setDoc(userSettingsRef, {
        activeConversationId: newConversationRef.id
      }, { merge: true });
      
      return newConversationRef.id;
    } catch (error) {
      console.error("Error creating new conversation:", error);
    }
  };

  // Select an existing conversation
  const selectConversation = async (conversationId: string) => {
    if (!currentUser) return;
    
    try {
      setCurrentConversationId(conversationId);
      
      // Update user settings with active conversation
      const userSettingsRef = doc(db, USER_SETTINGS_COLLECTION, currentUser.uid);
      await setDoc(userSettingsRef, {
        activeConversationId: conversationId
      }, { merge: true });
    } catch (error) {
      console.error("Error selecting conversation:", error);
    }
  };

  // Update AI personality
  const setAIPersonality = async (personality: AIPersonalityType) => {
    if (!currentUser) return;
    
    try {
      setPersonality(personality);
      
      // Save to user settings
      const userSettingsRef = doc(db, USER_SETTINGS_COLLECTION, currentUser.uid);
      await setDoc(userSettingsRef, {
        aiPersonality: personality
      }, { merge: true });
    } catch (error) {
      console.error("Error updating AI personality:", error);
    }
  };

  // Direct Firestore message function for fallback mode
  const generateDirectFirestoreResponse = async (userMessage: string): Promise<string> => {
    // Determine which AI personality to use for the response
    let response = "";
    
    switch (aiPersonality) {
      case 'gen_z_bff':
        response = `Hey! 👋 Thanks for your message. Seems like we're having trouble connecting to our AI right now, but I wanted to acknowledge that I got your message: "${userMessage}". Let's chat more when the connection is back! In the meantime, feel free to keep sharing your thoughts or check out the mood tracker. 😊`;
        break;
      case 'mindful_therapist':
        response = `I notice you've shared something with me, and I want to acknowledge receiving your message: "${userMessage}". It appears we're experiencing a temporary connection issue with our AI service. This moment offers an opportunity to practice patience. I'll be here when the connection returns. In the meantime, perhaps consider a brief mindfulness exercise or exploring your mood patterns in the tracker.`;
        break;
      case 'stoic_philosopher':
        response = `I have received your message: "${userMessage}". It seems the connection to our wisdom servers is temporarily severed - a reminder that technology, like all external things, is not entirely within our control. What is within our control is how we respond to such obstacles. Perhaps use this moment to reflect on your thoughts independently. The connection will be restored in time.`;
        break;
      default:
        response = `Thank you for your message. It looks like we're having trouble connecting to our AI service right now. I've received what you shared: "${userMessage}". Please try again shortly, or feel free to continue journaling your thoughts even while offline. We'll get back to our conversation as soon as possible.`;
    }
    
    return response;
  };

  // Function to send user message and get AI response with failover to direct Firestore
  const sendMessage = async (text: string) => {
    if (!currentUser) {
      console.error("Cannot send message: No user logged in.");
      return;
    }
    
    // Ensure we have an active conversation
    if (!currentConversationId) {
      await startNewConversation();
    }

    // Add user message to Firestore
    const userMessageData: NewMessageData = { text, isUser: true };
    await addMessageToFirestore(userMessageData);

    setLoadingApi(true);

    // Prepare message history for API
    const historyLimit = 10; // Send last 10 messages for context
    const recentMessages = messages.slice(-historyLimit);

    try {
      // Get API endpoint from environment variables
      const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
      if (!apiEndpoint) {
        throw new Error("API endpoint is missing. Please check your .env file.");
      }

      // Call our backend proxy
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...recentMessages,
            { text, isUser: true }
          ],
          aiPersonality // Send selected personality
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${data.error || 'Unknown error'}`);
      }

      // Add AI message to Firestore
      const aiMessageData: NewMessageData = {
        text: data.text,
        isUser: false,
      };
      await addMessageToFirestore(aiMessageData);

    } catch (error) {
      console.error('Error calling AI API or processing response:', error);
      
      // Generate a direct Firestore response as fallback
      try {
        console.log("Falling back to direct Firestore response generation");
        const fallbackResponse = await generateDirectFirestoreResponse(text);
        
        // Add the fallback response to Firestore
        const fallbackMessageData: NewMessageData = {
          text: fallbackResponse,
          isUser: false,
        };
        await addMessageToFirestore(fallbackMessageData);
        
      } catch (fallbackError) {
        console.error("Fallback response generation failed:", fallbackError);
        
        // If all else fails, add a generic error message
        let errorText: string;
        
        if (error instanceof Error) {
          if (error.message.includes("API endpoint is missing")) {
            errorText = "⚠️ API setup error: Missing endpoint configuration.";
          } else if (error.message.includes("All AI keys are temporarily down")) {
            errorText = "Sorry, our AI service is temporarily unavailable. Please try again later. 🛠️";
          } else {
            errorText = `Oops, something went wrong: ${error.message}. Please try again.`;
          }
        } else {
          errorText = "💫 Connection issue. Can we try again?";
        }
        
        const errorMessageData: NewMessageData = { text: errorText, isUser: false };
        await addMessageToFirestore(errorMessageData);
      }
    } finally {
      setLoadingApi(false);
    }
  };

  // Provide context value with pagination functions
  const value = {
    messages,
    sendMessage,
    loadingApi,
    loadingMessages,
    aiPersonality,
    setAIPersonality,
    conversations,
    currentConversationId,
    startNewConversation,
    selectConversation,
    // Add pagination controls
    hasMoreMessages,
    loadMoreMessages
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// Context hook
export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};