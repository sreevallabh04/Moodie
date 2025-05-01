import React, { useRef, useEffect } from 'react'; // Removed useState
import { motion } from 'framer-motion';
import anime from 'animejs';

// Define props for controlled component
interface MoodSliderProps {
  value: number; // Current mood value (1-5 scale expected from parent)
  onChange: (newValue: number) => void; // Function to call when mood changes (passes 1-5 scale)
}

const MoodSlider: React.FC<MoodSliderProps> = ({ value, onChange }) => {
  // Removed internal state: const [mood, setMood] = useState<number>(3);
  const containerRef = useRef<HTMLDivElement>(null);

  const moods = [
    { emoji: '😔', label: 'Low', color: 'bg-gray-200' },        // Corresponds to value 1
    { emoji: '😕', label: 'Down', color: 'bg-gray-200' },       // Corresponds to value 2
    { emoji: '😐', label: 'Neutral', color: 'bg-gray-200' },    // Corresponds to value 3
    { emoji: '🙂', label: 'Good', color: 'bg-primary-200' },    // Corresponds to value 4
    { emoji: '😊', label: 'Great', color: 'bg-primary-400' },   // Corresponds to value 5
  ];

  // Animation effect on mount
  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current.querySelectorAll('button'),
        scale: [0.8, 1],
        opacity: [0, 1],
        delay: anime.stagger(100),
        easing: 'spring(1, 80, 10, 0)',
        duration: 800
      });
    }
  }, []);

  // Handle click, call parent's onChange, and animate
  const handleMoodSelect = (index: number) => {
    const selectedValue = index + 1; // Convert 0-based index to 1-5 scale
    onChange(selectedValue); // Call parent's onChange handler with the 1-5 value

    // Animate the selected button
    if (containerRef.current) {
      const button = containerRef.current.querySelectorAll('button')[index];
      if (button) { // Check if button exists
        anime({
          targets: button,
          scale: [1, 1.2, 1],
          rotate: [0, 15, -15, 0],
          duration: 600,
          easing: 'easeInOutQuad'
        });
      }
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <span className="text-sm text-gray-500 mr-2 hidden sm:inline">Today I feel:</span>
      <div ref={containerRef} className="flex space-x-1">
        {moods.map((item, index) => {
          const currentValueIndex = value - 1; // Convert 1-5 scale from parent to 0-based index
          return (
            <motion.button
              key={index}
              onClick={() => handleMoodSelect(index)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                // Compare 0-based index with the derived currentValueIndex
                currentValueIndex === index ? item.color + ' ring-2 ring-offset-2 ring-primary-300' : 'bg-gray-100'
              }`}
              title={item.label}
            >
              <span className="text-lg">{item.emoji}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodSlider;
