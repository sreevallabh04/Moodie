import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Search, Filter, Calendar, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, subMonths, addMonths, isAfter, isBefore } from 'date-fns';
import { JournalEntry, useJournalContext } from '../contexts/JournalContext';
import JournalCard from './JournalCard';

interface JournalHistoryProps {
  onSelectEntry?: (entry: JournalEntry) => void;
}

const MoodEmojis = ['😔', '😕', '😐', '🙂', '😊'];

const JournalHistory: React.FC<JournalHistoryProps> = ({ onSelectEntry }) => {
  const { entries, loading } = useJournalContext();
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [moodFilter, setMoodFilter] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'custom'>('all');
  const [customDateRange, setCustomDateRange] = useState<{start: Date | null, end: Date | null}>({
    start: null,
    end: null
  });
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');

  // Apply filters when entries, search, date, or mood filters change
  useEffect(() => {
    if (loading) return;

    let filtered = [...entries];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.content.toLowerCase().includes(query)
      );
    }

    // Apply date filter
    if (selectedDate) {
      filtered = filtered.filter(entry => {
        const entryDate = entry.date.toDate();
        return isSameDay(entryDate, selectedDate);
      });
    } else if (dateRange === 'week' && currentMonth) {
      const weekStart = startOfWeek(currentMonth);
      const weekEnd = endOfWeek(currentMonth);
      filtered = filtered.filter(entry => {
        const entryDate = entry.date.toDate();
        return isAfter(entryDate, weekStart) && isBefore(entryDate, weekEnd);
      });
    } else if (dateRange === 'month' && currentMonth) {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      filtered = filtered.filter(entry => {
        const entryDate = entry.date.toDate();
        return isAfter(entryDate, monthStart) && isBefore(entryDate, monthEnd);
      });
    } else if (dateRange === 'custom' && customDateRange.start && customDateRange.end) {
      filtered = filtered.filter(entry => {
        const entryDate = entry.date.toDate();
        return isAfter(entryDate, customDateRange.start!) && 
               isBefore(entryDate, customDateRange.end!);
      });
    }

    // Apply mood filter
    if (moodFilter.length > 0) {
      filtered = filtered.filter(entry => 
        moodFilter.includes(entry.mood)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime());

    setFilteredEntries(filtered);
  }, [entries, searchQuery, selectedDate, moodFilter, dateRange, customDateRange, currentMonth, loading]);

  // Handle clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDate(null);
    setMoodFilter([]);
    setDateRange('all');
    setCustomDateRange({ start: null, end: null });
  };

  // Toggle mood selection in filter
  const toggleMoodFilter = (mood: number) => {
    if (moodFilter.includes(mood)) {
      setMoodFilter(moodFilter.filter(m => m !== mood));
    } else {
      setMoodFilter([...moodFilter, mood]);
    }
  };

  // Previous month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Group entries by date for better display
  const getEntriesByDate = () => {
    const groups: { [key: string]: JournalEntry[] } = {};
    
    filteredEntries.forEach(entry => {
      const dateKey = format(entry.date.toDate(), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(entry);
    });
    
    return groups;
  };

  // Count entries for each date (for calendar heat map)
  const getEntryCountForDate = (date: Date): number => {
    return entries.filter(entry => 
      isSameDay(entry.date.toDate(), date)
    ).length;
  };

  // Get mood color class based on mood value
  const getMoodColorClass = (mood: number): string => {
    switch(mood) {
      case 1: return 'bg-red-100 text-red-600';
      case 2: return 'bg-orange-100 text-orange-600';
      case 3: return 'bg-yellow-100 text-yellow-600';
      case 4: return 'bg-green-100 text-green-600';
      case 5: return 'bg-primary-100 text-primary-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const entriesByDate = getEntriesByDate();
  const dateKeys = Object.keys(entriesByDate).sort().reverse(); // Sort dates newest first

  // Calendar days
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  });

  return (
    <div className="w-full">
      {/* Search and filters bar */}
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search journal entries..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        
        {/* Filter button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg border ${
            moodFilter.length > 0 || dateRange !== 'all' 
              ? 'border-primary-300 bg-primary-50 text-primary-600' 
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal size={18} />
          <span className="hidden sm:inline">Filter</span>
          {(moodFilter.length > 0 || dateRange !== 'all') && (
            <span className="ml-1 bg-primary-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
              {moodFilter.length + (dateRange !== 'all' ? 1 : 0)}
            </span>
          )}
        </button>
        
        {/* Calendar button */}
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg border ${
            selectedDate ? 'border-primary-300 bg-primary-50 text-primary-600' : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <CalendarIcon size={18} />
          <span className="hidden sm:inline">
            {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Calendar'}
          </span>
          {selectedDate && (
            <X 
              size={16}
              className="ml-1 hover:text-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDate(null);
              }}
            />
          )}
        </button>

        {/* Toggle view mode */}
        <button
          onClick={() => setViewMode(viewMode === 'grid' ? 'calendar' : 'grid')}
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          {viewMode === 'grid' ? <Calendar size={18} /> : <Filter size={18} />}
          <span className="hidden sm:inline">{viewMode === 'grid' ? 'Calendar View' : 'List View'}</span>
        </button>
        
        {/* Clear filters if any are applied */}
        {(searchQuery || selectedDate || moodFilter.length > 0 || dateRange !== 'all') && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50"
          >
            <X size={18} />
            <span className="hidden sm:inline">Clear All</span>
          </button>
        )}
      </div>
      
      {/* Filters dropdown */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
          >
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Filter Journal Entries</h3>
              
              {/* Mood filter */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Mood</p>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map(mood => (
                    <button
                      key={mood}
                      onClick={() => toggleMoodFilter(mood)}
                      className={`px-3 py-1.5 rounded-full flex items-center gap-1 ${
                        moodFilter.includes(mood)
                          ? getMoodColorClass(mood)
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span>{MoodEmojis[mood-1]}</span>
                      <span className="text-sm">{mood}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Date range filter */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Time Period</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setDateRange('all')}
                    className={`px-3 py-1.5 rounded-full ${
                      dateRange === 'all'
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All Time
                  </button>
                  <button
                    onClick={() => setDateRange('week')}
                    className={`px-3 py-1.5 rounded-full ${
                      dateRange === 'week'
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => setDateRange('month')}
                    className={`px-3 py-1.5 rounded-full ${
                      dateRange === 'month'
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => setDateRange('custom')}
                    className={`px-3 py-1.5 rounded-full ${
                      dateRange === 'custom'
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Custom Range
                  </button>
                </div>
                
                {/* Custom date range inputs */}
                {dateRange === 'custom' && (
                  <div className="mt-3 flex items-center gap-2">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                      <input
                        type="date"
                        value={customDateRange.start ? format(customDateRange.start, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setCustomDateRange({
                          ...customDateRange,
                          start: e.target.value ? new Date(e.target.value) : null
                        })}
                        className="p-2 border border-gray-300 rounded-md w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">End Date</label>
                      <input
                        type="date"
                        value={customDateRange.end ? format(customDateRange.end, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setCustomDateRange({
                          ...customDateRange,
                          end: e.target.value ? new Date(e.target.value) : null
                        })}
                        className="p-2 border border-gray-300 rounded-md w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Calendar dropdown */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full">
                  <ChevronDown className="rotate-90" size={20} />
                </button>
                <h3 className="text-lg font-medium text-gray-800">
                  {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full">
                  <ChevronDown className="rotate-270" size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                    {day}
                  </div>
                ))}
                
                {days.map(day => {
                  const entryCount = getEntryCountForDate(day);
                  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  
                  return (
                    <button
                      key={day.toString()}
                      onClick={() => setSelectedDate(isSelected ? null : day)}
                      className={`aspect-square flex flex-col items-center justify-center rounded-full text-sm ${
                        isSelected
                          ? 'bg-primary-500 text-white'
                          : isCurrentMonth
                            ? entryCount > 0
                              ? 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                              : 'hover:bg-gray-100 text-gray-700'
                            : 'text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <span>{format(day, 'd')}</span>
                      {entryCount > 0 && !isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-0.5"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-500">
        {loading ? (
          'Loading journal entries...'
        ) : (
          <>
            {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} 
            {filteredEntries.length !== entries.length && ` (filtered from ${entries.length})`}
          </>
        )}
      </div>

      {/* Calendar View Mode */}
      {viewMode === 'calendar' && !loading && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
              
              {days.map(day => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const dayEntries = entries.filter(entry => 
                  isSameDay(entry.date.toDate(), day)
                );
                const hasEntries = dayEntries.length > 0;
                
                // Calculate average mood for coloring
                let avgMood = 0;
                if (hasEntries) {
                  avgMood = Math.round(
                    dayEntries.reduce((sum, entry) => sum + entry.mood, 0) / dayEntries.length
                  );
                }
                
                return (
                  <div
                    key={day.toString()}
                    className={`min-h-[80px] border rounded-md p-1 ${
                      isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                    } ${hasEntries ? 'cursor-pointer hover:shadow-sm' : ''}`}
                    onClick={() => {
                      if (hasEntries) {
                        setSelectedDate(day);
                        setViewMode('grid');
                      }
                    }}
                  >
                    <div className="text-right text-xs font-medium text-gray-700 mb-1">
                      {format(day, 'd')}
                    </div>
                    
                    {hasEntries && (
                      <div 
                        className={`rounded-md p-1 text-xs ${getMoodColorClass(avgMood)}`}
                      >
                        {dayEntries.length} {dayEntries.length === 1 ? 'entry' : 'entries'}
                        <span className="ml-1">{MoodEmojis[avgMood-1]}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Journal entries grid */}
      {viewMode === 'grid' && !loading && (
        <>
          {dateKeys.length > 0 ? (
            <div className="space-y-8">
              {dateKeys.map(dateKey => (
                <div key={dateKey}>
                  <h3 className="text-lg font-medium text-gray-800 mb-3 sticky top-20 bg-gray-50 py-2 px-3 rounded-md z-10">
                    {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {entriesByDate[dateKey].map(entry => (
                      <JournalCard 
                        key={entry.id} 
                        entry={entry}
                        onClick={() => onSelectEntry && onSelectEntry(entry)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <div className="mb-4 text-gray-400">
                <Search size={40} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No journal entries found</h3>
              <p className="text-gray-500 mb-6">
                {entries.length > 0 
                  ? "Try adjusting your filters or search query."
                  : "Start journaling to track your mood and thoughts over time."}
              </p>
              {entries.length === 0 && (
                <button
                  onClick={() => {/* Navigate to journal creation */}}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Write Your First Entry
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JournalHistory;