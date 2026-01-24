'use client';

import React from 'react';
import { acousticTheme, hearingTestTranslations } from '@/theme/hearing-test-theme';
import type { Locale } from '@/lib/locale';
import Link from 'next/link';

interface ResultsPageNewProps {
  locale: Locale;
  leftEarResult: 'normal' | 'mild' | 'moderate' | 'severe' | 'profound';
  rightEarResult: 'normal' | 'mild' | 'moderate' | 'severe' | 'profound';
  leftEarScore?: number;
  rightEarScore?: number;
  overallScore?: number;
  onRestart?: () => void;
}

const ResultsPageNew: React.FC<ResultsPageNewProps> = ({ 
  locale,
  leftEarResult, 
  rightEarResult,
  leftEarScore,
  rightEarScore,
  overallScore,
  onRestart,
}) => {
  const t = hearingTestTranslations[locale].results;
  const hasLoss = leftEarResult !== 'normal' || rightEarResult !== 'normal';
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: acousticTheme.colors.background.light,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header with completed progress */}
      <header style={{
        padding: acousticTheme.spacing(6),
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', gap: acousticTheme.spacing(3), alignItems: 'center' }}>
          {[1, 2, 3, 4].map((step) => (
            <React.Fragment key={step}>
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
              </div>
              {step < 4 && <div style={{ height: '2px', width: '60px', backgroundColor: acousticTheme.colors.primary.main }} />}
            </React.Fragment>
          ))}
        </div>
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
          textAlign: 'center',
        }}>
          {/* Title */}
          <h1 style={{
            fontSize: acousticTheme.typography.fontSize['4xl'],
            fontWeight: acousticTheme.typography.fontWeight.regular,
            color: acousticTheme.colors.text.primary,
            marginBottom: acousticTheme.spacing(4),
          }}>
            <span style={{
              color: hasLoss ? acousticTheme.colors.error.main : acousticTheme.colors.success.main,
              fontWeight: acousticTheme.typography.fontWeight.bold,
            }}>
              {hasLoss ? (locale === 'ru' ? 'Потеря слуха обнаружена' : 'Eshitish yo\'qotilishi aniqlandi') : t.noLoss.title}
            </span>{' '}
            {!hasLoss && t.noLoss.titleResult}
          </h1>
          
          {/* Subtitle */}
          <p style={{
            fontSize: acousticTheme.typography.fontSize.base,
            color: acousticTheme.colors.text.secondary,
            marginBottom: acousticTheme.spacing(12),
            maxWidth: '700px',
            margin: '0 auto',
            marginBottom: acousticTheme.spacing(12),
          }}>
            {hasLoss ? t.withLoss.subtitle : t.noLoss.subtitle}
          </p>
          
          {/* Overall Score */}
          {overallScore !== undefined && (
            <div style={{
              marginBottom: acousticTheme.spacing(12),
            }}>
              <div style={{
                fontSize: acousticTheme.typography.fontSize['5xl'],
                fontWeight: acousticTheme.typography.fontWeight.bold,
                color: acousticTheme.colors.primary.main,
              }}>
                {overallScore}%
              </div>
            </div>
          )}
          
          {/* Ear Results */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: acousticTheme.spacing(8),
            marginBottom: acousticTheme.spacing(12),
          }}>
            {/* Left Ear */}
            <div>
              <div style={{
                fontSize: acousticTheme.typography.fontSize.lg,
                fontWeight: acousticTheme.typography.fontWeight.medium,
                color: acousticTheme.colors.text.primary,
                marginBottom: acousticTheme.spacing(4),
              }}>
                {t.noLoss.leftEar}
              </div>
              
              {/* Gauge */}
              <div style={{
                position: 'relative',
                width: '200px',
                height: '100px',
                margin: '0 auto',
              }}>
                <svg viewBox="0 0 200 100" width="200" height="100">
                  {/* Background arc */}
                  <path
                    d="M 20 80 A 80 80 0 0 1 180 80"
                    fill="none"
                    stroke={acousticTheme.colors.grey[300]}
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  {/* Result indicator */}
                  <circle
                    cx={leftEarResult === 'normal' ? 30 : 170}
                    cy="80"
                    r="8"
                    fill={leftEarResult === 'normal' ? acousticTheme.colors.success.main : acousticTheme.colors.error.main}
                  />
                </svg>
              </div>
              
              {leftEarScore !== undefined && (
                <div style={{
                  fontSize: acousticTheme.typography.fontSize.xl,
                  fontWeight: acousticTheme.typography.fontWeight.semibold,
                  color: acousticTheme.colors.text.primary,
                  marginTop: acousticTheme.spacing(2),
                }}>
                  {leftEarScore}%
                </div>
              )}
              
              <div style={{
                fontSize: acousticTheme.typography.fontSize.lg,
                fontWeight: acousticTheme.typography.fontWeight.semibold,
                color: leftEarResult === 'normal' ? acousticTheme.colors.success.main : acousticTheme.colors.error.main,
                marginTop: acousticTheme.spacing(4),
              }}>
                {leftEarResult === 'normal' ? t.noLoss.noLossDetected : (locale === 'ru' ? 'Потеря обнаружена' : 'Yo\'qotilish aniqlandi')}
              </div>
            </div>
            
            {/* Right Ear */}
            <div>
              <div style={{
                fontSize: acousticTheme.typography.fontSize.lg,
                fontWeight: acousticTheme.typography.fontWeight.medium,
                color: acousticTheme.colors.text.primary,
                marginBottom: acousticTheme.spacing(4),
              }}>
                {t.noLoss.rightEar}
              </div>
              
              {/* Gauge */}
              <div style={{
                position: 'relative',
                width: '200px',
                height: '100px',
                margin: '0 auto',
              }}>
                <svg viewBox="0 0 200 100" width="200" height="100">
                  {/* Background arc */}
                  <path
                    d="M 20 80 A 80 80 0 0 1 180 80"
                    fill="none"
                    stroke={acousticTheme.colors.grey[300]}
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  {/* Result indicator */}
                  <circle
                    cx={rightEarResult === 'normal' ? 30 : 170}
                    cy="80"
                    r="8"
                    fill={rightEarResult === 'normal' ? acousticTheme.colors.success.main : acousticTheme.colors.error.main}
                  />
                </svg>
              </div>
              
              {rightEarScore !== undefined && (
                <div style={{
                  fontSize: acousticTheme.typography.fontSize.xl,
                  fontWeight: acousticTheme.typography.fontWeight.semibold,
                  color: acousticTheme.colors.text.primary,
                  marginTop: acousticTheme.spacing(2),
                }}>
                  {rightEarScore}%
                </div>
              )}
              
              <div style={{
                fontSize: acousticTheme.typography.fontSize.lg,
                fontWeight: acousticTheme.typography.fontWeight.semibold,
                color: rightEarResult === 'normal' ? acousticTheme.colors.success.main : acousticTheme.colors.error.main,
                marginTop: acousticTheme.spacing(4),
              }}>
                {rightEarResult === 'normal' ? t.noLoss.noLossDetected : (locale === 'ru' ? 'Потеря обнаружена' : 'Yo\'qotilish aniqlandi')}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer with Buttons */}
      <footer style={{
        padding: acousticTheme.spacing(6),
        display: 'flex',
        justifyContent: 'center',
        gap: acousticTheme.spacing(4),
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
      }}>
        <Link
          href="/branches"
          style={{
            backgroundColor: 'transparent',
            color: acousticTheme.colors.text.primary,
            fontSize: acousticTheme.typography.fontSize.base,
            fontWeight: acousticTheme.typography.fontWeight.medium,
            padding: `${acousticTheme.spacing(3)} ${acousticTheme.spacing(8)}`,
            border: `2px solid ${acousticTheme.colors.grey[400]}`,
            borderRadius: acousticTheme.borderRadius.full,
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          {t.noLoss.aboutButton}
        </Link>
        
        <Link
          href="/branches"
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
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          {t.noLoss.findProfessional}
        </Link>
        
        {onRestart && (
          <button
            onClick={onRestart}
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
            {locale === 'ru' ? 'Повторить тест' : 'Testni takrorlash'}
          </button>
        )}
      </footer>
    </div>
  );
};

export default ResultsPageNew;
