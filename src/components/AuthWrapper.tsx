import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import QuilliaApp from './QuilliaApp';
import { useEntries } from '@/hooks/useEntries';

export default function AuthWrapper() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { entries } = useEntries();

  // Check if user is new based on their entry count
  const isFirstTimeUser = entries.length === 0;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Show loading state while NextAuth is checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
        {/* Theme-colored moving squares */}
        <div className="absolute inset-0">
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
              backgroundColor: '#B8860B',
              animation: 'float5 9s ease-in-out infinite',
              top: '45%',
              left: '10%'
            }}
          ></div>
          <div 
            className="absolute w-6 h-6 pixelated opacity-45" 
            style={{
              backgroundColor: '#B8860B',
              animation: 'float6 5s ease-in-out infinite',
              top: '60%',
              right: '15%'
            }}
          ></div>
          
          {/* Blazeheart Saga - Red */}
          <div 
            className="absolute w-5 h-5 pixelated opacity-65" 
            style={{
              backgroundColor: '#FF4500',
              animation: 'float7 8s ease-in-out infinite',
              top: '30%',
              right: '10%'
            }}
          ></div>
          <div 
            className="absolute w-7 h-7 pixelated opacity-50" 
            style={{
              backgroundColor: '#FF4500',
              animation: 'float8 6s ease-in-out infinite',
              bottom: '25%',
              left: '20%'
            }}
          ></div>
          
          {/* Echoes of Dawn - Purple */}
          <div 
            className="absolute w-4 h-4 pixelated opacity-60" 
            style={{
              backgroundColor: '#DDA0DD',
              animation: 'float9 7s ease-in-out infinite',
              top: '15%',
              left: '50%'
            }}
          ></div>
          <div 
            className="absolute w-6 h-6 pixelated opacity-55" 
            style={{
              backgroundColor: '#DDA0DD',
              animation: 'float10 9s ease-in-out infinite',
              bottom: '20%',
              right: '20%'
            }}
          ></div>
          
          {/* Obsidian Veil - Dark Purple */}
          <div 
            className="absolute w-5 h-5 pixelated opacity-70" 
            style={{
              backgroundColor: '#4B0082',
              animation: 'float11 8s ease-in-out infinite',
              top: '50%',
              right: '30%'
            }}
          ></div>
          <div 
            className="absolute w-4 h-4 pixelated opacity-60" 
            style={{
              backgroundColor: '#4B0082',
              animation: 'float12 6s ease-in-out infinite',
              bottom: '40%',
              left: '15%'
            }}
          ></div>
          
          {/* Starlit Horizon - Blue */}
          <div 
            className="absolute w-6 h-6 pixelated opacity-50" 
            style={{
              backgroundColor: '#00BFFF',
              animation: 'float13 10s ease-in-out infinite',
              top: '65%',
              left: '10%'
            }}
          ></div>
          <div 
            className="absolute w-5 h-5 pixelated opacity-65" 
            style={{
              backgroundColor: '#00BFFF',
              animation: 'float14 7s ease-in-out infinite',
              top: '25%',
              right: '15%'
            }}
          ></div>
          
          {/* Ivory Quill - Gold */}
          <div 
            className="absolute w-4 h-4 pixelated opacity-75" 
            style={{
              backgroundColor: '#DAA520',
              animation: 'float15 9s ease-in-out infinite',
              bottom: '15%',
              left: '45%'
            }}
          ></div>
          <div 
            className="absolute w-6 h-6 pixelated opacity-50" 
            style={{
              backgroundColor: '#DAA520',
              animation: 'float16 5s ease-in-out infinite',
              top: '12%',
              left: '30%'
            }}
          ></div>
          
          {/* Wild West - Brown */}
          <div 
            className="absolute w-5 h-5 pixelated opacity-60" 
            style={{
              backgroundColor: '#D2691E',
              animation: 'float17 8s ease-in-out infinite',
              top: '55%',
              left: '30%'
            }}
          ></div>
          <div 
            className="absolute w-4 h-4 pixelated opacity-70" 
            style={{
              backgroundColor: '#D2691E',
              animation: 'float18 6s ease-in-out infinite',
              bottom: '30%',
              right: '25%'
            }}
          ></div>
          
          {/* Crimson Tides - Dark Red */}
          <div 
            className="absolute w-6 h-6 pixelated opacity-55" 
            style={{
              backgroundColor: '#8B0000',
              animation: 'float19 7s ease-in-out infinite',
              top: '35%',
              left: '5%'
            }}
          ></div>
          <div 
            className="absolute w-5 h-5 pixelated opacity-60" 
            style={{
              backgroundColor: '#8B0000',
              animation: 'float20 9s ease-in-out infinite',
              bottom: '35%',
              right: '30%'
            }}
          ></div>
        </div>
        
        <style jsx>{`
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
            33% { transform: translate(-20px, -30px) rotate(120deg); }
            66% { transform: translate(30px, 15px) rotate(240deg); }
          }
          @keyframes float10 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(35px, 25px) rotate(90deg); }
            50% { transform: translate(-15px, 30px) rotate(180deg); }
            75% { transform: translate(-30px, -20px) rotate(270deg); }
          }
          @keyframes float11 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            20% { transform: translate(30px, -25px) rotate(72deg); }
            40% { transform: translate(-25px, -30px) rotate(144deg); }
            60% { transform: translate(-30px, 20px) rotate(216deg); }
            80% { transform: translate(25px, 30px) rotate(288deg); }
          }
          @keyframes float12 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(25px, -30px) rotate(180deg); }
          }
          @keyframes float13 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(-35px, 20px) rotate(90deg); }
            50% { transform: translate(20px, 35px) rotate(180deg); }
            75% { transform: translate(30px, -20px) rotate(270deg); }
          }
          @keyframes float14 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(-30px, -25px) rotate(120deg); }
            66% { transform: translate(25px, 20px) rotate(240deg); }
          }
          @keyframes float15 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(30px, 30px) rotate(90deg); }
            50% { transform: translate(-20px, 25px) rotate(180deg); }
            75% { transform: translate(-25px, -30px) rotate(270deg); }
          }
          @keyframes float16 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(35px, -20px) rotate(180deg); }
          }
          @keyframes float17 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(-25px, -25px) rotate(90deg); }
            50% { transform: translate(30px, -15px) rotate(180deg); }
            75% { transform: translate(20px, 30px) rotate(270deg); }
          }
          @keyframes float18 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(25px, -30px) rotate(120deg); }
            66% { transform: translate(-30px, 25px) rotate(240deg); }
          }
          @keyframes float19 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(30px, 25px) rotate(120deg); }
            66% { transform: translate(-25px, -20px) rotate(240deg); }
          }
          @keyframes float20 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(-30px, 25px) rotate(90deg); }
            50% { transform: translate(25px, 30px) rotate(180deg); }
            75% { transform: translate(20px, -25px) rotate(270deg); }
          }
        `}</style>
        
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-white border-t-transparent pixelated mb-6 animate-spin mx-auto"></div>
          <p className="text-white text-xl font-pixel tracking-wider">
            {isFirstTimeUser ? 'Ready to start your adventure?' : 'Ready to continue your adventure?'}
          </p>
          <div className="flex justify-center mt-4 space-x-1">
            <div className="w-2 h-2 bg-white pixelated animate-pulse"></div>
            <div className="w-2 h-2 bg-white pixelated animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-white pixelated animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to sign in
  }

  return <QuilliaApp />;
}
