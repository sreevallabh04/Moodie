import React, { useState, useRef, useEffect, memo, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import {
  Send, 
  BookOpen, 
  Plus, 
  Settings, 
  MessageCircle, 
  ChevronDown,
  Sparkles,
  Brain,
  BookOpenText,
  MoreHorizontal,
  X,
  Menu
} from 'lucide-react';
import { useChatContext, AIPersonalityType } from '../contexts/ChatContext';
import Button from '../components/Button';
// Import Timestamp for proper typing
import { Timestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

// Personality selector component
const PersonalitySelector: React.FC = () => {
  const { aiPersonality, setAIPersonality } = useChatContext();
  const [isOpen, setIsOpen] = useState(false);

  // Define personality options
  const personalities = [
    {
      id: 'gen_z_bff',
      name: 'Gen Z BFF',
      emoji: '😎',
      description: 'Casual, funny, uses slang',
      icon: <Sparkles size={18} />
    },
    {
      id: 'mindful_therapist',
      name: 'Mindful Therapist',
      emoji: '🧠',
      description: 'Calm, empathetic, reflective',
      icon: <Brain size={18} />
    },
    {
      id: 'stoic_philosopher',
      name: 'Stoic Philosopher',
      emoji: '📚',
      description: 'Wise, rational, principled',
      icon: <BookOpenText size={18} />
    },
    {
      id: 'default',
      name: 'Balanced',
      emoji: '🙂',
      description: 'Friendly, supportive, balanced',
      icon: <MessageCircle size={18} />
    }
  ];

  // Find the current personality
  const currentPersonality = personalities.find(p => p.id === aiPersonality) || personalities[3];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <span>{currentPersonality.emoji}</span>
        <span>{currentPersonality.name}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 z-20 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-medium text-gray-500">
                  Choose personality
                </div>
                {personalities.map(personality => (
                  <button
                    key={personality.id}
                    onClick={() => {
                      setAIPersonality(personality.id as AIPersonalityType);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
                      personality.id === aiPersonality
                        ? 'bg-primary-100 text-primary-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="w-8 text-center text-lg">{personality.emoji}</span>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{personality.name}</span>
                      <span className="text-xs text-gray-500">{personality.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Lazy-loaded components to improve initial load time
const ChatMessage = lazy(() => import('../components/ChatMessage'));

// Define ChatMessageProps interface directly
interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Timestamp;
}

// Define types for MemoizedChatMessage
interface MemoizedChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: any; // Using any for now, will refine if needed
}

// Message Skeleton for loading state
const MessageSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-start gap-2 mb-4">
      <div className="rounded-full bg-gray-200 h-8 w-8"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded w-3/4 mb-1"></div>
        <div className="h-10 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

// Error Fallback with proper types
const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => (
  <div className="p-4 border border-red-300 rounded-md bg-red-50 text-red-700">
    <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
    <p className="mb-3">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
    >
      Try again
    </button>
  </div>
);

// Memoized chat message for better performance
const MemoizedChatMessage = memo(({ message, isUser, timestamp }: MemoizedChatMessageProps) => (
  <Suspense fallback={<MessageSkeleton />}>
    <ChatMessage message={message} isUser={isUser} timestamp={timestamp} />
  </Suspense>
));

// Conversation Sidebar Component
const ConversationSidebar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { 
    conversations, 
    currentConversationId, 
    startNewConversation, 
    selectConversation 
  } = useChatContext();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-20 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-y-0 left-0 w-72 bg-white shadow-lg z-30 pt-16 flex flex-col"
          >
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="font-semibold text-gray-800">Conversations</h2>
              <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 lg:hidden"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-2">
              <button
                onClick={() => {
                  startNewConversation();
                  onClose();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
              >
                <Plus size={18} />
                <span>New Conversation</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No conversations yet
                </div>
              ) : (
                conversations.map(conversation => (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      selectConversation(conversation.id);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left truncate ${
                      conversation.id === currentConversationId
                        ? 'bg-primary-100 text-primary-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <MessageCircle size={18} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{conversation.title}</div>
                      <div className="text-xs text-gray-500">
                        {format(conversation.lastUpdated, 'MMM d, yyyy')}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="p-4 border-t">
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100">
                <Settings size={18} />
                <span>Settings</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const ChatPage: React.FC = () => {
  // Get context values including pagination
  const { 
    messages, 
    sendMessage, 
    loadingApi, 
    loadingMessages,
    conversations,
    startNewConversation,
    hasMoreMessages,
    loadMoreMessages
  } = useChatContext();
  
  const [inputMessage, setInputMessage] = useState('');
  const [showJournalPrompt, setShowJournalPrompt] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !loadingApi) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const toggleJournalPrompt = () => {
    setShowJournalPrompt(!showJournalPrompt);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Init conversation if none exists
  useEffect(() => {
    if (conversations.length === 0 && !loadingMessages) {
      startNewConversation();
    }
  }, [conversations.length, loadingMessages, startNewConversation]);

  // Daily journal prompt
  const dailyPrompt = "How are you feeling today? What's one small thing that made you smile?";

  return (
    <>
      {/* Conversation Sidebar */}
      <ConversationSidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />

      <div className="min-h-screen pt-16 pb-0 flex flex-col">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex-grow flex flex-col">
          <div className="bg-white rounded-t-2xl shadow-md flex-grow flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <button 
                  onClick={() => setShowSidebar(true)}
                  className="mr-3 p-2 rounded-full hover:bg-gray-100"
                  title="Conversations"
                >
                  <Menu size={20} />
                </button>
                
                <h1 className="text-xl font-semibold text-gray-800">Chat with Moodie</h1>
              </div>
              
              <div className="flex items-center gap-2">
                <PersonalitySelector />
                
                <button 
                  className="p-2 rounded-full hover:bg-gray-100"
                  title="More options"
                >
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>

            {/* Chat messages area with loading states */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {/* Load More Messages Button */}
              {hasMoreMessages && !loadingMessages && (
                <div className="flex justify-center mb-4">
                  <button
                    onClick={loadMoreMessages}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    Load earlier messages
                  </button>
                </div>
              )}
              
              {/* Loading Skeleton State */}
              {loadingMessages ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <MessageSkeleton key={i} />
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                    className="bg-primary-100 rounded-full p-6 mb-4"
                  >
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 5, 0, -5, 0]
                      }}
                      transition={{ 
                        duration: 5, 
                        repeat: Infinity,
                        repeatType: 'mirror'
                      }}
                    >
                      <img 
                        src="https://images.pexels.com/photos/7130560/pexels-photo-7130560.jpeg?auto=compress&cs=tinysrgb&w=600" 
                        alt="Welcome to Moodie" 
                        className="w-32 h-32 object-cover rounded-full shadow-md"
                      />
                    </motion.div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Hey there! I'm Moodie</h2>
                    <p className="text-gray-600 max-w-md mb-6">
                      Your AI buddy who's here to chat, listen, and help you reflect. 
                      What's on your mind today?
                    </p>
                    <Button 
                      variant="primary" 
                      onClick={() => {
                        sendMessage("Hi Moodie! I'm feeling a bit stressed today.");
                      }}
                      className="shadow-md hover:shadow-lg transform transition hover:-translate-y-1"
                    >
                      Start the conversation
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <>
                  <ErrorBoundary
                    FallbackComponent={ErrorFallback}
                    onReset={() => {
                      // Reset the error state
                    }}
                  >
                    {messages.map((message, index) => (
                      <MemoizedChatMessage
                        key={message.id || index}
                        message={message.text}
                        isUser={message.isUser}
                        timestamp={message.timestamp}
                      />
                    ))}
                  </ErrorBoundary>
                  
                  {/* Thinking indicator */}
                  {/* Optimized thinking indicator */}
                  {loadingApi && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2 text-gray-500"
                    >
                      <div className="bg-gray-100 px-4 py-2 rounded-full inline-flex items-center">
                        <div className="relative flex">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce ml-1" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce ml-1" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm ml-2">Moodie is thinking...</span>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Journal prompt drawer */}
            <AnimatePresence>
              {showJournalPrompt && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-200 bg-primary-50 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-gray-800">Today's Journal Prompt</h3>
                        <button 
                          onClick={toggleJournalPrompt}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <p className="text-gray-600 mb-3">{dailyPrompt}</p>
                      <Button 
                        to="/journal" 
                        variant="primary" 
                        size="sm"
                        className="shadow-sm hover:shadow transition-all"
                      >
                        Write in Journal
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat input area */}
            <div className="border-t border-gray-200 p-3">
              <div className="flex items-center">
                <button 
                  onClick={toggleJournalPrompt}
                  className="p-2 rounded-full text-gray-500 hover:text-primary-500 hover:bg-primary-50 mr-2"
                  title="Journal prompt"
                >
                  <BookOpen size={20} />
                </button>
                
                <form onSubmit={handleSubmit} className="flex-grow flex">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow px-4 py-2 bg-gray-100 rounded-l-full focus:outline-none focus:ring-2 focus:ring-primary-300"
                    disabled={loadingApi} // Disable during API call
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || loadingApi}
                    className={`px-4 py-2 rounded-r-full transition-colors ${
                      !inputMessage.trim() || loadingApi 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-primary-500 hover:bg-primary-600 text-white'
                    }`}
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPage;