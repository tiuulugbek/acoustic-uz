'use client';

import React from 'react';
import { acousticTheme, hearingTestTranslations } from '@/theme/hearing-test-theme';
import type { Locale } from '@/lib/locale';

interface TestStartPageNewProps {
  locale: Locale;
  ear: 'left' | 'right';
  onBack: () => void;
  onContinue: () => void;
}

const TestStartPageNew: React.FC<TestStartPageNewProps> = ({ ear, locale, onBack, onContinue }) => {
  const t = hearingTestTranslations[locale].testStart;
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: acousticTheme.colors.background.light,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header - Progress indicators */}
      <header style={{
        padding: acousticTheme.spacing(6),
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
      }}>
        {/* Progress steps - same pattern as welcome */}
      </header>
      
      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: acousticTheme.spacing(6),
      }}>
        <div style={{
          maxWidth: '900px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: acousticTheme.spacing(12),
          alignItems: 'center',
        }}>
          {/* Left Side - Title */}
          <div>
            <div style={{
              fontSize: acousticTheme.typography.fontSize.lg,
              color: acousticTheme.colors.text.secondary,
              marginBottom: acousticTheme.spacing(3),
            }}>
              {t.ready}
            </div>
            <h1 style={{
              fontSize: acousticTheme.typography.fontSize['5xl'],
              fontWeight: acousticTheme.typography.fontWeight.regular,
              color: acousticTheme.colors.text.primary,
              lineHeight: 1.2,
              marginBottom: 0,
            }}>
              {t.title} <span style={{
                color: acousticTheme.colors.error.main,
                fontWeight: acousticTheme.typography.fontWeight.bold,
              }}>{ear === 'left' ? t.leftEar : t.rightEar}</span> {t.titleSuffix}
            </h1>
          </div>
          
          {/* Right Side - Ear Illustration */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: acousticTheme.spacing(6),
          }}>
            {/* Soundwave Animation */}
            <div style={{
              position: 'relative',
              width: '120px',
              height: '80px',
            }}>
              {/* Animated bars - simulating sound */}
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${i * 18}px`,
                    bottom: '50%',
                    width: '4px',
                    height: `${20 + Math.random() * 40}px`,
                    backgroundColor: acousticTheme.colors.grey[800],
                    borderRadius: acousticTheme.borderRadius.sm,
                    animation: `pulse 1s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
            
            {/* Ear Icon */}
            <svg 
              width="140" 
              height="140" 
              viewBox="0 0 140 140"
              style={{
                transform: ear === 'left' ? 'scaleX(-1)' : 'none',
              }}
            >
              <path 
                d="M70 20 C 50 20, 30 40, 30 60 C 30 90, 45 110, 60 120 L 65 110 C 55 105, 45 90, 45 60 C 45 45, 55 35, 70 35 C 85 35, 95 45, 95 60 C 95 70, 90 80, 85 85 L 90 95 C 100 85, 110 75, 110 60 C 110 40, 90 20, 70 20"
                fill="none"
                stroke={acousticTheme.colors.error.main}
                strokeWidth="5"
                strokeLinecap="round"
              />
              <circle 
                cx="70" 
                cy="60" 
                r="15" 
                fill={acousticTheme.colors.error.main}
                opacity="0.3"
              />
            </svg>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer style={{
        padding: acousticTheme.spacing(6),
        display: 'flex',
        justifyContent: 'space-between',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
      }}>
        <button
          onClick={onBack}
          style={{
            backgroundColor: 'transparent',
            color: acousticTheme.colors.text.primary,
            fontSize: acousticTheme.typography.fontSize.base,
            fontWeight: acousticTheme.typography.fontWeight.medium,
            padding: `${acousticTheme.spacing(3)} ${acousticTheme.spacing(8)}`,
            border: `2px solid ${acousticTheme.colors.grey[400]}`,
            borderRadius: acousticTheme.borderRadius.full,
            cursor: 'pointer',
          }}
        >
          {t.backButton}
        </button>
        
        <button
          onClick={onContinue}
          style={{
            backgroundColor: acousticTheme.colors.error.main,
            color: 'white',
            fontSize: acousticTheme.typography.fontSize.base,
            fontWeight: acousticTheme.typography.fontWeight.medium,
            padding: `${acousticTheme.spacing(3)} ${acousticTheme.spacing(8)}`,
            border: 'none',
            borderRadius: acousticTheme.borderRadius.full,
            cursor: 'pointer',
            boxShadow: acousticTheme.shadows.md,
          }}
        >
          {t.continueButton}
        </button>
      </footer>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
        }
      `}</style>
    </div>
  );
};

export default TestStartPageNew;
