'use client';

import { useState, useEffect } from 'react';
import { useAudioTest } from '@/hooks/useAudioTest';
import { submitHearingTest } from '@/lib/api';
import { getLocaleFromDOM } from '@/lib/locale-client';
import type { Locale } from '@/lib/locale';
import TestIntro from './test-intro';
import DeviceSelection from './device-selection';
import VolumeCalibration from './volume-calibration';
import FrequencyTest from './frequency-test';
import TestResults from './test-results';
import ContactForm from './contact-form';

type TestStep = 'intro' | 'device' | 'volume' | 'left-ear' | 'right-ear' | 'results' | 'contact';

const FREQUENCIES = [250, 500, 1000, 2000, 4000, 8000];

export default function HearingTest() {
  const [step, setStep] = useState<TestStep>('intro');
  const [locale, setLocale] = useState<Locale>('uz');
  const [deviceType, setDeviceType] = useState<'speaker' | 'headphone' | null>(null);
  const [volumeLevel, setVolumeLevel] = useState<number>(1);
  const [leftEarResults, setLeftEarResults] = useState<Record<string, boolean>>({});
  const [rightEarResults, setRightEarResults] = useState<Record<string, boolean>>({});
  const [testResult, setTestResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { playTone, stopTone, cleanup, isPlaying } = useAudioTest();

  useEffect(() => {
    setLocale(getLocaleFromDOM());
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleDeviceSelect = (device: 'speaker' | 'headphone') => {
    setDeviceType(device);
    setStep('volume');
  };

  const handleVolumeSet = (volume: number) => {
    setVolumeLevel(volume);
    setStep('left-ear');
  };

  const handleLeftEarComplete = (results: Record<string, boolean>) => {
    setLeftEarResults(results);
    setStep('right-ear');
  };

  const handleRightEarComplete = async (results: Record<string, boolean>) => {
    setRightEarResults(results);
    
    // Submit test results
    setIsSubmitting(true);
    try {
      const result = await submitHearingTest(
        {
          deviceType: deviceType!,
          volumeLevel,
          leftEarResults,
          rightEarResults: results,
        },
        locale
      );
      setTestResult(result);
      setStep('results');
    } catch (error) {
      console.error('Failed to submit test:', error);
      // Still show results even if submission fails
      setStep('results');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactSubmit = async (contactData: { name?: string; phone?: string; email?: string }) => {
    if (!testResult) return;

    setIsSubmitting(true);
    try {
      await submitHearingTest(
        {
          ...contactData,
          deviceType: deviceType!,
          volumeLevel,
          leftEarResults,
          rightEarResults,
        },
        locale
      );
      setStep('results');
    } catch (error) {
      console.error('Failed to submit contact info:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 'device') {
      setStep('intro');
    } else if (step === 'volume') {
      setStep('device');
    } else if (step === 'left-ear') {
      setStep('volume');
    } else if (step === 'right-ear') {
      setStep('left-ear');
    } else if (step === 'results') {
      setStep('right-ear');
    } else if (step === 'contact') {
      setStep('results');
    }
  };

  const handleRestart = () => {
    setStep('intro');
    setDeviceType(null);
    setVolumeLevel(1);
    setLeftEarResults({});
    setRightEarResults({});
    setTestResult(null);
    stopTone();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Indicator */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex flex-col items-center ${step === 'left-ear' || step === 'right-ear' ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                step === 'left-ear' ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-300'
              }`}>
                {step === 'left-ear' ? (
                  <span className="text-brand-primary font-bold">L</span>
                ) : (
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <span className="text-xs mt-1 text-gray-600">{locale === 'ru' ? 'Левое ухо' : 'Chap quloq'}</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200"></div>
            <div className={`flex flex-col items-center ${step === 'right-ear' ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                step === 'right-ear' ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-300'
              }`}>
                {step === 'right-ear' ? (
                  <span className="text-brand-primary font-bold">R</span>
                ) : (
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <span className="text-xs mt-1 text-gray-600">{locale === 'ru' ? 'Правое ухо' : 'O\'ng quloq'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {step === 'intro' && (
          <TestIntro
            locale={locale}
            onContinue={() => setStep('device')}
          />
        )}

        {step === 'device' && (
          <DeviceSelection
            locale={locale}
            onSelect={handleDeviceSelect}
            onBack={handleBack}
          />
        )}

        {step === 'volume' && (
          <VolumeCalibration
            locale={locale}
            volume={volumeLevel}
            onVolumeChange={setVolumeLevel}
            onContinue={handleVolumeSet}
            onBack={handleBack}
            playTone={playTone}
            stopTone={stopTone}
            isPlaying={isPlaying}
          />
        )}

        {step === 'left-ear' && (
          <FrequencyTest
            locale={locale}
            ear="left"
            frequencies={FREQUENCIES}
            onComplete={handleLeftEarComplete}
            onBack={handleBack}
            playTone={playTone}
            stopTone={stopTone}
            isPlaying={isPlaying}
            volume={volumeLevel}
          />
        )}

        {step === 'right-ear' && (
          <FrequencyTest
            locale={locale}
            ear="right"
            frequencies={FREQUENCIES}
            onComplete={handleRightEarComplete}
            onBack={handleBack}
            playTone={playTone}
            stopTone={stopTone}
            isPlaying={isPlaying}
            volume={volumeLevel}
            isSubmitting={isSubmitting}
          />
        )}

        {step === 'results' && testResult && (
          <TestResults
            locale={locale}
            result={testResult}
            onContact={() => setStep('contact')}
            onRestart={handleRestart}
          />
        )}

        {step === 'contact' && testResult && (
          <ContactForm
            locale={locale}
            onSubmit={handleContactSubmit}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}

