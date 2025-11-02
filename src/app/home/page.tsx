'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Footer from '@/components/Footer';
import { themes } from '@/themes';
import { Theme } from '@/types';
import { Zap, Search, Swords, Moon, Rocket, Scroll, Target, Anchor, ChevronDown } from 'lucide-react';
import { headPieces, torsoPieces, legsPieces, type AvatarPiece } from '@/lib/layered-avatars';
import { getCachedImageUrl } from '@/lib/asset-cache';

export default function LandingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentTheme, setCurrentTheme] = useState<Theme>('velour-nights');
  const [isVisible, setIsVisible] = useState(false);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Touch and mouse handling for carousel swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [mouseStart, setMouseStart] = useState<number | null>(null);
  const [mouseEnd, setMouseEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const minSwipeDistance = 50;
  
  // Dynamic height matching for showcase section
  const [showcaseImageHeight, setShowcaseImageHeight] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const showcaseImageRef = useRef<HTMLDivElement>(null);
  const showcaseChapterRef = useRef<HTMLDivElement>(null);
  const showcaseStatsRef = useRef<HTMLDivElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const learnMoreButtonRef = useRef<HTMLButtonElement>(null);

  // Character builder showcase state
  const [showcaseActiveCategory, setShowcaseActiveCategory] = useState<'head' | 'torso' | 'legs'>('head');
  // Using exact pieces from the reference screenshot
  const showcaseSelectedHead = headPieces.find(p => p.id === 'female-head-17') || headPieces[0];
  const showcaseSelectedTorso = torsoPieces.find(p => p.id === 'male-torso-5') || torsoPieces[0];
  const showcaseSelectedLegs = legsPieces.find(p => p.id === 'female-legs-4') || legsPieces[0];

  // Showcase data - example of what users can create
  const showcaseData = {
    imageUrl: '/screenshots/showcase-image.png', // Update this path when you add the image
    chapter: "As the crimson sun sank behind the tiled roofs of Aokigahara, its dying light bathed the quiet village in amber hues. Ann strode along the ancient stone path, flanked by cherry threes whose petals danced upon the wind like silent counsel from long-departed ancestors. She approached the Bamboo Haven, the new abode of her neighbor Maiko, its entry adorned with lacquered masks and blades that spoke of a shared reverence for bushido. Together, they bore the weight of wooden chests filled with heirlooms and scrolls, each one a silent chronicle of loyalty and duty, lifted with the steady hands of those bound by honor. When the final box was set upon the tatami, Maiko poured Ann a cup of steaming matcha, the aroma curling between them as an offering of thanks rooted in ancient custom. Yet, mindful of her sensei's teachings of self-discipline, Ann pressed her palms together and declined, her bow as deep as her gratitude. With the familiar heft of her katana at her hip, Ann took her leave, the shower of sakura blossoms overhead a fletting reminder that even a warrior's path is illuminated by moments of gentle kindness.",
    statChanges: {
      "Discipline": {
        "change": 2,
        "reason": "Demonstrated self-control by declining a drink, adhering to teachings on self-discipline",
        "confidence": 0.90
      },
      "Valor": {
        "change": 1,
        "reason": "Showed courage in helping a neighbor with heavy boxes, facing physical challenges",
        "confidence": 0.80
      },
      "Spirit": {
        "change": 1,
        "reason": "Exhibited emotional fortitude by expressing gratitude and kindess through actions",
        "confidence": 0.85
      }
    },
    characterName: "Ann",
    expGained: 27
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Detect if we're on desktop for showcase height matching
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Function to measure and set image column height
  const measureShowcaseHeight = () => {
    if (showcaseImageRef.current && isDesktop) {
      // Use multiple requestAnimationFrame calls to ensure layout is complete
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const columnElement = showcaseImageRef.current;
            if (columnElement) {
              // Measure the entire column div - this includes the heading and card
              const height = columnElement.offsetHeight;
              if (height && height > 0) {
                setShowcaseImageHeight(height);
              }
            }
          });
        });
      });
    }
  };

  // Handle image load and measure column height for matching
  const handleShowcaseImageLoad = () => {
    // Delay measurement slightly to ensure image is fully rendered
    setTimeout(() => {
      measureShowcaseHeight();
    }, 100);
  };

  // Measure height when component becomes visible and after animations
  useEffect(() => {
    if (!showcaseImageRef.current || !isDesktop) return;

    // Measure after animations complete (framer-motion delay is 0.4s + 0.6s transition = ~1s)
    const timer = setTimeout(() => {
      measureShowcaseHeight();
    }, 1500);

    // Also measure on resize with debouncing
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        measureShowcaseHeight();
      }, 250);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDesktop]);

  // Match Learn More button width to Start Your Adventure button width
  useEffect(() => {
    if (startButtonRef.current && learnMoreButtonRef.current) {
      const startWidth = startButtonRef.current.offsetWidth;
      if (startWidth > 0) {
        learnMoreButtonRef.current.style.width = `${startWidth}px`;
      }
    }
    
    // Re-measure on resize
    const handleResize = () => {
      if (startButtonRef.current && learnMoreButtonRef.current) {
        const startWidth = startButtonRef.current.offsetWidth;
        if (startWidth > 0) {
          learnMoreButtonRef.current.style.width = `${startWidth}px`;
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  // Touch handlers for carousel swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentThemeIndex < 1) {
      setCurrentThemeIndex(currentThemeIndex + 1);
    }
    if (isRightSwipe && currentThemeIndex > 0) {
      setCurrentThemeIndex(currentThemeIndex - 1);
    }
  };

  // Mouse handlers for carousel drag (PC)
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setMouseEnd(null);
    setMouseStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setMouseEnd(e.clientX);
  };

  const onMouseUp = () => {
    if (!isDragging) return;
    if (mouseStart !== null && mouseEnd !== null) {
      const distance = mouseStart - mouseEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      if (isLeftSwipe && currentThemeIndex < 1) {
        setCurrentThemeIndex(currentThemeIndex + 1);
      }
      if (isRightSwipe && currentThemeIndex > 0) {
        setCurrentThemeIndex(currentThemeIndex - 1);
      }
    }
    setIsDragging(false);
    setMouseStart(null);
    setMouseEnd(null);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
    setMouseStart(null);
    setMouseEnd(null);
  };

  const navigateWithTransition = (path: string) => {
    setIsTransitioning(true);
    
    // Navigate immediately - let the fade happen during navigation
    router.push(path);
  };

  const handleEnterClick = () => {
    if (status === 'loading') {
      return; // Wait for auth status to be determined
    }
    
    if (session) {
      // User is logged in, go to main app
      navigateWithTransition('/');
    } else {
      // User is not logged in, go to sign in
      navigateWithTransition('/auth/signin');
    }
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
      let startTime: number | null = null;
      
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
      description: 'Phase into a near-future city where every screen hums with secrets and rain carries the static of a thousand networks. This theme transforms ordinary moments into high-stakes cyberpunk tales about people navigating surveillance, corporate power, and the thin line between identity and data. Expect grounded, human stories of quiet resistance, clever subterfuge, and finding connection in a place built to keep everyone apart.'
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
      description: 'Plunge into the shadowy world of mystery and intrigue where every detail matters and nothing is as it seems. This theme transforms your daily experiences into compelling detective stories filled with hidden clues, unexpected twists, and the satisfaction of solving puzzles. Every story becomes a thrilling journey through the art of deduction, where keen observation and sharp intuition lead to the truth.'
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
      description: 'Step into a world where every moment is a lesson in bushido. This theme transforms your daily experiences into immersive tales of samurai life, from quiet moments of meditation to intense training sessions, honing both mind and body. Experience the weight of honor, the discipline of daily practice, and the profound wisdom of masters who guide your path, all in your journey toward becoming a true warrior.'
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
      description: 'Descend into velvet black where prayers taste of iron and names carry debt. This theme turns ordinary moments into intimate dark fantasy, with chapels that listen, relics that hunger, and mirrors that remember. Expect quiet dread, patient temptation, and power that arrives politely and asks for something in return, tales about secrecy, cost, and the thin line between protection and possession.'
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
      description: 'Step into quiet starships, lonely outposts, and skies that never end. This theme turns ordinary moments into grounded science fiction about navigation, adaptation, and wonder—charting courses through the unknown, listening for signals in the static, and making small choices that matter on a cosmic scale. Expect discovery over spectacle, human ingenuity over destiny, and the steady work of exploration.'
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
      description: 'Enter a world where magic flows through ancient tomes and every word holds power. This theme transforms your daily experiences into epic high fantasy adventures where you become a scholar-mage, wielding knowledge as your greatest weapon. Whether you\'re studying in a mystical library, negotiating with noble houses, or uncovering lost spells, each moment becomes part of a grand tapestry of destiny.'
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
      description: 'Dust on your boots, sun at your back, and a town that never forgets names. Step into a world that turns your everyday moments into frontier stories about grit, barter, and reputation: quiet favors at the livery, cards that don\'t shuffle right, and letters that arrive months late. Expect lean stakes and steady hands: deals over drinks, iron under coats, and the long road between what is legal and what is right.'
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
      description: 'Hoist canvas and read the waters. This theme turns ordinary moments into salt‑worn tales of seamanship, luck, and quiet daring—maps that don\'t agree, storms that bargain, and crews bound by rope, coin, and song. Expect clever work over brute force: codes in logbooks, hidden coves at low tide, and treasure that asks what you\'ll trade to keep it. It\'s about patience with the wind, trust earned on the line, and choices that echo across tides.'
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
        
        {/* Treasure Tides - Dark Red */}
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
              onClick={handleEnterClick}
              className="font-pixel bg-white/20 hover:bg-gradient-to-r hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600 text-white px-6 py-3 rounded-lg hover:scale-105 transition-all duration-300 font-bold" 
              style={{ fontSize: '1.375rem' }}
            >
              Enter
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
                ref={startButtonRef}
                onClick={handleEnterClick}
                className="font-pixel bg-white text-black hover:text-white hover:bg-gradient-to-r hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600 px-8 py-4 rounded-lg border-2 border-black shadow-lg hover:shadow-gray-400/25 hover:scale-105 transition-all duration-300 text-lg font-bold"
                style={{ textShadow: 'none' }}
              >
                Start Your Adventure
              </button>
              <button 
                ref={learnMoreButtonRef}
                onClick={() => smoothScrollTo('how-it-works')}
                className="font-pixel bg-black text-white hover:bg-gray-900 px-8 py-4 rounded-lg border-2 border-gray-700 shadow-lg hover:shadow-gray-600/25 transition-all duration-300 text-lg font-bold transform hover:scale-105 active:scale-95"
              >
                Learn More
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
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

          {/* Step 1: Choose Your Theme */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            className="mb-20"
            >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="order-1 lg:order-1">
              <div className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg p-8 hover:border-white/40 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-pixel text-xl text-white font-bold">1</span>
                </div>
                    <h3 className="font-pixel text-white" style={{ fontSize: 'clamp(0.875rem, 2vw, 1.25rem)' }}>
                  Choose Your Theme
                </h3>
                  </div>
                  <p className="text-gray-300 font-pixel leading-relaxed text-lg">
                    Select from 8 unique fantasy themes that match your adventure style. Become a samurai, detective, pirate, or explore other magical worlds. Each theme transforms your journaling experience with unique visuals, sounds, and atmosphere.
                  </p>
                </div>
              </div>
              <div className="order-2 lg:order-2">
                <Card theme="blazeheart-saga" className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-16 h-16 pixelated border-2 flex-shrink-0"
                      style={{ 
                        background: `linear-gradient(135deg, ${themes['blazeheart-saga'].colors.background} 0%, ${themes['blazeheart-saga'].colors.primary} 50%, ${themes['blazeheart-saga'].colors.secondary} 100%)`,
                        borderColor: themes['blazeheart-saga'].colors.border
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{themes['blazeheart-saga'].emoji}</span>
                        <h3 className="font-pixel text-xl" style={{ color: themes['blazeheart-saga'].colors.text }}>
                          {themes['blazeheart-saga'].name}
                        </h3>
                      </div>
                      <p className="font-pixel text-sm mb-3" style={{ color: themes['blazeheart-saga'].colors.accent }}>
                        The {themes['blazeheart-saga'].archetype?.name}
                      </p>
                    </div>
                  </div>
                  <p className="font-pixel text-sm leading-relaxed mb-4" style={{ color: themes['blazeheart-saga'].colors.text }}>
                    {themes['blazeheart-saga'].detailedDescription}
                  </p>
                </Card>
              </div>
              </div>
            </motion.div>

          {/* Step 2: Create Your Character */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            className="mb-20"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1">
                <Card theme="blazeheart-saga" className="p-6">
                  <h2 className="font-pixel text-xl mb-4" style={{ color: themes['blazeheart-saga'].colors.text }}>
                    Build Your Avatar
                  </h2>
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Avatar Preview */}
                    <div className="flex-shrink-0 w-full lg:w-48 flex flex-col items-center">
                      <h3 className="font-pixel text-base mb-4" style={{ color: themes['blazeheart-saga'].colors.text }}>
                        Preview
                      </h3>
                      <div 
                        className="relative w-28 h-40 bg-gray-800 pixelated p-3 flex flex-col items-center justify-center"
                        style={{ 
                          backgroundColor: themes['blazeheart-saga'].colors.background + 'CC'
                        }}
                      >
                        <div className="relative w-24 h-36 flex flex-col justify-end">
                          {/* Head Layer */}
                          <div className="flex-shrink-0 h-14 mb-0.5">
                            <Image
                              src={getCachedImageUrl(showcaseSelectedHead.imagePath)}
                              alt={showcaseSelectedHead.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-contain pixelated"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          </div>
                          {/* Torso Layer */}
                          <div className="flex-shrink-0 h-14 mb-0.5">
                            <Image
                              src={getCachedImageUrl(showcaseSelectedTorso.imagePath)}
                              alt={showcaseSelectedTorso.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-contain pixelated"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          </div>
                          {/* Legs Layer */}
                          <div className="flex-shrink-0 h-12">
                            <Image
                              src={getCachedImageUrl(showcaseSelectedLegs.imagePath)}
                              alt={showcaseSelectedLegs.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-contain pixelated"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Category Selector */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex gap-1 mb-4 w-full">
                        {(['Head', 'Torso', 'Legs'] as const).map((category, idx) => {
                          const categoryKey = category.toLowerCase() as 'head' | 'torso' | 'legs';
                          const isActive = showcaseActiveCategory === categoryKey;
                          return (
                            <button
                              key={category}
                              onClick={() => setShowcaseActiveCategory(categoryKey)}
                              className={`flex-1 px-4 py-2 pixelated font-pixel text-sm transition-all font-bold ${
                                isActive ? 'shadow-lg' : 'opacity-70 hover:opacity-100'
                              }`}
                              style={{
                                backgroundColor: isActive ? themes['blazeheart-saga'].colors.accent : 'transparent',
                                color: themes['blazeheart-saga'].colors.text,
                                border: `2px solid ${themes['blazeheart-saga'].colors.border}`,
                                boxShadow: isActive ? `0 0 10px ${themes['blazeheart-saga'].colors.accent}40` : 'none'
                              }}
                            >
                              {category}
                            </button>
                          );
                        })}
                      </div>

                      {/* Pieces Grid - Show actual avatar pieces */}
                      {showcaseActiveCategory === 'head' && (
                        <>
                          <h4 className="font-pixel text-sm mb-2" style={{ color: themes['blazeheart-saga'].colors.accent }}>
                            Head Pieces ({headPieces.length})
                          </h4>
                          <div className="grid grid-cols-6 gap-1">
                            {headPieces.slice(0, 12).map((piece, idx) => {
                              const isSelected = piece.id === showcaseSelectedHead.id;
                              return (
                                <div
                                  key={piece.id}
                                  className={`w-full aspect-square pixelated border-2 transition-all hover:scale-105 cursor-pointer p-1 ${
                                    isSelected ? 'ring-2 ring-orange-500' : ''
                                  }`}
                                  style={{ 
                                    borderColor: isSelected ? themes['blazeheart-saga'].colors.accent : themes['blazeheart-saga'].colors.border,
                                    backgroundColor: themes['blazeheart-saga'].colors.background + '80'
                                  }}
                                >
                                  <Image
                                    src={getCachedImageUrl(piece.imagePath)}
                                    alt={piece.name}
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-contain pixelated"
                                    style={{ imageRendering: 'pixelated' }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                      {showcaseActiveCategory === 'torso' && (
                        <>
                          <h4 className="font-pixel text-sm mb-2" style={{ color: themes['blazeheart-saga'].colors.accent }}>
                            Torso Pieces ({torsoPieces.length})
                          </h4>
                          <div className="grid grid-cols-6 gap-1">
                            {torsoPieces.slice(0, 12).map((piece, idx) => {
                              const isSelected = piece.id === showcaseSelectedTorso.id;
                              return (
                                <div
                                  key={piece.id}
                                  className={`w-full aspect-square pixelated border-2 transition-all hover:scale-105 cursor-pointer p-1 ${
                                    isSelected ? 'ring-2 ring-orange-500' : ''
                                  }`}
                                  style={{ 
                                    borderColor: isSelected ? themes['blazeheart-saga'].colors.accent : themes['blazeheart-saga'].colors.border,
                                    backgroundColor: themes['blazeheart-saga'].colors.background + '80'
                                  }}
                                >
                                  <Image
                                    src={getCachedImageUrl(piece.imagePath)}
                                    alt={piece.name}
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-contain pixelated"
                                    style={{ imageRendering: 'pixelated' }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                      {showcaseActiveCategory === 'legs' && (
                        <>
                          <h4 className="font-pixel text-sm mb-2" style={{ color: themes['blazeheart-saga'].colors.accent }}>
                            Legs Pieces ({legsPieces.length})
                          </h4>
                          <div className="grid grid-cols-6 gap-1">
                            {legsPieces.slice(0, 12).map((piece, idx) => {
                              const isSelected = piece.id === showcaseSelectedLegs.id;
                              return (
                                <div
                                  key={piece.id}
                                  className={`w-full aspect-square pixelated border-2 transition-all hover:scale-105 cursor-pointer p-1 ${
                                    isSelected ? 'ring-2 ring-orange-500' : ''
                                  }`}
                                  style={{ 
                                    borderColor: isSelected ? themes['blazeheart-saga'].colors.accent : themes['blazeheart-saga'].colors.border,
                                    backgroundColor: themes['blazeheart-saga'].colors.background + '80'
                                  }}
                                >
                                  <Image
                                    src={getCachedImageUrl(piece.imagePath)}
                                    alt={piece.name}
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-contain pixelated"
                                    style={{ imageRendering: 'pixelated' }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
              <div className="order-1 lg:order-2">
              <div className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg p-8 hover:border-white/40 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-pixel text-xl text-white font-bold">2</span>
                </div>
                    <h3 className="font-pixel text-white" style={{ fontSize: 'clamp(0.875rem, 2vw, 1.25rem)' }}>
                  Create Your Character
                </h3>
                  </div>
                  <p className="text-gray-300 font-pixel leading-relaxed text-lg">
                    Build your unique persona using our layered avatar builder. Mix and match various pieces to create the perfect main character of your story. Customize head, top, and bottom layers to bring your fantasy persona to life.
                </p>
                </div>
              </div>
              </div>
            </motion.div>

          {/* Step 3: Write Your Adventure */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            className="mb-20"
            >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="order-1 lg:order-1">
              <div className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg p-8 hover:border-white/40 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-pixel text-xl text-white font-bold">3</span>
                </div>
                    <h3 className="font-pixel text-white" style={{ fontSize: 'clamp(0.875rem, 2vw, 1.25rem)' }}>
                  Write Your Adventure
                </h3>
                  </div>
                  <p className="text-gray-300 font-pixel leading-relaxed text-lg">
                  Start journaling your daily experiences and watch as your ordinary moments transform into thrilling quests and magical stories. With each moment you capture, shape the way your character evolves, according to the paths you dare to take.
                  </p>
                </div>
              </div>
              <div className="order-2 lg:order-2">
                <Card theme="blazeheart-saga" className="p-6">
                  <div className="space-y-3">
                    <div className="text-center">
                      <h3 className="font-pixel text-lg mb-1" style={{ color: themes['blazeheart-saga'].colors.accent }}>
                        JOURNAL ENTRY
                      </h3>
                      <p className="font-pixel text-sm" style={{ color: themes['blazeheart-saga'].colors.text }}>
                        Tell us about your day, Ann
                      </p>
                    </div>
                    <div className="relative">
                      <textarea
                        value="I helped my neighbor carry some heavy boxes into her new apartment. She offered me a drink as thanks, but I politely declined."
                        readOnly
                        rows={5}
                        className="w-full p-4 pixelated border-2 resize-none leading-relaxed focus:outline-none"
                        style={{
                          backgroundColor: themes['blazeheart-saga'].colors.background,
                          borderColor: themes['blazeheart-saga'].colors.border,
                          color: themes['blazeheart-saga'].colors.text,
                          boxShadow: `inset 0 2px 4px ${themes['blazeheart-saga'].colors.background}80`,
                        }}
                      />
                      {/* Enhanced decorative squares */}
                      <div 
                        className="absolute -top-2 -left-2 w-4 h-4 pixelated border"
                        style={{
                          backgroundColor: themes['blazeheart-saga'].colors.accent,
                          borderColor: themes['blazeheart-saga'].colors.border,
                          boxShadow: `0 2px 4px ${themes['blazeheart-saga'].colors.background}`
                        }}
                      ></div>
                      <div 
                        className="absolute -top-1 -right-1 w-3 h-3 pixelated border"
                        style={{
                          backgroundColor: '#FF8C00',
                          borderColor: themes['blazeheart-saga'].colors.border,
                          boxShadow: `0 2px 4px ${themes['blazeheart-saga'].colors.background}`
                        }}
                      ></div>
                    </div>
                    <div className="space-y-3 pt-0.5 border-t text-center" style={{ borderColor: themes['blazeheart-saga'].colors.border + '40' }}>
                      <p className="font-pixel text-sm" style={{ color: themes['blazeheart-saga'].colors.text }}>
                        What kind of adventure should Ann go on?
                      </p>
                      <div className="flex gap-0.5 w-full">
                        <button
                          className="flex-1 px-6 py-4 pixelated font-pixel text-base font-bold transition-all flex items-center justify-center gap-2"
                          style={{
                            background: `linear-gradient(to bottom, #8B0000, #5C0000)`,
                            color: '#FFFFFF',
                            border: `1px solid #000000`,
                            boxShadow: 'none'
                          }}
                        >
                          <span className="text-xl">📖</span>
                          <span>Chapter</span>
                        </button>
                        <button
                          className="flex-1 px-6 py-4 pixelated font-pixel text-base font-bold transition-all flex items-center justify-center gap-2"
                          style={{
                            background: `linear-gradient(to bottom, #FFD700, #FFA500)`,
                            color: '#FFFFFF',
                            border: `1px solid #000000`,
                            boxShadow: 'none'
                          }}
                        >
                          <span className="text-xl">🖼️</span>
                          <span>Scene</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              </div>
            </motion.div>

          {/* Results Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <div className="text-center mb-12">
              <h2 className="font-pixel mb-6" style={{ fontSize: 'clamp(2rem, 6vw, 2.75rem)' }}>
                Your Adventures Come to Life
              </h2>
              <p className="text-gray-300 font-pixel text-lg max-w-2xl mx-auto">
                Watch your daily experiences transform into new stories
              </p>
          </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">
              {/* Image Column */}
              <div
                ref={showcaseImageRef}
                className="lg:flex lg:flex-col h-auto"
              >
                <h3 className="font-pixel text-lg text-white mb-3">The Painted Scene:</h3>
                <Card 
                  theme="blazeheart-saga" 
                  effect="glow" 
                  className="lg:flex lg:flex-col lg:max-h-[500px] !p-0"
                >
                  <div className="lg:flex-1 lg:overflow-hidden lg:flex lg:items-center lg:justify-center w-full h-full p-0">
                    <Image
                      src={showcaseData.imageUrl}
                      alt="Generated adventure scene"
                      width={600}
                      height={600}
                      className="w-full h-full object-contain pixelated"
                      onLoad={(e) => {
                        handleShowcaseImageLoad();
                        measureShowcaseHeight();
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        if (target.parentElement) {
                          target.parentElement.innerHTML = `<div class="flex items-center justify-center h-full text-gray-400 font-pixel text-center p-4"><p>Place your showcase image at: ${showcaseData.imageUrl}</p></div>`;
                        }
                      }}
                    />
                  </div>
                </Card>
              </div>

              {/* Chapter Column */}
              <div
                ref={showcaseChapterRef}
                className="lg:flex lg:flex-col h-auto"
                style={
                  showcaseImageHeight && isDesktop
                    ? { height: `${showcaseImageHeight}px` }
                    : {}
                }
              >
                <h3 className="font-pixel text-lg text-white mb-3">The Matching Chapter:</h3>
                <Card theme="blazeheart-saga" effect="glow" className="lg:flex-1 lg:overflow-y-auto !pt-2 !pr-2 !pb-2 !pl-4">
                  <div className="text-white leading-relaxed text-sm pr-2">
                    {showcaseData.chapter}
                  </div>
                </Card>
              </div>

              {/* Stat Growth Column */}
              <div
                ref={showcaseStatsRef}
                className="lg:flex lg:flex-col h-auto"
                style={
                  showcaseImageHeight && isDesktop
                    ? { height: `${showcaseImageHeight}px` }
                    : {}
                }
              >
                <h3 className="font-pixel text-lg text-white mb-3">
                  📊 {showcaseData.characterName}{showcaseData.characterName.endsWith('s') ? "'" : "'s"} growth:
                </h3>
                <Card theme="blazeheart-saga" effect="glow" className="lg:flex-1 lg:flex lg:flex-col lg:overflow-y-auto">
                  <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                    {Object.entries(showcaseData.statChanges)
                      .filter(([_, change]) => (change as any).change !== 0)
                      .map(([statName, change]) => {
                        const statChange = change as { change: number; reason: string; confidence: number };
                        return (
                          <div
                            key={statName}
                            className={`p-3 rounded-lg border-2 ${
                              statChange.change > 0
                                ? 'bg-green-600/20 border-green-500/50'
                                : statChange.change < 0
                                  ? 'bg-red-600/20 border-red-500/50'
                                  : 'bg-gray-600/20 border-gray-500/50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-pixel text-lg text-white">{statName}</span>
                              <span className={`font-pixel text-xl font-bold ${
                                statChange.change > 0 ? 'text-green-300' : statChange.change < 0 ? 'text-red-300' : 'text-gray-300'
                              }`}>
                                {statChange.change > 0 ? '+' : ''}{statChange.change}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 mb-1">{statChange.reason}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">Confidence:</span>
                              <span className="text-xs text-blue-300 font-pixel">
                                {Math.round(statChange.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    {showcaseData.expGained && (
                      <div className="mt-4 p-3 bg-blue-600/20 border-2 border-blue-500/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-pixel text-lg text-white">Exp. Gained</span>
                          <span className="font-pixel text-xl font-bold text-blue-300">
                            +{showcaseData.expGained} EXP
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
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
          <div 
            className="overflow-hidden cursor-grab active:cursor-grabbing"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            style={{ touchAction: 'pan-y', userSelect: 'none' }}
          >
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
              Join others who are writing their story with Quillia. <br></br>Transform your daily life into a new adventure now!
            </p>
            <div className="flex justify-center">
              <button 
                onClick={handleEnterClick}
                className="font-pixel bg-white text-black hover:text-white hover:bg-gradient-to-r hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600 px-8 py-4 rounded-lg border-2 border-black shadow-lg hover:shadow-gray-400/25 hover:scale-105 transition-all duration-300 text-lg font-bold"
                style={{ textShadow: 'none' }}
              >
                Start Your Adventure
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      {/* <Footer /> */}
      
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
