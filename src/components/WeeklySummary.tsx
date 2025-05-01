import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Sparkles, TrendingUp, TrendingDown, LucideIcon, Lightbulb, List, ArrowRight } from 'lucide-react';
import Button from './Button';
import { JournalSummary } from '../contexts/JournalContext';

interface WeeklySummaryProps {
  summary: JournalSummary | null;
  isLoading: boolean;
  onGenerateNewSummary: () => void;
  hasEntries: boolean;
}

// Animated badge component
const Badge: React.FC<{
  icon: React.ReactNode;
  text: string;
  color: string;
  delay?: number;
}> = ({ icon, text, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: delay }}
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} mr-2`}
  >
    <span className="mr-1">{icon}</span>
    {text}
  </motion.div>
);

const WeeklySummary: React.FC<WeeklySummaryProps> = ({ 
  summary, 
  isLoading, 
  onGenerateNewSummary,
  hasEntries
}) => {
  // If no entries at all, show a prompt to start journaling
  if (!hasEntries) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        <Sparkles className="mx-auto text-primary-300 mb-4" size={32} />
        <h3 className="font-medium text-gray-800 mb-2">No Journal Entries Yet</h3>
        <p className="text-gray-600 mb-4">
          Start journaling to get AI-powered insights about your emotional patterns.
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="flex space-x-2 mb-4">
            <div className="w-3 h-3 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-gray-500">Analyzing your journal entries...</p>
          <p className="text-xs text-gray-400 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  // If no summary yet but has entries, show generate button
  if (!summary) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-6">
          <Sparkles className="mx-auto text-primary-400 mb-4" size={32} />
          <h3 className="font-medium text-gray-800 mb-2">Get AI Insights About Your Week</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Let Moodie analyze your journal entries from the past week to identify patterns, themes, and provide personalized insights.
          </p>
          <Button 
            variant="primary"
            onClick={onGenerateNewSummary}
            className="shadow-sm"
          >
            Generate Weekly Summary
          </Button>
        </div>
      </div>
    );
  }

  // Get trend icon
  const getTrendIcon = (): React.ReactNode => {
    switch (summary.moodTrends.trend) {
      case 'improving':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'declining':
        return <TrendingDown size={16} className="text-orange-500" />;
      default:
        return <span className="text-blue-500">→</span>;
    }
  };

  // Get trend color
  const getTrendColor = (): string => {
    switch (summary.moodTrends.trend) {
      case 'improving':
        return 'bg-green-100 text-green-800';
      case 'declining':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Format date ranges nicely
  const dateRangeText = `${format(summary.startDate.toDate(), 'MMM d')} - ${format(summary.endDate.toDate(), 'MMM d, yyyy')}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      {/* Header with date range and mood trend */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div>
            <h3 className="font-medium text-gray-800">Weekly Insights</h3>
            <p className="text-sm text-gray-500">{dateRangeText}</p>
          </div>
          <div className="flex items-center">
            <Badge 
              icon={getTrendIcon()} 
              text={`Mood ${summary.moodTrends.trend}`} 
              color={getTrendColor()} 
            />
            <Badge
              icon="🔍"
              text="AI Analysis"
              color="bg-purple-100 text-purple-800"
              delay={0.1}
            />
          </div>
        </div>
      </div>

      {/* Main summary content */}
      <div className="p-6">
        {/* Summary text */}
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed">{summary.summary}</p>
        </div>
        
        {/* Mood highlights */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {summary.moodTrends.highestDay && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <h4 className="text-sm font-medium text-green-800 mb-1">Highest Mood Day</h4>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-2xl">😊</span>
                  <span className="ml-1 text-sm text-gray-500">
                    {format(summary.moodTrends.highestDay.date.toDate(), 'MMM d')}
                  </span>
                </div>
                <span className="font-bold text-green-700">{summary.moodTrends.highestDay.mood}/5</span>
              </div>
            </div>
          )}
          
          {summary.moodTrends.lowestDay && (
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <h4 className="text-sm font-medium text-orange-800 mb-1">Lowest Mood Day</h4>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-2xl">😔</span>
                  <span className="ml-1 text-sm text-gray-500">
                    {format(summary.moodTrends.lowestDay.date.toDate(), 'MMM d')}
                  </span>
                </div>
                <span className="font-bold text-orange-700">{summary.moodTrends.lowestDay.mood}/5</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Common themes */}
        {summary.themes && summary.themes.length > 0 && (
          <div className="mb-6">
            <h4 className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <List size={16} className="mr-2 text-primary-500" />
              Common Themes
            </h4>
            <div className="space-y-2">
              {summary.themes.map((theme, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="flex items-start"
                >
                  <div className="mr-3 mt-0.5 text-primary-400">•</div>
                  <div className="text-gray-600">{theme}</div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {/* Insights */}
        {summary.insights && summary.insights.length > 0 && (
          <div className="mb-6">
            <h4 className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <Lightbulb size={16} className="mr-2 text-primary-500" />
              Key Insights
            </h4>
            <div className="space-y-3">
              {summary.insights.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.1 }}
                  className="bg-gray-50 p-3 rounded-lg"
                >
                  <p className="text-gray-600">{insight}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {/* Recommendations */}
        {summary.recommendations && summary.recommendations.length > 0 && (
          <div>
            <h4 className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <Sparkles size={16} className="mr-2 text-primary-500" />
              Recommendations
            </h4>
            <div className="space-y-3">
              {summary.recommendations.map((recommendation, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                  className="flex items-start"
                >
                  <div className="mr-2 mt-0.5 text-primary-500">
                    <ArrowRight size={14} />
                  </div>
                  <div className="text-gray-600">{recommendation}</div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer with refresh button */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs text-gray-500">
          Generated {format(summary.createdAt.toDate(), 'MMM d, h:mm a')}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={onGenerateNewSummary}
        >
          Generate New Insights
        </Button>
      </div>
    </motion.div>
  );
};

export default WeeklySummary;