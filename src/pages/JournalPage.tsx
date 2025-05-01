import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Save, ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../components/Button';
import { useJournalContext } from '../contexts/JournalContext';
import JournalCard from '../components/JournalCard';
import MoodChart from '../components/MoodChart';
import MoodSlider from '../components/MoodSlider';
import WeeklySummary from '../components/WeeklySummary';

const JournalPage: React.FC = () => {
  // Get expanded context values
  const { 
    entries, 
    addEntry, 
    loading, 
    weeklySummary,
    weeklySummaryLoading,
    generateWeeklySummary,
    streakCount
  } = useJournalContext();
  
  const [journalText, setJournalText] = useState('');
  const [currentMood, setCurrentMood] = useState<number>(3); // Default mood to 3 (neutral)
  const [view, setView] = useState<'write' | 'entries' | 'analytics'>('write');

  const today = new Date();
  const formattedDate = format(today, 'EEEE, MMMM do, yyyy');

  // Daily prompts
  const journalPrompts = [
    "How are you feeling today? What's one small thing that made you smile?",
    "What's one challenge you faced today and how did you handle it?",
    "Name three things you're grateful for today and why they matter to you.",
    "What's something you're looking forward to? How can you make time for it?",
    "Describe a moment from today that you wish you could relive. What made it special?",
  ];
  const randomPrompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];

  // Handle saving a new journal entry
  const handleSaveJournal = async () => {
    if (journalText.trim()) {
      const newEntryData = {
        content: journalText,
        mood: currentMood,
      };

      try {
        await addEntry(newEntryData);
        setJournalText('');
        setCurrentMood(3);
        setView('entries');
      } catch (error) {
        console.error("Failed to save journal entry:", error);
      }
    }
  };

  // Handle generating a new weekly summary
  const handleGenerateWeeklySummary = async () => {
    try {
      await generateWeeklySummary();
    } catch (error) {
      console.error("Failed to generate weekly summary:", error);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with streak counter */}
        <div className="mb-6 flex flex-wrap items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Journal</h1>
            <p className="text-gray-600">A safe space to reflect and track your mood over time.</p>
          </div>
          
          {streakCount > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary-50 text-primary-700 rounded-full px-4 py-2 flex items-center"
            >
              <Sparkles size={18} className="mr-2 text-primary-500" />
              <span className="font-medium">{streakCount} Day Streak!</span>
            </motion.div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            onClick={() => setView('write')}
            className={`pb-2 px-4 font-medium text-sm ${
              view === 'write'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Write Today's Entry
          </button>
          <button
            onClick={() => setView('entries')}
            className={`pb-2 px-4 font-medium text-sm ${
              view === 'entries'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Previous Entries
          </button>
          <button
            onClick={() => setView('analytics')}
            className={`pb-2 px-4 font-medium text-sm ${
              view === 'analytics'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mood Analytics
          </button>
        </div>

        {/* Content based on view */}
        {view === 'write' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Calendar size={18} className="text-gray-500 mr-2" />
                <span className="text-gray-600">{formattedDate}</span>
              </div>
            </div>

            <div className="mb-4 p-4 bg-primary-50 rounded-lg border border-primary-100">
              <h3 className="font-medium text-gray-800 mb-2">Today's Prompt:</h3>
              <p className="text-gray-600">{randomPrompt}</p>
            </div>

            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="Start writing here..."
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none mb-4"
            />

            {/* Mood Slider */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">How are you feeling overall?</label>
              <MoodSlider value={currentMood} onChange={setCurrentMood} />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSaveJournal}
                variant="primary"
                icon={<Save size={18} />}
                disabled={!journalText.trim()}
              >
                Save Entry
              </Button>
            </div>
          </motion.div>
        )}

        {view === 'entries' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="animate-spin text-primary-500 mr-2" size={24} />
                <span className="text-gray-500">Loading entries...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {entries.length > 0 ? (
                  entries.map((entry) => (
                    <JournalCard key={entry.id} entry={entry} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    <p className="text-gray-500 mb-4">No journal entries yet.</p>
                    <Button
                      onClick={() => setView('write')}
                      variant="primary"
                    >
                      Write Your First Entry
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {view === 'analytics' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Mood Chart Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Mood Over Time</h2>

              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="animate-spin text-primary-500 mr-2" size={24} />
                  <span className="text-gray-500">Loading data...</span>
                </div>
              ) : entries.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <button className="p-2 text-gray-500 hover:text-primary-500">
                      <ChevronLeft size={20} />
                    </button>
                    <span className="text-gray-600 font-medium">Last 7 Days</span>
                    <button className="p-2 text-gray-500 hover:text-primary-500">
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  <div className="h-64">
                    <MoodChart entries={entries} />
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">No data to analyze yet. Write some journal entries to track your mood.</p>
                  <Button
                    onClick={() => setView('write')}
                    variant="primary"
                  >
                    Write Your First Entry
                  </Button>
                </div>
              )}
            </div>

            {/* Weekly Summary Section */}
            {entries.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Weekly Insights</h2>
                
                <WeeklySummary 
                  summary={weeklySummary}
                  isLoading={weeklySummaryLoading}
                  onGenerateNewSummary={handleGenerateWeeklySummary}
                  hasEntries={entries.length > 0}
                />
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default JournalPage;