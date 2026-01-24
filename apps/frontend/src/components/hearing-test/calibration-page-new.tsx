'use client';

import React, { useState } from 'react';
import { acousticTheme, hearingTestTranslations } from '@/theme/hearing-test-theme';
import type { Locale } from '@/lib/locale';

interface CalibrationPageNewProps {
  locale: Locale;
  ear: 'left' | 'right';
  frequency: number;
  onBack: () => void;
  onContinue: () => void;
  playTone?: (options: { frequency: number; volume: number }) => void;
  stopTone?: () => void;
  updateVolume?: (volume: number) => void;
  isPlaying?: boolean;
}

const CalibrationPageNew: React.FC<CalibrationPageNewProps> = ({
  ear,
  frequency,
  locale,
  onBack,
  onContinue,
  playTone,
  stopTone,
  updateVolume,
  isPlaying = false,
}) => {
  const t = hearingTestTranslations[locale].calibration;
  const [volume, setVolume] = useState(1);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const handleVolumeChange = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    
    if (updateVolume) {
      updateVolume(clampedVolume);
    }
    
    // Auto-play when volume changes (ReSound style)
    if (clampedVolume > 0 && playTone) {
      playTone({ frequency, volume: clampedVolume });
    } else if (stopTone) {
      stopTone();
    }
  };

  // Auto-continue after 2 seconds if volume > 0 (ReSound style)
  React.useEffect(() => {
    if (volume > 0) {
      const timer = setTimeout(() => {
        onContinue();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [volume, onContinue]);
  
  // Play tone when frequency changes
  React.useEffect(() => {
    if (playTone && volume > 0) {
      playTone({ frequency, volume });
    }
    return () => {
      if (stopTone) stopTone();
    };
  }, [frequency]);
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: acousticTheme.colors.background.light,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header with Progress */}
      <header style={{
        padding: acousticTheme.spacing(6),
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
      }}>
        {/* Progress indicators */}
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
          maxWidth: '800px',
          width: '100%',
          textAlign: 'center',
        }}>
          {/* Title */}
          <h1 style={{
            fontSize: acousticTheme.typography.fontSize['4xl'],
            fontWeight: acousticTheme.typography.fontWeight.regular,
            color: acousticTheme.colors.text.primary,
            marginBottom: acousticTheme.spacing(2),
          }}>
            <span style={{ color: acousticTheme.colors.error.main, fontWeight: acousticTheme.typography.fontWeight.bold }}>
              {t.titleAction}
            </span>{' '}
            {t.title} <span style={{ color: acousticTheme.colors.error.main, fontWeight: acousticTheme.typography.fontWeight.bold }}>
              {t.titleButtons}
            </span>
          </h1>
          
          <p style={{
            fontSize: acousticTheme.typography.fontSize.base,
            color: acousticTheme.colors.text.secondary,
            marginBottom: acousticTheme.spacing(1),
          }}>
            {t.subtitle}
          </p>
          
          <p style={{
            fontSize: acousticTheme.typography.fontSize.sm,
            color: acousticTheme.colors.text.secondary,
            marginBottom: acousticTheme.spacing(12),
          }}>
            {t.instruction}
          </p>
          
          {/* Frequency Label */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: acousticTheme.spacing(2),
            marginBottom: acousticTheme.spacing(8),
          }}>
            <h2 style={{
              fontSize: acousticTheme.typography.fontSize.xl,
              fontWeight: acousticTheme.typography.fontWeight.semibold,
              color: acousticTheme.colors.text.primary,
              margin: 0,
            }}>
              {ear === 'left' ? (locale === 'ru' ? 'Левое ухо' : 'Chap quloq') : (locale === 'ru' ? 'Правое ухо' : 'O\'ng quloq')} - {frequency} {t.frequency}
            </h2>
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: acousticTheme.borderRadius.full,
                border: `2px solid ${acousticTheme.colors.grey[400]}`,
                backgroundColor: 'transparent',
                color: acousticTheme.colors.grey[600],
                cursor: 'help',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: acousticTheme.typography.fontSize.sm,
                fontWeight: acousticTheme.typography.fontWeight.bold,
                position: 'relative',
              }}
            >
              ?
              {showTooltip && (
                <div style={{
                  position: 'absolute',
                  top: '32px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'white',
                  padding: acousticTheme.spacing(3),
                  borderRadius: acousticTheme.borderRadius.md,
                  boxShadow: acousticTheme.shadows.lg,
                  width: '280px',
                  fontSize: acousticTheme.typography.fontSize.sm,
                  color: acousticTheme.colors.text.secondary,
                  textAlign: 'left',
                  zIndex: 10,
                }}>
                  {t.tooltip}
                </div>
              )}
            </button>
          </div>
          
          {/* Volume Slider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: acousticTheme.spacing(6),
            justifyContent: 'center',
            marginBottom: acousticTheme.spacing(8),
          }}>
            {/* Minus Button */}
            <button
              onClick={() => handleVolumeChange(volume - 0.05)}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: acousticTheme.borderRadius.full,
                backgroundColor: acousticTheme.colors.grey[900],
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: acousticTheme.typography.fontSize['2xl'],
                fontWeight: acousticTheme.typography.fontWeight.bold,
                transition: `all ${acousticTheme.transitions.base}`,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              −
            </button>
            
            {/* Slider */}
            <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
              {/* Volume Value */}
              <div style={{
                position: 'absolute',
                left: `${volume * 100}%`,
                top: '-40px',
                transform: 'translateX(-50%)',
                fontSize: acousticTheme.typography.fontSize.lg,
                fontWeight: acousticTheme.typography.fontWeight.semibold,
                color: acousticTheme.colors.text.primary,
              }}>
                {Math.round(volume * 100)}%
              </div>
              
              {/* Track */}
              <div style={{
                height: '8px',
                backgroundColor: acousticTheme.colors.grey[300],
                borderRadius: acousticTheme.borderRadius.full,
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Progress */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${volume * 100}%`,
                  backgroundColor: acousticTheme.colors.error.main,
                  transition: `width ${acousticTheme.transitions.fast}`,
                }} />
              </div>
              
              {/* Slider Input */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.005"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                style={{
                  position: 'absolute',
                  top: '-12px',
                  left: 0,
                  width: '100%',
                  height: '32px',
                  opacity: 0,
                  cursor: 'pointer',
                }}
              />
            </div>
            
            {/* Plus Button */}
            <button
              onClick={() => handleVolumeChange(volume + 0.05)}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: acousticTheme.borderRadius.full,
                backgroundColor: acousticTheme.colors.grey[900],
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: acousticTheme.typography.fontSize['2xl'],
                fontWeight: acousticTheme.typography.fontWeight.bold,
                transition: `all ${acousticTheme.transitions.base}`,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              +
            </button>
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
    </div>
  );
};

export default CalibrationPageNew;
