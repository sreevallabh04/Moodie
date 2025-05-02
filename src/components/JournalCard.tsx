import React from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { JournalEntry } from '../contexts/JournalContext';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp here

interface JournalCardProps {
  entry: JournalEntry;
  onClick?: () => void; // Optional onClick handler
}

// Component with onClick support
const JournalCard: React.FC<JournalCardProps> = ({ entry, onClick }) => {
  // Convert Firestore Timestamp to JS Date before formatting
  const jsDate = entry.date instanceof Timestamp ? entry.date.toDate() : entry.date;
  const formattedDate = format(jsDate, 'MMMM d, yyyy');

  const shortText = entry.content.length > 150
    ? entry.content.substring(0, 150) + '...'
    : entry.content;
    
  const moodEmojis = ['😔', '😕', '😐', '🙂', '😊'];
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-soft overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">{formattedDate}</span>
        <span className="text-xl" title={`Mood level: ${entry.mood}`}>
          {moodEmojis[entry.mood - 1]}
        </span>
      </div>
      <div className="p-4">
        <p className="text-gray-700 whitespace-pre-line">{shortText}</p>
        {entry.content.length > 150 && (
          <button 
            className="mt-2 text-primary-500 text-sm font-medium hover:underline"
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the parent onClick
              onClick && onClick();
            }}
          >
            Read more
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default JournalCard;