import { Theme } from '@/types';
import { themes } from '@/themes';

interface MovingGradientBackgroundProps {
  theme: Theme;
}

export default function MovingGradientBackground({ theme }: MovingGradientBackgroundProps) {
  const themeConfig = themes[theme];
  
  if (!themeConfig) {
    return null;
  }

  const { colors } = themeConfig;

  // Create moving gradient styles for each theme
  const getGradientStyle = () => {
    switch (theme) {
      case 'velour-nights':
        return {
          background: `
            linear-gradient(45deg, ${colors.background}, ${colors.primary}, ${colors.secondary}, ${colors.accent}),
            linear-gradient(-45deg, ${colors.secondary}, ${colors.background}, ${colors.primary}, ${colors.accent})
          `,
          backgroundSize: '400% 400%',
          animation: 'gradientShift 8s ease infinite'
        };

      case 'neon-ashes':
        return {
          background: `
            linear-gradient(90deg, ${colors.background}, ${colors.primary}, ${colors.secondary}, ${colors.accent}),
            linear-gradient(180deg, ${colors.secondary}, ${colors.background}, ${colors.primary}, ${colors.accent})
          `,
          backgroundSize: '300% 300%',
          animation: 'neonPulse 4s ease-in-out infinite'
        };

      case 'crimson-casefiles':
        return {
          background: `
            linear-gradient(135deg, ${colors.background}, ${colors.primary}, ${colors.secondary}, ${colors.accent}),
            linear-gradient(225deg, ${colors.secondary}, ${colors.background}, ${colors.primary}, ${colors.accent})
          `,
          backgroundSize: '500% 500%',
          animation: 'noirShift 12s ease infinite'
        };

      case 'blazeheart-saga':
        return {
          background: `
            linear-gradient(60deg, ${colors.background}, ${colors.primary}, ${colors.secondary}, ${colors.accent}),
            linear-gradient(120deg, ${colors.secondary}, ${colors.background}, ${colors.primary}, ${colors.accent})
          `,
          backgroundSize: '350% 350%',
          animation: 'energyWave 6s ease-in-out infinite'
        };

      case 'echoes-of-dawn':
        return {
          background: `
            linear-gradient(30deg, ${colors.background}, ${colors.primary}, ${colors.secondary}, ${colors.accent}),
            linear-gradient(150deg, ${colors.secondary}, ${colors.background}, ${colors.primary}, ${colors.accent})
          `,
          backgroundSize: '600% 600%',
          animation: 'nostalgicFloat 15s ease infinite'
        };

      case 'obsidian-veil':
        return {
          background: `
            linear-gradient(75deg, ${colors.background}, ${colors.primary}, ${colors.secondary}, ${colors.accent}),
            linear-gradient(255deg, ${colors.secondary}, ${colors.background}, ${colors.primary}, ${colors.accent})
          `,
          backgroundSize: '400% 400%',
          animation: 'mysticalDrift 10s ease infinite'
        };

      case 'starlit-horizon':
        return {
          background: `
            linear-gradient(0deg, ${colors.background}, ${colors.primary}, ${colors.secondary}, ${colors.accent}),
            linear-gradient(90deg, ${colors.secondary}, ${colors.background}, ${colors.primary}, ${colors.accent})
          `,
          backgroundSize: '300% 300%',
          animation: 'cosmicFlow 8s ease infinite'
        };

      case 'ivory-quill':
        return {
          background: `
            linear-gradient(45deg, ${colors.background}, ${colors.primary}, ${colors.secondary}, ${colors.accent}),
            linear-gradient(135deg, ${colors.secondary}, ${colors.background}, ${colors.primary}, ${colors.accent})
          `,
          backgroundSize: '450% 450%',
          animation: 'parchmentFlow 12s ease infinite'
        };

      case 'wild-west':
        return {
          background: `
            linear-gradient(15deg, ${colors.background}, ${colors.primary}, ${colors.secondary}, ${colors.accent}),
            linear-gradient(195deg, ${colors.secondary}, ${colors.background}, ${colors.primary}, ${colors.accent})
          `,
          backgroundSize: '500% 500%',
          animation: 'dustStorm 14s ease infinite'
        };

      case 'crimson-tides':
        return {
          background: `
            linear-gradient(120deg, ${colors.background}, ${colors.primary}, ${colors.secondary}, ${colors.accent}),
            linear-gradient(240deg, ${colors.secondary}, ${colors.background}, ${colors.primary}, ${colors.accent})
          `,
          backgroundSize: '400% 400%',
          animation: 'oceanWave 10s ease infinite'
        };

      default:
        return {
          background: `
            linear-gradient(45deg, ${colors.background}, ${colors.primary}, ${colors.secondary}, ${colors.accent}),
            linear-gradient(-45deg, ${colors.secondary}, ${colors.background}, ${colors.primary}, ${colors.accent})
          `,
          backgroundSize: '400% 400%',
          animation: 'gradientShift 8s ease infinite'
        };
    }
  };

  const gradientStyle = getGradientStyle();
  
  return (
    <>
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: gradientStyle.background,
          backgroundSize: gradientStyle.backgroundSize,
          animation: gradientStyle.animation,
          transition: 'background-image 1.5s ease-in-out, background-size 1.5s ease-in-out'
        }}
      />
      {/* Subtle overlay to improve text readability */}
      <div 
        className="fixed inset-0 -z-10 bg-black/20"
        style={{
          mixBlendMode: 'multiply'
        }}
      />
      
      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
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
        
        @keyframes nostalgicFloat {
          0% { background-position: 0% 0%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
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
      `}</style>
    </>
  );
}





