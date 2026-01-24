'use client';

import React, { useState } from 'react';
import { acousticTheme, hearingTestTranslations } from '@/theme/hearing-test-theme';
import type { Locale } from '@/lib/locale';

interface SetupPageNewProps {
  locale: Locale;
  onBack: () => void;
  onContinue: () => void;
  playTone?: () => void;
  stopTone?: () => void;
  isPlaying?: boolean;
}

const SetupPageNew: React.FC<SetupPageNewProps> = ({ 
  locale, 
  onBack, 
  onContinue,
  playTone,
  stopTone,
  isPlaying = false,
}) => {
  const t = hearingTestTranslations[locale].setup;
  
  const handlePlaySong = () => {
    if (playTone) {
      playTone();
    }
  };
  
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
        <div style={{ display: 'flex', gap: acousticTheme.spacing(3), alignItems: 'center' }}>
          {/* Step 1 - Complete */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: acousticTheme.borderRadius.full,
              backgroundColor: acousticTheme.colors.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: acousticTheme.spacing(2),
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div style={{
              fontSize: acousticTheme.typography.fontSize.sm,
              color: acousticTheme.colors.text.primary,
              fontWeight: acousticTheme.typography.fontWeight.medium,
            }}>
              {locale === 'ru' ? 'Вход' : 'Kirish'}
            </div>
          </div>
          
          <div style={{ height: '2px', width: '60px', backgroundColor: acousticTheme.colors.grey[300] }} />
          
          {/* Step 2 - Active */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: acousticTheme.borderRadius.full,
              backgroundColor: acousticTheme.colors.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: acousticTheme.spacing(2),
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <div style={{ fontSize: acousticTheme.typography.fontSize.sm, color: acousticTheme.colors.text.primary, fontWeight: acousticTheme.typography.fontWeight.medium }}>
              {locale === 'ru' ? 'Настройка' : 'Sozlash'}
            </div>
          </div>
          
          <div style={{ height: '2px', width: '60px', backgroundColor: acousticTheme.colors.grey[300] }} />
          
          {/* Step 3 - Inactive */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: acousticTheme.borderRadius.full,
              backgroundColor: acousticTheme.colors.grey[200],
              border: `2px solid ${acousticTheme.colors.grey[300]}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: acousticTheme.spacing(2),
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={acousticTheme.colors.grey[500]} strokeWidth="2">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <div style={{ fontSize: acousticTheme.typography.fontSize.sm, color: acousticTheme.colors.text.secondary }}>
              {locale === 'ru' ? 'Левое ухо' : 'Chap quloq'}
            </div>
          </div>
          
          <div style={{ height: '2px', width: '60px', backgroundColor: acousticTheme.colors.grey[300] }} />
          
          {/* Step 4 - Inactive */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: acousticTheme.borderRadius.full,
              backgroundColor: acousticTheme.colors.grey[200],
              border: `2px solid ${acousticTheme.colors.grey[300]}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: acousticTheme.spacing(2),
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={acousticTheme.colors.grey[500]} strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div style={{ fontSize: acousticTheme.typography.fontSize.sm, color: acousticTheme.colors.text.secondary }}>
              {locale === 'ru' ? 'Результаты' : 'Natijalar'}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        padding: acousticTheme.spacing(6),
      }}>
        <div style={{
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: acousticTheme.spacing(12),
          alignItems: 'center',
        }}>
          {/* Left Side - Title */}
          <div>
            <h1 style={{
              fontSize: acousticTheme.typography.fontSize['5xl'],
              fontWeight: acousticTheme.typography.fontWeight.regular,
              color: acousticTheme.colors.text.primary,
              lineHeight: 1.2,
            }}>
              {t.title} <span style={{
                color: acousticTheme.colors.error.main,
                fontWeight: acousticTheme.typography.fontWeight.bold,
                display: 'block',
              }}>{t.titleHighlight}</span>
            </h1>
          </div>
          
          {/* Right Side - Steps */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: acousticTheme.spacing(6),
          }}>
            {/* Step 1 */}
            <div style={{ display: 'flex', gap: acousticTheme.spacing(4), alignItems: 'flex-start' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: acousticTheme.borderRadius.full,
                backgroundColor: acousticTheme.colors.error.main,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: acousticTheme.typography.fontSize['2xl'],
                fontWeight: acousticTheme.typography.fontWeight.bold,
                flexShrink: 0,
              }}>
                {t.step1.number}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: acousticTheme.spacing(4), flex: 1 }}>
                <div>
                  <div style={{
                    fontSize: acousticTheme.typography.fontSize.lg,
                    fontWeight: acousticTheme.typography.fontWeight.semibold,
                    color: acousticTheme.colors.text.primary,
                    marginBottom: acousticTheme.spacing(1),
                  }}>
                    {t.step1.title}
                  </div>
                  <div style={{
                    fontSize: acousticTheme.typography.fontSize.sm,
                    color: acousticTheme.colors.text.secondary,
                  }}>
                    {t.step1.subtitle}
                  </div>
                </div>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={acousticTheme.colors.text.secondary} strokeWidth="1.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </div>
            </div>
            
            {/* Step 2 */}
            <div style={{ display: 'flex', gap: acousticTheme.spacing(4), alignItems: 'flex-start' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: acousticTheme.borderRadius.full,
                backgroundColor: acousticTheme.colors.error.main,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: acousticTheme.typography.fontSize['2xl'],
                fontWeight: acousticTheme.typography.fontWeight.bold,
                flexShrink: 0,
              }}>
                {t.step2.number}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: acousticTheme.spacing(4), flex: 1 }}>
                <div>
                  <div style={{
                    fontSize: acousticTheme.typography.fontSize.lg,
                    fontWeight: acousticTheme.typography.fontWeight.semibold,
                    color: acousticTheme.colors.text.primary,
                    marginBottom: acousticTheme.spacing(1),
                  }}>
                    {t.step2.title}
                  </div>
                  <div style={{
                    fontSize: acousticTheme.typography.fontSize.sm,
                    color: acousticTheme.colors.text.secondary,
                  }}>
                    {t.step2.subtitle}
                  </div>
                </div>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={acousticTheme.colors.text.secondary} strokeWidth="1.5">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              </div>
            </div>
            
            {/* Step 3 */}
            <div style={{ display: 'flex', gap: acousticTheme.spacing(4), alignItems: 'flex-start' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: acousticTheme.borderRadius.full,
                backgroundColor: acousticTheme.colors.error.main,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: acousticTheme.typography.fontSize['2xl'],
                fontWeight: acousticTheme.typography.fontWeight.bold,
                flexShrink: 0,
              }}>
                {t.step3.number}
              </div>
              <div style={{ flex: 1 }}>
                <div>
                  <div style={{
                    fontSize: acousticTheme.typography.fontSize.lg,
                    fontWeight: acousticTheme.typography.fontWeight.semibold,
                    color: acousticTheme.colors.text.primary,
                    marginBottom: acousticTheme.spacing(1),
                  }}>
                    {t.step3.title}
                  </div>
                  <div style={{
                    fontSize: acousticTheme.typography.fontSize.sm,
                    color: acousticTheme.colors.text.secondary,
                    marginBottom: acousticTheme.spacing(3),
                  }}>
                    {t.step3.subtitle}
                  </div>
                  <button
                    onClick={handlePlaySong}
                    disabled={isPlaying}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: acousticTheme.spacing(2),
                      backgroundColor: 'transparent',
                      color: acousticTheme.colors.primary.main,
                      fontSize: acousticTheme.typography.fontSize.base,
                      fontWeight: acousticTheme.typography.fontWeight.medium,
                      padding: `${acousticTheme.spacing(2)} ${acousticTheme.spacing(4)}`,
                      border: `2px solid ${acousticTheme.colors.primary.main}`,
                      borderRadius: acousticTheme.borderRadius.full,
                      cursor: isPlaying ? 'not-allowed' : 'pointer',
                      opacity: isPlaying ? 0.6 : 1,
                      transition: `all ${acousticTheme.transitions.base}`,
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    {t.step3.playButton}
                  </button>
                </div>
              </div>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={acousticTheme.colors.text.secondary} strokeWidth="1.5">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer with Buttons */}
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
            transition: `all ${acousticTheme.transitions.base}`,
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
            transition: `all ${acousticTheme.transitions.base}`,
          }}
        >
          {t.continueButton}
        </button>
      </footer>
    </div>
  );
};

export default SetupPageNew;
