'use client';

import React from 'react';
import { acousticTheme, hearingTestTranslations } from '@/theme/hearing-test-theme';
import type { Locale } from '@/lib/locale';

interface WelcomePageNewProps {
  locale: Locale;
  onContinue: () => void;
}

const WelcomePageNew: React.FC<WelcomePageNewProps> = ({ locale, onContinue }) => {
  const t = hearingTestTranslations[locale].welcome;
  
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
      }}>
        {/* Progress Steps */}
        <div style={{ display: 'flex', gap: acousticTheme.spacing(3), alignItems: 'center' }}>
          {/* Step 1 - Active */}
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
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
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
          
          {/* Connector Line */}
          <div style={{
            height: '2px',
            width: '60px',
            backgroundColor: acousticTheme.colors.grey[300],
          }} />
          
          {/* Step 2 - Inactive */}
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
            <div style={{
              fontSize: acousticTheme.typography.fontSize.sm,
              color: acousticTheme.colors.text.secondary,
            }}>
              {locale === 'ru' ? 'Левое ухо' : 'Chap quloq'}
            </div>
          </div>
          
          {/* Connector Line */}
          <div style={{
            height: '2px',
            width: '60px',
            backgroundColor: acousticTheme.colors.grey[300],
          }} />
          
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
            <div style={{
              fontSize: acousticTheme.typography.fontSize.sm,
              color: acousticTheme.colors.text.secondary,
            }}>
              {locale === 'ru' ? 'Правое ухо' : 'O\'ng quloq'}
            </div>
          </div>
          
          {/* Connector Line */}
          <div style={{
            height: '2px',
            width: '60px',
            backgroundColor: acousticTheme.colors.grey[300],
          }} />
          
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
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div style={{
              fontSize: acousticTheme.typography.fontSize.sm,
              color: acousticTheme.colors.text.secondary,
            }}>
              {locale === 'ru' ? 'Результаты' : 'Natijalar'}
            </div>
          </div>
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
          maxWidth: '600px',
          textAlign: 'center',
        }}>
          {/* Title */}
          <h1 style={{
            fontSize: acousticTheme.typography.fontSize['4xl'],
            fontWeight: acousticTheme.typography.fontWeight.regular,
            color: acousticTheme.colors.text.primary,
            marginBottom: acousticTheme.spacing(6),
            lineHeight: 1.3,
          }}>
            {t.title} <span style={{
              color: acousticTheme.colors.error.main,
              fontWeight: acousticTheme.typography.fontWeight.bold,
            }}>{t.titleHighlight}</span>
          </h1>
          
          {/* Disclaimer */}
          <p style={{
            fontSize: acousticTheme.typography.fontSize.base,
            color: acousticTheme.colors.text.secondary,
            marginBottom: acousticTheme.spacing(6),
            lineHeight: 1.6,
          }}>
            {t.disclaimer}
          </p>
          
          {/* Consent Box */}
          <div style={{
            backgroundColor: acousticTheme.colors.background.default,
            padding: acousticTheme.spacing(6),
            borderRadius: acousticTheme.borderRadius.lg,
            boxShadow: acousticTheme.shadows.md,
            marginBottom: acousticTheme.spacing(8),
            textAlign: 'left',
          }}>
            <p style={{
              fontSize: acousticTheme.typography.fontSize.sm,
              color: acousticTheme.colors.text.secondary,
              lineHeight: 1.6,
              marginBottom: acousticTheme.spacing(2),
            }}>
              {t.consentText.split('roziligingizni')[0]}
              <strong style={{ color: acousticTheme.colors.text.primary }}>
                {locale === 'ru' ? ' вашего согласия' : ' roziligingizni'}
              </strong>
              {t.consentText.split('roziligingizni')[1] || ''}
              {' '}
              <a 
                href="#" 
                style={{
                  color: acousticTheme.colors.primary.main,
                  textDecoration: 'underline',
                  fontWeight: acousticTheme.typography.fontWeight.medium,
                }}
              >
                {t.privacyLink}
              </a>
            </p>
          </div>
        </div>
      </main>
      
      {/* Footer with Button */}
      <footer style={{
        padding: acousticTheme.spacing(6),
        display: 'flex',
        justifyContent: 'flex-end',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
      }}>
        <button
          onClick={onContinue}
          style={{
            backgroundColor: acousticTheme.colors.error.main,
            color: acousticTheme.colors.primary.contrast,
            fontSize: acousticTheme.typography.fontSize.base,
            fontWeight: acousticTheme.typography.fontWeight.medium,
            padding: `${acousticTheme.spacing(3)} ${acousticTheme.spacing(8)}`,
            border: 'none',
            borderRadius: acousticTheme.borderRadius.full,
            cursor: 'pointer',
            boxShadow: acousticTheme.shadows.md,
            transition: `all ${acousticTheme.transitions.base}`,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = acousticTheme.colors.error.dark;
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = acousticTheme.shadows.lg;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = acousticTheme.colors.error.main;
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = acousticTheme.shadows.md;
          }}
        >
          {t.continueButton}
        </button>
      </footer>
    </div>
  );
};

export default WelcomePageNew;
