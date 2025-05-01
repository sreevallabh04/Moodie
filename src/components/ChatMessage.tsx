import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import anime from 'animejs';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Timestamp; // Expect Firestore Timestamp
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser, timestamp }) => {
  const messageRef = useRef<HTMLDivElement>(null);
  // Convert Timestamp to JS Date before formatting
  const jsDate = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  const formattedTime = format(jsDate, 'h:mm a');
  
  useEffect(() => {
    if (messageRef.current) {
      anime({
        targets: messageRef.current,
        translateX: [isUser ? 20 : -20, 0],
        opacity: [0, 1],
        easing: 'spring(1, 80, 10, 0)',
        duration: 800
      });
    }
  }, [isUser]);
  
  return (
    <motion.div 
      ref={messageRef}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-xs sm:max-w-md ${isUser ? 'order-1' : 'order-1'}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-primary-400 text-gray-800 rounded-br-none'
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          }`}
        >
          <p className="whitespace-pre-wrap">{message}</p>
        </div>
        <span className={`text-xs text-gray-500 mt-1 block ${isUser ? 'text-right' : 'text-left'}`}>
          {formattedTime}
        </span>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
