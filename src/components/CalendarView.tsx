'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { Check } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import UnifiedEntryModal from './UnifiedEntryModal';
import MovingGradientBackground from './MovingGradientBackground';
import AppNavigation from './AppNavigation';
import { JournalEntry, User, Character, Theme } from '@/types';
import { themes } from '@/themes';
import { migrateTheme } from '@/lib/theme-migration';
import { fetchWithAutoLogout } from '@/lib/auto-logout';
// import Footer from './Footer';

// Module-level cache that persists across component mounts/unmounts
// Cache key format: "YYYY-MM-characterId"
const calendarEntriesCache = new Map<string, JournalEntry[]>();

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
  const [calendarHeight, setCalendarHeight] = useState<number>(0);
  
  const calendarRef = useRef<HTMLDivElement>(null);
  
  const [cachedEntries, setCachedEntries] = useState<JournalEntry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  
  // Calculate date range for visible month only (no buffer)
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Create cache key from month/year/character (e.g., "2025-11-char123")
  const cacheKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${activeCharacter.id}`;
  
  // Check cache and load entries if needed
  useEffect(() => {
    const cached = calendarEntriesCache.get(cacheKey);
    
    if (cached) {
      // Use cached entries immediately
      setCachedEntries(cached);
      setIsLoadingEntries(false);
    } else {
      // Fetch from API
      setIsLoadingEntries(true);
      
      const params = new URLSearchParams({
        startDate: monthStart.toISOString(),
        endDate: monthEnd.toISOString(),
      });
      
      if (activeCharacter.id) {
        params.append('characterId', activeCharacter.id);
      }
      
      fetchWithAutoLogout(`/api/entries?${params.toString()}`)
        .then(async (response) => {
          if (!response.ok) {
            throw new Error('Failed to load entries');
          }
          const data = await response.json();
          
          // Cache the entries in module-level cache (persists across component mounts)
          calendarEntriesCache.set(cacheKey, data.entries);
          setCachedEntries(data.entries);
          setIsLoadingEntries(false);
        })
        .catch((err) => {
          console.error('Error loading entries:', err);
          setCachedEntries([]);
          setIsLoadingEntries(false);
        });
    }
  }, [cacheKey, monthStart, monthEnd, activeCharacter.id]);
  
  const entries = cachedEntries;
  const entriesLoading = isLoadingEntries;

  useEffect(() => {
    // Automatically select today's date when entering calendar view
    setSelectedDate(new Date());
  }, []);

  useEffect(() => {
    // Measure calendar height and update entries column height
    const measureCalendarHeight = () => {
      if (calendarRef.current) {
        const height = calendarRef.current.offsetHeight;
        setCalendarHeight(height);
      }
    };

    // Measure on mount and when calendar content changes
    measureCalendarHeight();
    
    // Re-measure when currentDate changes (month navigation)
    const timeoutId = setTimeout(measureCalendarHeight, 100);
    
    return () => clearTimeout(timeoutId);
  }, [currentDate]);

  // Re-measure height when component mounts to ensure proper sizing
  useEffect(() => {
    const measureCalendarHeight = () => {
      if (calendarRef.current) {
        const height = calendarRef.current.offsetHeight;
        setCalendarHeight(height);
      }
    };

    // Small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(measureCalendarHeight, 200);
    
    // Add window resize listener to re-measure on window resize
    const handleResize = () => {
      setTimeout(measureCalendarHeight, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Reuse monthStart and monthEnd from above
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get the day of the week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
  // Convert to Monday-based week: Sunday (0) -> 6, Monday (1) -> 0, Tuesday (2) -> 1, etc.
  const firstDayOfWeek = (monthStart.getDay() + 6) % 7;

  const getEntriesForDate = (date: Date) => {
    // Entries are already filtered by characterId from the API, but keep this as a safety check
    return entries.filter(entry => 
      isSameDay(new Date(entry.createdAt), date) && 
      entry.characterId === activeCharacter.id
    );
  };

  const getEntriesForSelectedDate = () => {
    return selectedDate ? getEntriesForDate(selectedDate) : [];
  };

  // Get theme colors for background (defined early for use in dropdowns)
  const migratedTheme = migrateTheme(activeCharacter.theme) as Theme;

  // Get user's account creation month and current month for navigation limits
  const userCreatedDate = new Date(user.createdAt);
  const userCreatedMonth = new Date(userCreatedDate.getFullYear(), userCreatedDate.getMonth(), 1);
  const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const currentYear = new Date().getFullYear();
  const userCreatedYear = userCreatedDate.getFullYear();

  // Generate available years (from user creation year to current year)
  const availableYears = Array.from({ length: currentYear - userCreatedYear + 1 }, (_, i) => userCreatedYear + i);

  // Generate month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get available months for a given year
  const getAvailableMonths = (year: number) => {
    const months = [];
    const startMonth = year === userCreatedYear ? userCreatedDate.getMonth() : 0;
    const endMonth = year === currentYear ? new Date().getMonth() : 11;
    
    for (let i = startMonth; i <= endMonth; i++) {
      months.push({ value: i, label: monthNames[i] });
    }
    return months;
  };

  // Handle month change
  const handleMonthChange = (newMonth: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newMonth);
    
    const newMonthDate = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
    
    // Validate: don't allow going before user creation month or beyond current month
    if (newMonthDate >= userCreatedMonth && newMonthDate <= currentMonth) {
      setCurrentDate(newDate);
    }
  };

  // Handle year change
  const handleYearChange = (newYear: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(newYear);
    
    const newMonthDate = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
    
    // If the selected month is not available in the new year, set to first/last available month
    const availableMonths = getAvailableMonths(newYear);
    if (availableMonths.length > 0) {
      const currentMonthIndex = newDate.getMonth();
      const isMonthAvailable = availableMonths.some(m => m.value === currentMonthIndex);
      
      if (!isMonthAvailable) {
        // Set to the first available month if current month is before, or last if after
        if (currentMonthIndex < availableMonths[0].value) {
          newDate.setMonth(availableMonths[0].value);
        } else {
          newDate.setMonth(availableMonths[availableMonths.length - 1].value);
        }
      }
    }
    
    const finalMonthDate = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
    
    // Validate: don't allow going before user creation month or beyond current month
    if (finalMonthDate >= userCreatedMonth && finalMonthDate <= currentMonth) {
      setCurrentDate(newDate);
    }
  };

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  // Get theme colors for background
  const themeConfig = themes[migratedTheme];
  const colors = themeConfig?.colors;

  // Memoize particle positions and animation values to prevent reset on re-render
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
  }, []); // Empty dependency array - only generate once

  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: colors ? `linear-gradient(to bottom, ${colors.background}, ${colors.primary}, ${colors.secondary})` : 'linear-gradient(to bottom, #581c87, #1e3a8a, #312e81)'
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 opacity-20 pixelated"
          style={{ backgroundColor: colors?.accent || '#fbbf24' }}
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-24 h-24 opacity-20 pixelated"
          style={{ backgroundColor: colors?.primary || '#ec4899' }}
          animate={{
            rotate: -360,
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-16 h-16 opacity-20 pixelated"
          style={{ backgroundColor: colors?.secondary || '#10b981' }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 opacity-30 pixelated"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              backgroundColor: colors?.text || '#ffffff'
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      <div className="flex-1 p-4">
      {/* Pixel art background */}
      {/* <MovingGradientBackground theme={activeCharacter.theme} /> */}
      
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
              Loading calendar...
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 flex flex-col lg:h-full"
          >
            <div ref={calendarRef} className="lg:h-full">
              <Card theme={activeCharacter.theme} className="flex flex-col h-full">
              {/* Month Navigation with Dropdowns and Arrows */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    const newMonthDate = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
                    if (newMonthDate >= userCreatedMonth && newMonthDate <= currentMonth) {
                      setCurrentDate(newDate);
                    }
                  }}
                  className="font-pixel text-white bg-transparent border-none cursor-pointer navbar-button navbar-button-arrow hidden md:flex flex-shrink-0"
                  style={{ marginTop: '-1rem', fontSize: '2rem', marginLeft: '1rem' }}
                  disabled={(() => {
                    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
                    return prevMonth < userCreatedMonth;
                  })()}
                >
                  ←
                </button>
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    const newMonthDate = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
                    if (newMonthDate >= userCreatedMonth && newMonthDate <= currentMonth) {
                      setCurrentDate(newDate);
                    }
                  }}
                  className="font-pixel text-white bg-transparent border-none cursor-pointer navbar-button navbar-button-arrow md:hidden flex-shrink-0"
                  style={{ marginTop: '-1rem' }}
                  disabled={(() => {
                    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
                    return prevMonth < userCreatedMonth;
                  })()}
                >
                  ←
                </button>
                <div className="flex justify-center items-center gap-0 flex-1 px-1 sm:px-2 md:px-0 min-w-0">
                  <select
                    value={currentDate.getMonth()}
                    onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                    className="font-pixel text-sm sm:text-lg text-white bg-gray-800 border-2 rounded-l px-2 sm:px-4 py-1.5 sm:py-2 pixelated cursor-pointer transition-colors flex-shrink calendar-dropdown-left"
                    style={{
                      backgroundColor: themes[migratedTheme].colors.background,
                      borderColor: '#000000',
                      borderRightColor: '#000000',
                      color: '#FFFFFF',
                      WebkitTextFillColor: '#FFFFFF',
                    }}
                  >
                    {getAvailableMonths(currentDate.getFullYear()).map((month) => (
                      <option
                        key={month.value}
                        value={month.value}
                        style={{
                          backgroundColor: '#1F2937',
                          color: '#FFFFFF',
                        }}
                      >
                        {month.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={currentDate.getFullYear()}
                    onChange={(e) => handleYearChange(parseInt(e.target.value))}
                    className="font-pixel text-sm sm:text-lg text-white bg-gray-800 border-2 rounded-r px-2 sm:px-4 py-1.5 sm:py-2 pixelated cursor-pointer transition-colors flex-shrink calendar-dropdown-right"
                    style={{
                      backgroundColor: themes[migratedTheme].colors.background,
                      borderColor: '#000000',
                      borderLeftColor: '#000000',
                      color: '#FFFFFF',
                      WebkitTextFillColor: '#FFFFFF',
                    }}
                  >
                    {availableYears.map((year) => (
                      <option
                        key={year}
                        value={year}
                        style={{
                          backgroundColor: '#1F2937',
                          color: '#FFFFFF',
                        }}
                      >
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    const newMonthDate = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
                    if (newMonthDate >= userCreatedMonth && newMonthDate <= currentMonth) {
                      setCurrentDate(newDate);
                    }
                  }}
                  className="font-pixel text-white bg-transparent border-none cursor-pointer navbar-button navbar-button-arrow hidden md:flex flex-shrink-0"
                  style={{ marginTop: '-1rem', fontSize: '2rem', marginRight: '1rem' }}
                  disabled={(() => {
                    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
                    return nextMonth > currentMonth;
                  })()}
                >
                  →
                </button>
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    const newMonthDate = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
                    if (newMonthDate >= userCreatedMonth && newMonthDate <= currentMonth) {
                      setCurrentDate(newDate);
                    }
                  }}
                  className="font-pixel text-white bg-transparent border-none cursor-pointer navbar-button navbar-button-arrow md:hidden flex-shrink-0"
                  style={{ marginTop: '-1rem' }}
                  disabled={(() => {
                    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
                    return nextMonth > currentMonth;
                  })()}
                >
                  →
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="font-pixel text-sm text-gray-400 text-center p-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before the first day of the month */}
                {Array.from({ length: firstDayOfWeek }).map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square md:aspect-[4/3] lg:aspect-[4/3] aspect-[1/1.5]" />
                ))}
                
                {daysInMonth.map((day, index) => {
                  const dayEntries = getEntriesForDate(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isCurrentDay = isToday(day);
                  
                  return (
                    <motion.button
                      key={day.toISOString()}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (firstDayOfWeek + index) * 0.02 }}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        aspect-square md:aspect-[4/3] lg:aspect-[4/3] aspect-[1/1.5] p-2 text-sm font-pixel border-2 transition-all duration-200
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
                            {/* Mobile: Show icon indicator */}
                            <div className="md:hidden -mt-4 flex justify-center navbar-button-icon">
                              <Check className="w-3 h-3" />
                            </div>
                          </>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </Card>
            </div>
          </motion.div>

          {/* Selected Date Entries */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col lg:h-full"
          >
            <div 
              style={{ height: calendarHeight > 0 ? `${calendarHeight}px` : 'auto' }}
              className="lg:h-full"
            >
              <Card 
                theme={activeCharacter.theme} 
                className="flex flex-col h-full"
              >
              <h3 className="font-pixel text-lg text-white mb-4">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Today\'s Adventures'}
              </h3>
              
              <hr className="border-gray-600 -mt-1 mb-4" />
              
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="space-y-4">
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
                        <strong>Inspiration:</strong> {entry.originalText.substring(0, 100)}...
                      </div>
                      
                      {entry.reimaginedText && (
                        <div className="text-sm text-gray-300 mb-2">
                          <strong>Chapter:</strong> {entry.reimaginedText.substring(0, 100)}...
                        </div>
                      )}
                      
                      {/* Stat Progression Display */}
                      {entry.statAnalysis && entry.outputType === 'text' && (
                        <div className="mb-3 p-2 bg-gray-900/50 rounded border border-gray-700">
                          <div className="font-pixel text-xs text-yellow-300 mb-2">📊 Stat Changes:</div>
                          <div className="flex flex-wrap gap-1 items-center">
                            {/* Filter out stats with 0 changes, then take first 2 */}
                            {Object.entries(JSON.parse(entry.statAnalysis))
                              .filter(([_, change]: [string, any]) => change.change !== 0)
                              .slice(0, 2)
                              .map(([statName, change]: [string, any]) => (
                              <div
                                key={statName}
                                className={`px-1 py-0.5 rounded font-pixel whitespace-nowrap ${
                                  change.change > 0 
                                    ? 'bg-green-600/30 text-green-300 border border-green-500/50' 
                                    : change.change < 0 
                                      ? 'bg-red-600/30 text-red-300 border border-red-500/50'
                                      : 'bg-gray-600/30 text-gray-300 border border-gray-500/50'
                                }`}
                                style={{ fontSize: '10px' }}
                                title={`${change.reason} (Confidence: ${Math.round(change.confidence * 100)}%)`}
                              >
                                {statName} {change.change > 0 ? '+' : ''}{change.change}
                              </div>
                            ))}
                            {/* Show "..." if there are more than 2 non-zero stat changes */}
                            {Object.entries(JSON.parse(entry.statAnalysis)).filter(([_, change]: [string, any]) => change.change !== 0).length > 2 && (
                              <span className="text-gray-400 font-pixel" style={{ fontSize: '10px' }}>
                                ...
                              </span>
                            )}
                            
                            {/* Original code (commented out) - shows all stats including 0 changes */}
                            {/* {Object.entries(JSON.parse(entry.statAnalysis)).slice(0, 2).map(([statName, change]: [string, any]) => (
                              <div
                                key={statName}
                                className={`px-1 py-0.5 rounded font-pixel whitespace-nowrap ${
                                  change.change > 0 
                                    ? 'bg-green-600/30 text-green-300 border border-green-500/50' 
                                    : change.change < 0 
                                      ? 'bg-red-600/30 text-red-300 border border-red-500/50'
                                      : 'bg-gray-600/30 text-gray-300 border border-gray-500/50'
                                }`}
                                style={{ fontSize: '10px' }}
                                title={`${change.reason} (Confidence: ${Math.round(change.confidence * 100)}%)`}
                              >
                                {statName} {change.change > 0 ? '+' : ''}{change.change}
                              </div>
                            ))}
                            {Object.entries(JSON.parse(entry.statAnalysis)).length > 2 && (
                              <span className="text-gray-400 font-pixel" style={{ fontSize: '10px' }}>
                                ...
                              </span>
                            )} */}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {entry.expGained ? (
                            <span className="font-pixel text-xs text-blue-300">
                              {entry.expGained} EXP
                            </span>
                          ) : (
                            <span className="font-pixel text-xs text-gray-400">
                              {entry.outputType === 'text' && '📖'}
                              {entry.outputType === 'image' && '🖼️'}
                              {entry.outputType === 'coming-soon' && '🎬'}
                              {/* {entry.outputType === 'video' && '🎬'} */} {/* VIDEO GENERATION COMMENTED OUT */}
                            </span>
                          )}
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
              </div>
            </Card>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Entry Detail Modal */}
      {user && (
        <UnifiedEntryModal
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
      {/* <Footer /> */}
      
      {/* Ensure dropdown selected option has light text on mobile and remove focus outline */}
      <style dangerouslySetInnerHTML={{__html: `
        select option:checked {
          color: #FFFFFF !important;
          background-color: #1F2937 !important;
        }
        select option {
          color: #FFFFFF !important;
          background-color: #1F2937 !important;
        }
        select:focus {
          outline: none !important;
          border-color: #000000 !important;
        }
        select:active {
          outline: none !important;
          border-color: #000000 !important;
        }
        .navbar-button-arrow::after {
          display: none !important;
        }
        /* Force black borders on all dropdowns */
        select {
          border-color: #000000 !important;
        }
        /* Specifically target the connection borders */
        .calendar-dropdown-left {
          border-right-color: #000000 !important;
          border-right-width: 2px !important;
        }
        .calendar-dropdown-right {
          border-left-color: #000000 !important;
          border-left-width: 2px !important;
        }
        /* Ensure all border sides are black */
        .calendar-dropdown-left,
        .calendar-dropdown-right {
          border-top-color: #000000 !important;
          border-bottom-color: #000000 !important;
        }
        /* Mobile-specific: Force light text for selected option */
        @media (max-width: 768px) {
          select {
            color: #FFFFFF !important;
            -webkit-text-fill-color: #FFFFFF !important;
          }
          select option {
            color: #FFFFFF !important;
            background-color: #1F2937 !important;
            -webkit-text-fill-color: #FFFFFF !important;
          }
          select option:checked {
            color: #FFFFFF !important;
            background-color: #1F2937 !important;
            -webkit-text-fill-color: #FFFFFF !important;
          }
          select option:selected {
            color: #FFFFFF !important;
            background-color: #1F2937 !important;
            -webkit-text-fill-color: #FFFFFF !important;
          }
          /* Webkit-specific for mobile Safari */
          select::-webkit-select {
            color: #FFFFFF !important;
          }
          select::-webkit-select-value {
            color: #FFFFFF !important;
          }
        }
      `}} />
    </div>
  );
}
