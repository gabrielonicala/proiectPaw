'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import Button from './ui/Button';
import Card from './ui/Card';
import EntryDetailModal from './EntryDetailModal';
import MovingGradientBackground from './MovingGradientBackground';
import AppNavigation from './AppNavigation';
import { JournalEntry, User, Character } from '@/types';
import { useEntries } from '@/hooks/useEntries';
import { themes } from '@/themes';

interface CalendarViewProps {
  user: User;
  activeCharacter: Character;
  onBack: () => void;
}

export default function CalendarView({ user, activeCharacter, onBack }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { entries, isLoading: entriesLoading } = useEntries();

  useEffect(() => {
    // Automatically select today's date when entering calendar view
    setSelectedDate(new Date());
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEntriesForDate = (date: Date) => {
    return entries.filter(entry => 
      isSameDay(new Date(entry.createdAt), date) && 
      entry.characterId === activeCharacter.id
    );
  };

  const getEntriesForSelectedDate = () => {
    return selectedDate ? getEntriesForDate(selectedDate) : [];
  };

  // Get user's account creation month and current month for navigation limits
  const userCreatedDate = new Date(user.createdAt);
  const userCreatedMonth = new Date(userCreatedDate.getFullYear(), userCreatedDate.getMonth(), 1);
  const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      
      const newMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
      
      // Don't allow going before user creation month
      if (newMonth < userCreatedMonth) {
        return prev;
      }
      
      // Don't allow going beyond current month
      if (newMonth > currentMonth) {
        return prev;
      }
      
      return newDate;
    });
  };

  // Check if navigation buttons should be disabled
  const canGoPrev = () => {
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    return prevMonth >= userCreatedMonth;
  };

  const canGoNext = () => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    return nextMonth <= currentMonth;
  };

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen p-4">
      {/* Pixel art background */}
      <MovingGradientBackground theme={activeCharacter.theme} />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <AppNavigation
          activeCharacter={activeCharacter}
          currentPage="calendar"
          onBack={onBack}
          theme={activeCharacter.theme}
        />

        {/* Loading Overlay */}
        {entriesLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-[10000]"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-yellow-400 border-t-transparent pixelated mb-4"
            />
            <p className="font-pixel text-yellow-300 text-lg">
              Loading calendar data...
            </p>
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:w-2/3 flex flex-col"
          >
            <Card theme={activeCharacter.theme} className="flex flex-col">
              {/* Month Navigation */}
              <div className="flex justify-between items-center mb-6">
                <Button
                  onClick={() => navigateMonth('prev')}
                  variant="secondary"
                  size="sm"
                  className="hidden md:flex"
                  disabled={!canGoPrev()}
                  theme={activeCharacter.theme}
                >
                  ← PREV
                </Button>
                <Button
                  onClick={() => navigateMonth('prev')}
                  variant="secondary"
                  size="sm"
                  className="md:hidden"
                  disabled={!canGoPrev()}
                  theme={activeCharacter.theme}
                >
                  ←
                </Button>
                <h2 className="font-pixel text-xl text-white text-center flex-1">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <Button
                  onClick={() => navigateMonth('next')}
                  variant="secondary"
                  size="sm"
                  className="hidden md:flex"
                  disabled={!canGoNext()}
                  theme={activeCharacter.theme}
                >
                  NEXT →
                </Button>
                <Button
                  onClick={() => navigateMonth('next')}
                  variant="secondary"
                  size="sm"
                  className="md:hidden"
                  disabled={!canGoNext()}
                  theme={activeCharacter.theme}
                >
                  →
                </Button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="font-pixel text-sm text-gray-400 text-center p-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((day, index) => {
                  const dayEntries = getEntriesForDate(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isCurrentDay = isToday(day);
                  
                  return (
                    <motion.button
                      key={day.toISOString()}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        aspect-square md:aspect-square aspect-[1/1.5] p-2 text-sm font-pixel border-2 transition-all duration-200
                        ${isCurrentDay 
                          ? 'border-blue-400 bg-blue-400 text-white' 
                          : isSelected 
                            ? 'border-yellow-500 bg-yellow-500 text-white'
                            : dayEntries.length > 0
                              ? 'border-green-500 bg-green-500 text-white hover:border-green-400'
                              : 'border-gray-600 bg-gray-700 text-white hover:border-gray-500'
                        }
                        pixelated
                      `}
                    >
                      <div className="text-center">
                        <div className="mb-1">{format(day, 'd')}</div>
                        {dayEntries.length > 0 && (
                          <>
                            {/* Desktop: Show entry count text */}
                            <div className="hidden md:block text-[10px] mt-1 leading-tight">
                              {dayEntries.length} {dayEntries.length === 1 ? 'adv.' : 'advs'}
                            </div>
                            {/* Mobile: Show emoji indicator */}
                            <div className="md:hidden text-xs -mt-2">
                              📝
                            </div>
                          </>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Selected Date Entries */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:w-1/3 flex flex-col"
          >
            <Card theme={activeCharacter.theme} className="flex flex-col h-full">
              <div className="flex-shrink-0">
                <h3 className="font-pixel text-lg text-white mb-4">
                  {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Today\'s Adventures'}
                </h3>
                
                <hr className="border-gray-600 -mt-1 mb-4" />
              </div>
              
              <div className="space-y-4 flex-1 overflow-y-auto min-h-0">
                {getEntriesForSelectedDate().length > 0 ? (
                  getEntriesForSelectedDate().map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleEntryClick(entry)}
                      className="border-2 border-gray-600 p-3 pixelated bg-gray-800 cursor-pointer hover:border-yellow-500 hover:bg-gray-700 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-pixel text-sm text-yellow-300">
                          {entry.outputType === 'text' && 'CHAPTER'}
                          {entry.outputType === 'image' && 'SCENE'}
                          {entry.outputType === 'coming-soon' && 'EPISODE'}
                        </span>
                        <span className="font-pixel text-xs text-gray-400">
                          {format(new Date(entry.createdAt), 'h:mm a')}
                        </span>
                      </div>
                      
                      <div className="text-sm text-white mb-2">
                        <strong>Original:</strong> {entry.originalText.substring(0, 100)}...
                      </div>
                      
                      {entry.reimaginedText && (
                        <div className="text-sm text-gray-300 mb-2">
                          <strong>Adventure:</strong> {entry.reimaginedText.substring(0, 100)}...
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-pixel text-xs text-gray-400">
                            {entry.outputType === 'text' && '📖'}
                            {entry.outputType === 'image' && '🖼️'}
                            {entry.outputType === 'coming-soon' && '🎬'}
                            {/* {entry.outputType === 'video' && '🎬'} */} {/* VIDEO GENERATION COMMENTED OUT */}
                          </span>
                        </div>
                        <span className="font-pixel text-xs text-yellow-400">
                          CLICK TO VIEW
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-8">
                    <div className="text-6xl mb-4 opacity-50">📅</div>
                    <p className="font-pixel text-lg mb-2">
                      {selectedDate ? 'No adventures on this day' : 'No adventures today'}
                    </p>
                    <p className="font-pixel text-sm mb-4 opacity-75">
                      {!selectedDate && 'Click on other dates to explore'}
                    </p>
                    
                    {/* Character stats or tips */}
                    <div className="-mt-2 p-4 border border-gray-600 rounded-lg bg-gray-800/50 w-full text-left">
                      <h4 className="font-pixel text-base text-yellow-300 mb-2 text-left">💡 Quick Tips</h4>
                      <div className="text-sm space-y-1 text-gray-300 text-left">
                        <p>• Click a day to see its adventures</p>
                        <p>• Green days have adventures</p>
                        <p>• The blue day is today</p>
                        <p>• The yellow day is selected</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Entry Detail Modal */}
      {user && (
        <EntryDetailModal
          entry={selectedEntry}
          user={user}
          activeCharacter={activeCharacter}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEntry(null);
          }}
        />
      )}
    </div>
  );
}
