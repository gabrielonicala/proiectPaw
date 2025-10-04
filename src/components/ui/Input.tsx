'use client';

import { cn } from '@/lib/utils';
import { Theme } from '@/types';
import { themes } from '@/themes';

interface InputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'textarea';
  className?: string;
  pixelated?: boolean;
  rows?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  autoFocus?: boolean;
  theme?: Theme;
  maxLength?: number;
  minLength?: number;
  showCharCount?: boolean;
  charCountLabel?: string;
  quotaData?: React.ReactNode;
  required?: boolean;
}

export default function Input({
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
  pixelated = true,
  rows = 4,
  onKeyDown,
  autoFocus,
  theme = 'obsidian-veil',
  maxLength,
  minLength,
  showCharCount = false,
  charCountLabel = 'characters',
  quotaData,
  required
}: InputProps) {
  // Get theme colors
  const themeConfig = themes[theme];
  const colors = themeConfig?.colors;
  
  // Create dynamic styles based on theme colors
  const getInputStyle = () => {
    if (!colors) return {};
    
    return {
      backgroundColor: colors.background,
      borderColor: colors.border,
      color: colors.text,
      '--placeholder-color': colors.text + '80' // 50% opacity
    };
  };

  const baseClasses = 'w-full p-3 border-2 transition-colors min-h-[44px] text-base focus:outline-none';
  const pixelatedClasses = pixelated ? 'pixelated' : 'rounded-lg';

  // Character count styling
  const getCharCountColor = () => {
    if (!maxLength) return colors?.text || '#ffffff';
    const percentage = (value.length / maxLength) * 100;
    if (percentage >= 90) return '#ef4444'; // red
    if (percentage >= 75) return '#f59e0b'; // yellow
    return colors?.text || '#ffffff';
  };

  if (type === 'textarea') {
    return (
      <div className="space-y-2">
        <div className="relative">
          <textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            rows={rows}
            autoFocus={autoFocus}
            maxLength={maxLength}
            minLength={minLength}
            required={required}
            style={getInputStyle()}
            className={cn(baseClasses, pixelatedClasses, className)}
          />
        </div>
        {showCharCount && (
          <div className="text-sm">
            <div className="flex justify-between items-center">
              <span className="font-pixel text-yellow-400">
                {minLength && value.length < minLength ? `Minimum ${minLength} ${charCountLabel}` : ''}
              </span>
              <span 
                className="font-pixel"
                style={{ color: getCharCountColor() }}
              >
                {value.length}{maxLength ? `/${maxLength}` : ''} {charCountLabel}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        maxLength={maxLength}
        minLength={minLength}
        required={required}
        style={getInputStyle()}
        className={cn(baseClasses, pixelatedClasses, className)}
      />
      {showCharCount && (
        <div className="text-sm">
          <div className="flex justify-between items-center">
            <span className="font-pixel text-yellow-400">
              {minLength && value.length < minLength ? `Minimum <span className="font-pixel">${minLength}</span> ${charCountLabel}` : ''}
            </span>
            <span 
              className="font-pixel"
              style={{ color: getCharCountColor() }}
            >
              <span className="font-pixel">{value.length}{maxLength ? `/${maxLength}` : ''}</span> {charCountLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
