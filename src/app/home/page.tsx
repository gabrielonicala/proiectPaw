'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Footer from '@/components/Footer';
import { themes } from '@/themes';
import { Theme } from '@/types';
import { Zap, Search, Swords, Moon, Rocket, Scroll, Target, Anchor, ChevronDown } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [currentTheme, setCurrentTheme] = useState<Theme>('velour-nights');
  const [isVisible, setIsVisible] = useState(false);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const navigateWithTransition = (path: string) => {
    setIsTransitioning(true);
    
    // Navigate immediately - let the fade happen during navigation
    router.push(path);
  };

  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      // Add a subtle fade-in effect to the target section
      element.style.opacity = '0.7';
      element.style.transition = 'opacity 0.5s ease-in-out';
      
      // Optimized scroll animation with better easing
      const startPosition = window.pageYOffset;
      const targetPosition = element.offsetTop - 100; // 100px offset from top
      const distance = targetPosition - startPosition;
      const duration = 800; // Reduced from 1200ms to 800ms
      let startTime = null;
      
      // Smoother easing function
      const easeOutCubic = (t: number) => {
        return 1 - Math.pow(1 - t, 3);
      };
      
      const animateScroll = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        
        window.scrollTo(0, startPosition + distance * easedProgress);
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          // Fade in the target section when scroll completes
          setTimeout(() => {
            element.style.opacity = '1';
          }, 100);
        }
      };
      
      requestAnimationFrame(animateScroll);
    }
  };

  // No JavaScript animation needed - using pure CSS

  const themeConfig = themes[currentTheme];
  const colors = themeConfig?.colors;

  const features = [
    {
      icon: '📖',
      title: 'Connected Storytelling',
      description: 'Transform your daily experiences into epic fantasy adventures with continuous narrative flow.'
    },
    {
      icon: '🎨',
      title: 'Immersive Themes',
      description: 'Choose from 8 unique fantasy themes that transform both your visual experience and story writing style.'
    },
    {
      icon: '👤',
      title: 'Character Creation',
      description: 'Build your fantasy persona with customizable avatars, pronoun choices, and themed character traits.'
    },
    {
      icon: '🖼️',
      title: 'Visual Adventures',
      description: 'Generate stunning scenes featuring your avatar to accompany your stories.'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your personal adventures are encrypted. Your story is only yours to see.'
    },
    {
      icon: '📱',
      title: 'Cross-Platform',
      description: 'Take your adventures with you with our web app and upcoming mobile apps.'
    }
  ];

  const themePreviews = [
    { 
      id: 'neon-ashes', 
      name: 'Neon Ashes', 
      icon: Zap,
      color: '#00FF88', 
      background: `
        linear-gradient(90deg, #0A0A0A, #00FF88, #00FFFF, #FF8C00),
        linear-gradient(180deg, #00FFFF, #0A0A0A, #00FF88, #FF8C00)
      `,
      backgroundSize: '300% 300%',
      animation: 'neonPulse 2s ease-in-out infinite',
      description: 'Enter a neon-soaked future where technology and humanity collide. This theme turns your experiences into high-tech adventures through rain-drenched streets, corporate conspiracies, and digital rebellions. Expect stories of hackers, AI consciousness, and the eternal struggle between megacorps and freedom fighters.'
    },
    { 
      id: 'crimson-casefiles', 
      name: 'Crimson Casefiles', 
      icon: Search,
      color: '#B8860B', 
      background: `
        linear-gradient(135deg, #000000, #B8860B, #8B0000, #FFD700),
        linear-gradient(225deg, #8B0000, #000000, #B8860B, #FFD700)
      `,
      backgroundSize: '500% 500%',
      animation: 'noirShift 6s ease infinite',
      description: 'Dive into the shadowy world of noir detectives and unsolved mysteries. This theme transforms your daily experiences into gripping crime stories filled with cigarette smoke, dim desk lamps, and hidden clues. Perfect for stories about missing persons, crime syndicates, and the psychological tension of the hunt for truth.'
    },
    { 
      id: 'blazeheart-saga', 
      name: 'Steel Spirit', 
      icon: Swords,
      color: '#8B0000', 
      background: `
        linear-gradient(60deg, #000000, #8B0000, #FFFFFF, #FFD700, #2F4F4F),
        linear-gradient(120deg, #FFD700, #000000, #8B0000, #FFFFFF, #2F4F4F)
      `,
      backgroundSize: '350% 350%',
      animation: 'energyWave 3s ease-in-out infinite',
      description: 'Embrace the way of the warrior with honor, discipline, and unwavering resolve. This theme transforms your experiences into epic tales of bushido, ancient battles, and the path of the sword. Expect stories about honor, sacrifice, master-student relationships, and the eternal struggle between duty and personal desires.'
    },
    { 
      id: 'obsidian-veil', 
      name: 'Obsidian Veil', 
      icon: Moon,
      color: '#8B008B', 
      background: `
        linear-gradient(75deg, #000000, #8B008B, #4B0082, #DAA520),
        linear-gradient(255deg, #4B0082, #000000, #8B008B, #DAA520)
      `,
      backgroundSize: '400% 400%',
      animation: 'mysticalDrift 5s ease infinite',
      description: 'Enter a realm of gothic castles, ancient curses, and mysterious shadows. This theme transforms your experiences into dark fantasy tales filled with forbidden magic, cursed artifacts, and the eternal struggle between light and darkness. Perfect for stories about ancient evils, gothic mysteries, and the price of power.'
    },
    { 
      id: 'starlit-horizon', 
      name: 'Starlit Horizon', 
      icon: Rocket,
      color: '#4169E1', 
      background: `
        linear-gradient(0deg, #000000, #4169E1, #1E90FF, #FFD700),
        linear-gradient(90deg, #1E90FF, #000000, #4169E1, #FFD700)
      `,
      backgroundSize: '300% 300%',
      animation: 'cosmicFlow 4s ease infinite',
      description: 'Embark on cosmic adventures across the vast expanse of space. This theme transforms your experiences into epic space odysseys filled with alien encounters, distant worlds, and the infinite possibilities of the cosmos. Perfect for stories about exploration, first contact, and humanity\'s place among the stars.'
    },
    { 
      id: 'ivory-quill', 
      name: 'Ivory Quill', 
      icon: Scroll,
      color: '#DAA520', 
      background: `
        linear-gradient(45deg, #000000, #DAA520, #FF6B35, #00FF88),
        linear-gradient(135deg, #FF6B35, #000000, #DAA520, #00FF88)
      `,
      backgroundSize: '450% 450%',
      animation: 'parchmentFlow 6s ease infinite',
      description: 'Step into a realm of wizards, kingdoms, and ancient prophecies. This theme transforms your experiences into epic fantasy adventures filled with magical academies, legendary artifacts, and the eternal struggle between good and evil. Perfect for stories about chosen heroes, magical quests, and the power of destiny.'
    },
    { 
      id: 'wild-west', 
      name: 'Wild West', 
      icon: Target,
      color: '#D2691E', 
      background: `
        linear-gradient(15deg, #000000, #D2691E, #FFD700, #FF0000),
        linear-gradient(195deg, #FFD700, #000000, #D2691E, #FF0000)
      `,
      backgroundSize: '500% 500%',
      animation: 'dustStorm 7s ease infinite',
      description: 'Saddle up for adventures in the lawless frontier where justice is served by the barrel of a gun. This theme transforms your experiences into Wild West tales filled with mysterious strangers, gold rushes, and the eternal struggle between law and chaos. Perfect for stories about lone gunslingers, frontier justice, and the untamed spirit of the west.'
    },
    { 
      id: 'crimson-tides', 
      name: 'Treasure Tides', 
      icon: Anchor,
      color: '#8B0000', 
      background: `
        linear-gradient(120deg, #191970, #000080, #8B0000, #4682B4),
        linear-gradient(240deg, #000080, #191970, #8B0000, #4682B4)
      `,
      backgroundSize: '400% 400%',
      animation: 'oceanWave 5s ease infinite',
      description: 'Set sail for treacherous waters where legends are forged and treasures await the bold. This theme transforms your experiences into epic nautical adventures filled with pirate crews, sea monsters, and the endless horizon of possibility. Perfect for stories about treasure hunts, naval battles, and the freedom of the open sea.'
    }
  ];

  return (
    <div className={`min-h-screen bg-black text-white overflow-hidden transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      {/* Mobile background pattern */}
      <div className="absolute inset-0 md:hidden bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
      
      {/* Theme-colored moving squares - Same as auth pages */}
      <div className="absolute inset-0 hidden md:block">
        {/* Velour Nights - Orange */}
        <div 
          className="absolute w-6 h-6 pixelated opacity-60" 
          style={{
            backgroundColor: '#E8A87C',
            animation: 'float1 8s ease-in-out infinite',
            top: '20%',
            left: '15%'
          }}
        ></div>
        <div 
          className="absolute w-4 h-4 pixelated opacity-50" 
          style={{
            backgroundColor: '#E8A87C',
            animation: 'float2 6s ease-in-out infinite',
            top: '70%',
            right: '20%'
          }}
        ></div>
        
        {/* Neon Ashes - Green */}
        <div 
          className="absolute w-8 h-8 pixelated opacity-70" 
          style={{
            backgroundColor: '#00FF88',
            animation: 'float3 10s ease-in-out infinite',
            top: '10%',
            right: '25%'
          }}
        ></div>
        <div 
          className="absolute w-5 h-5 pixelated opacity-55" 
          style={{
            backgroundColor: '#00FF88',
            animation: 'float4 7s ease-in-out infinite',
            bottom: '30%',
            left: '25%'
          }}
        ></div>
        
        {/* Crimson Casefiles - Gold */}
        <div 
          className="absolute w-4 h-4 pixelated opacity-80"
          style={{
            backgroundColor: '#FFD700',
            animation: 'float5 9s ease-in-out infinite',
            top: '50%',
            left: '10%'
          }}
        ></div>
        <div 
          className="absolute w-6 h-6 pixelated opacity-65"
          style={{
            backgroundColor: '#FFD700',
            animation: 'float6 5s ease-in-out infinite',
            bottom: '20%',
            right: '15%'
          }}
        ></div>
        
        {/* Obsidian Veil - Purple */}
        <div 
          className="absolute w-5 h-5 pixelated opacity-75"
          style={{
            backgroundColor: '#4B0082',
            animation: 'float7 8s ease-in-out infinite',
            top: '30%',
            right: '10%'
          }}
        ></div>
        <div 
          className="absolute w-4 h-4 pixelated opacity-60"
          style={{
            backgroundColor: '#4B0082',
            animation: 'float8 6s ease-in-out infinite',
            bottom: '40%',
            left: '15%'
          }}
        ></div>
        
        {/* Starlit Horizon - Blue */}
        <div 
          className="absolute w-6 h-6 pixelated opacity-50"
          style={{
            backgroundColor: '#00BFFF',
            animation: 'float9 10s ease-in-out infinite',
            top: '65%',
            left: '10%'
          }}
        ></div>
        <div 
          className="absolute w-5 h-5 pixelated opacity-65"
          style={{
            backgroundColor: '#00BFFF',
            animation: 'float10 7s ease-in-out infinite',
            top: '25%',
            right: '15%'
          }}
        ></div>
        
        {/* Ivory Quill - Gold */}
        <div 
          className="absolute w-4 h-4 pixelated opacity-75"
          style={{
            backgroundColor: '#DAA520',
            animation: 'float11 9s ease-in-out infinite',
            bottom: '15%',
            left: '45%'
          }}
        ></div>
        <div 
          className="absolute w-6 h-6 pixelated opacity-50"
          style={{
            backgroundColor: '#DAA520',
            animation: 'float12 5s ease-in-out infinite',
            top: '12%',
            left: '30%'
          }}
        ></div>
        
        {/* Wild West - Brown */}
        <div 
          className="absolute w-5 h-5 pixelated opacity-60"
          style={{
            backgroundColor: '#D2691E',
            animation: 'float13 8s ease-in-out infinite',
            top: '55%',
            left: '30%'
          }}
        ></div>
        <div 
          className="absolute w-4 h-4 pixelated opacity-70"
          style={{
            backgroundColor: '#D2691E',
            animation: 'float14 6s ease-in-out infinite',
            bottom: '30%',
            right: '25%'
          }}
        ></div>
        
        {/* Crimson Tides - Dark Red */}
        <div 
          className="absolute w-6 h-6 pixelated opacity-55"
          style={{
            backgroundColor: '#8B0000',
            animation: 'float15 7s ease-in-out infinite',
            top: '35%',
            left: '5%'
          }}
        ></div>
        <div 
          className="absolute w-5 h-5 pixelated opacity-60"
          style={{
            backgroundColor: '#8B0000',
            animation: 'float16 9s ease-in-out infinite',
            bottom: '35%',
            right: '30%'
          }}
        ></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-2">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img 
              src="/logo.png" 
              alt="Quillia" 
              className="h-28 w-auto pixelated"
              style={{ imageRendering: 'pixelated' }}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <button 
              onClick={() => navigateWithTransition('/auth/signin')}
              className="font-pixel bg-transparent hover:bg-white/20 text-white hover:text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-white/25 transition-all duration-300 font-bold" 
              style={{ fontSize: '1.375rem' }}
            >
              Sign In
            </button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.h1 
              className="font-pixel mb-6 font-bold"
              style={{ fontSize: 'clamp(2rem, 6vw, 2.75rem)' }}
              animate={{
                textShadow: [
                  "0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.3)",
                  "0 0 30px rgba(255,255,255,0.7), 0 0 60px rgba(255,255,255,0.5)",
                  "0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.3)"
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Turn Your Days Into
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600">
                Adventures
              </span>
            </motion.h1>

            <motion.p 
              className="font-pixel text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              Transform your daily experiences into epic adventures with Quillia. Choose your theme, create your character and write your own story!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button 
                onClick={() => navigateWithTransition('/auth/signin')}
                className="font-pixel bg-gradient-to-r from-pink-600 to-pink-800 hover:from-pink-500 hover:to-pink-700 text-white px-8 py-4 rounded-lg border-2 border-pink-400 shadow-lg hover:shadow-pink-500/25 transition-all duration-300 text-lg font-bold"
              >
                Start Your Adventure
              </button>
              <button 
                onClick={() => smoothScrollTo('how-it-works')}
                className="font-pixel bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white px-8 py-4 rounded-lg border-2 border-blue-400 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 text-lg font-bold transform hover:scale-105 active:scale-95"
              >
                Learn More
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-pixel mb-6" style={{ fontSize: 'clamp(2rem, 6vw, 2.75rem)' }}>
              How Quillia works
            </h2>
            <p className="font-pixel text-xl text-gray-300 max-w-2xl mx-auto text-center md:whitespace-nowrap md:flex md:justify-center">
              Transform your daily life into a new adventure in just a few simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg p-8 hover:border-white/40 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="font-pixel text-2xl text-black font-bold">1</span>
                </div>
                <h3 className="font-pixel text-xl text-white mb-4">
                  Choose Your Theme
                </h3>
                <p className="text-gray-300 font-pixel leading-relaxed">
                  Select from 8 unique fantasy themes that match your adventure style. Become a samurai, detective, pirate, or explore other magical worlds.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg p-8 hover:border-white/40 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="font-pixel text-2xl text-white font-bold">2</span>
                </div>
                <h3 className="font-pixel text-xl text-white mb-4">
                  Create Your Character
                </h3>
                <p className="text-gray-300 font-pixel leading-relaxed">
                  Build your unique persona using our layered avatar builder. Mix and match various pieces to create the perfect main character of your story.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg p-8 hover:border-white/40 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="font-pixel text-2xl text-white font-bold">3</span>
                </div>
                <h3 className="font-pixel text-xl text-white mb-4">
                  Write Your Adventure
                </h3>
                <p className="text-gray-300 font-pixel leading-relaxed">
                  Start journaling your daily experiences as epic adventures. Watch as your ordinary moments transform into thrilling quests and magical stories.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-pixel mb-6" style={{ fontSize: 'clamp(2rem, 6vw, 2.75rem)' }}>
              Magical Features
            </h2>
            <p className="font-pixel text-xl text-gray-300 max-w-2xl mx-auto text-center md:whitespace-nowrap md:flex md:justify-center">
              Everything you need to create your new story
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:border-white/40 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-pixel text-xl mb-3">{feature.title}</h3>
                <p className="text-gray-300 font-pixel">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Theme Showcase */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-pixel mb-6" style={{ fontSize: 'clamp(2rem, 6vw, 2.75rem)' }}>
              Choose Your Adventure
            </h2>
            <p className="font-pixel text-xl text-gray-300 max-w-2xl mx-auto text-center md:whitespace-nowrap md:flex md:justify-center">
              Select from multiple themes to match your style
            </p>
          </motion.div>

          {/* Theme Carousel */}
          <div className="relative max-w-7xl mx-auto">
            {/* Carousel Container */}
        <div className="relative">
          {/* Carousel Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentThemeIndex * 100}%)` }}
            >
              {/* Page 1: First 4 themes */}
              <div className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     {themePreviews.slice(0, 4).map((theme, index) => (
                       <div
                         key={theme.id}
                         className="backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:border-white/40 transition-all duration-300 hover:scale-105"
                         style={{
                           backgroundImage: theme.background,
                           backgroundSize: theme.backgroundSize,
                           animation: theme.animation,
                           borderColor: `${theme.color}40`
                         }}
                       >
                      <h3 className="font-pixel text-4xl font-bold text-white mb-3 text-center flex items-center justify-center gap-2">
                        <theme.icon className="w-6 h-6" />
                        {theme.name}
                      </h3>
                        <hr className="border-white/60 mb-4 border" style={{ boxShadow: '1px 1px 2px #000, -1px -1px 2px #000, 1px -1px 2px #000, -1px 1px 2px #000' }} />
                      <p className="text-gray-300 font-pixel text-sm leading-relaxed">
                        {theme.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Page 2: Last 4 themes */}
              <div className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     {themePreviews.slice(4, 8).map((theme, index) => (
                       <div
                         key={theme.id}
                         className="backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:border-white/40 transition-all duration-300 hover:scale-105"
                         style={{
                           backgroundImage: theme.background,
                           backgroundSize: theme.backgroundSize,
                           animation: theme.animation,
                           borderColor: `${theme.color}40`
                         }}
                       >
                      <h3 className="font-pixel text-4xl font-bold text-white mb-3 text-center flex items-center justify-center gap-2">
                        <theme.icon className="w-6 h-6" />
                        {theme.name}
                      </h3>
                        <hr className="border-white/60 mb-4 border" style={{ boxShadow: '1px 1px 2px #000, -1px -1px 2px #000, 1px -1px 2px #000, -1px 1px 2px #000' }} />
                      <p className="text-gray-300 font-pixel text-sm leading-relaxed">
                        {theme.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation Dots */}
          <div className="flex justify-center mt-8 gap-2">
            {[0, 1].map((index) => (
              <button
                key={index}
                onClick={() => setCurrentThemeIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentThemeIndex === index 
                    ? 'bg-white' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-pixel mb-6 text-center md:whitespace-nowrap md:flex md:justify-center" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.25rem)' }}>
              Frequently Asked Questions
            </h2>
            <p className="font-pixel text-xl text-gray-300 max-w-2xl mx-auto text-center md:whitespace-nowrap md:flex md:justify-center">
              Everything you need to know about Quillia
            </p>
          </motion.div>

          <div className="space-y-6">
            {/* FAQ Item 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(0)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
              >
                <h3 className="font-pixel text-xl text-white">
                  What is Quillia?
                </h3>
                <ChevronDown 
                  className={`w-6 h-6 text-white transition-transform duration-200 ${
                    expandedFAQ === 0 ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <motion.div
                initial={false}
                animate={{ 
                  height: expandedFAQ === 0 ? 'auto' : 0,
                  opacity: expandedFAQ === 0 ? 1 : 0
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6">
                  <p className="text-gray-300 font-pixel leading-relaxed">
                    Quillia is a journaling app that transforms your daily experiences into epic adventures. 
                    Choose from multiple themes, create unique characters, and write your story in a magical, 
                    immersive environment that makes every day feel like a quest.
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* FAQ Item 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(1)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
              >
                <h3 className="font-pixel text-xl text-white">
                  How many themes are available?
                </h3>
                <ChevronDown 
                  className={`w-6 h-6 text-white transition-transform duration-200 ${
                    expandedFAQ === 1 ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <motion.div
                initial={false}
                animate={{ 
                  height: expandedFAQ === 1 ? 'auto' : 0,
                  opacity: expandedFAQ === 1 ? 1 : 0
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6">
                  <p className="text-gray-300 font-pixel leading-relaxed">
                    Quillia offers 8 unique themes that let you become anything from a noble samurai to a mysterious detective or daring pirate sailing the seven seas, and even more. Each theme provides a completely different visual experience and atmosphere for your adventures.
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* FAQ Item 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(2)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
              >
                <h3 className="font-pixel text-xl text-white">
                  Can I create custom characters?
                </h3>
                <ChevronDown 
                  className={`w-6 h-6 text-white transition-transform duration-200 ${
                    expandedFAQ === 2 ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <motion.div
                initial={false}
                animate={{ 
                  height: expandedFAQ === 2 ? 'auto' : 0,
                  opacity: expandedFAQ === 2 ? 1 : 0
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6">
                  <p className="text-gray-300 font-pixel leading-relaxed">
                    Absolutely! Our layered avatar builder lets you create unique characters by mixing and matching 
                    various pieces. You can create characters that perfectly represent your fantasy persona.
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* FAQ Item 4 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(3)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
              >
                <h3 className="font-pixel text-xl text-white">
                  Is my data private and secure?
                </h3>
                <ChevronDown 
                  className={`w-6 h-6 text-white transition-transform duration-200 ${
                    expandedFAQ === 3 ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <motion.div
                initial={false}
                animate={{ 
                  height: expandedFAQ === 3 ? 'auto' : 0,
                  opacity: expandedFAQ === 3 ? 1 : 0
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6">
                  <p className="text-gray-300 font-pixel leading-relaxed">
                    Yes! We take your privacy seriously. All your journal entries and character data are encrypted 
                    and stored securely. You have full control over your data and can export or delete it at any time.
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* FAQ Item 5 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(4)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
              >
                <h3 className="font-pixel text-xl text-white">
                  How do I get started?
                </h3>
                <ChevronDown 
                  className={`w-6 h-6 text-white transition-transform duration-200 ${
                    expandedFAQ === 4 ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <motion.div
                initial={false}
                animate={{ 
                  height: expandedFAQ === 4 ? 'auto' : 0,
                  opacity: expandedFAQ === 4 ? 1 : 0
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6">
                  <p className="text-gray-300 font-pixel leading-relaxed">
                    Getting started is easy! Simply sign up for an account, choose your favorite theme, create your 
                    character, and start writing. Each step flows smoothly into the next, ensuring you have the perfect setup for the beginning of your journey.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-2xl p-12"
          >
            <h2 className="font-pixel mb-6" style={{ fontSize: 'clamp(2rem, 6vw, 2.75rem)' }}>
              Ready to Begin Your Journey?
            </h2>
            <p className="font-pixel text-xl text-gray-300 mb-8 max-w-3xl mx-auto text-center">
              Join others who are writing their story with Quillia. Transform your daily life into a new adventure now!
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => navigateWithTransition('/auth/signin')}
                className="font-pixel bg-gradient-to-r from-pink-600 to-pink-800 hover:from-pink-500 hover:to-pink-700 text-white px-8 py-4 rounded-lg border-2 border-pink-400 shadow-lg hover:shadow-pink-500/25 transition-all duration-300 text-lg font-bold"
              >
                Start Your Adventure
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      
      {/* CSS Animations for floating squares and carousel */}
        <style jsx>{`
        @keyframes neonPulse {
          0% { background-position: 0% 0%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
          100% { background-position: 0% 0%; }
        }
        
        @keyframes noirShift {
          0% { background-position: 0% 50%; }
          33% { background-position: 100% 0%; }
          66% { background-position: 100% 100%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes energyWave {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
        
        @keyframes mysticalDrift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes cosmicFlow {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
        
        @keyframes parchmentFlow {
          0% { background-position: 0% 50%; }
          33% { background-position: 100% 0%; }
          66% { background-position: 100% 100%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes dustStorm {
          0% { background-position: 0% 0%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
          100% { background-position: 0% 0%; }
        }
        
        @keyframes oceanWave {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(30px, -20px) rotate(90deg); }
          50% { transform: translate(-15px, -40px) rotate(180deg); }
          75% { transform: translate(-30px, 10px) rotate(270deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-25px, 25px) rotate(120deg); }
          66% { transform: translate(20px, -15px) rotate(240deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          20% { transform: translate(40px, 20px) rotate(72deg); }
          40% { transform: translate(-20px, 30px) rotate(144deg); }
          60% { transform: translate(-40px, -10px) rotate(216deg); }
          80% { transform: translate(10px, -30px) rotate(288deg); }
        }
        @keyframes float4 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(35px, -25px) rotate(180deg); }
        }
        @keyframes float5 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-30px, 20px) rotate(90deg); }
          50% { transform: translate(15px, 35px) rotate(180deg); }
          75% { transform: translate(25px, -15px) rotate(270deg); }
        }
        @keyframes float6 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, 20px) rotate(120deg); }
          66% { transform: translate(-25px, -25px) rotate(240deg); }
        }
        @keyframes float7 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(25px, -30px) rotate(90deg); }
          50% { transform: translate(-20px, -20px) rotate(180deg); }
          75% { transform: translate(-25px, 30px) rotate(270deg); }
        }
        @keyframes float8 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-35px, 25px) rotate(180deg); }
        }
        @keyframes float9 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-35px, 20px) rotate(90deg); }
          50% { transform: translate(20px, 35px) rotate(180deg); }
          75% { transform: translate(30px, -20px) rotate(270deg); }
        }
        @keyframes float10 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-30px, -25px) rotate(120deg); }
          66% { transform: translate(25px, 20px) rotate(240deg); }
        }
        @keyframes float11 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(30px, 30px) rotate(90deg); }
          50% { transform: translate(-20px, 25px) rotate(180deg); }
          75% { transform: translate(-25px, -30px) rotate(270deg); }
        }
        @keyframes float12 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(35px, -20px) rotate(180deg); }
        }
        @keyframes float13 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-25px, -25px) rotate(90deg); }
          50% { transform: translate(30px, -15px) rotate(180deg); }
          75% { transform: translate(20px, 30px) rotate(270deg); }
        }
        @keyframes float14 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(25px, -30px) rotate(120deg); }
          66% { transform: translate(-30px, 25px) rotate(240deg); }
        }
        @keyframes float15 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, 25px) rotate(120deg); }
          66% { transform: translate(-25px, -20px) rotate(240deg); }
        }
        @keyframes float16 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-30px, 25px) rotate(90deg); }
          50% { transform: translate(25px, 30px) rotate(180deg); }
          75% { transform: translate(20px, -25px) rotate(270deg); }
        }
      `}</style>
    </div>
  );
}
