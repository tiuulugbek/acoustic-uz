'use client';

import { useState, useEffect } from 'react';
import { useAudioTest } from '@/hooks/useAudioTest';
import { submitHearingTest } from '@/lib/api';
import { getLocaleFromDOM } from '@/lib/locale-client';
import type { Locale } from '@/lib/locale';
import TestIntro from './test-intro';
import DeviceSelection from './device-selection';
import VolumeCalibration from './volume-calibration';
import TestReady from './test-ready';
import FrequencyTest from './frequency-test';
import TestResults from './test-results';
import ContactForm from './contact-form';

type TestStep = 'intro' | 'device' | 'volume' | 'ready-left' | 'left-ear' | 'ready-right' | 'right-ear' | 'results' | 'contact';

const FREQUENCIES = [250, 500, 1000, 2000, 4000, 8000];

export default function HearingTest() {
  const [step, setStep] = useState<TestStep>('intro');
  const [locale, setLocale] = useState<Locale>('uz');
  const [deviceType, setDeviceType] = useState<'speaker' | 'headphone' | null>(null);
  const [volumeLevel, setVolumeLevel] = useState<number>(1);
  const [leftEarResults, setLeftEarResults] = useState<Record<string, number>>({});
  const [rightEarResults, setRightEarResults] = useState<Record<string, number>>({});
  const [testResult, setTestResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { playTone, stopTone, cleanup, updateVolume, isPlaying } = useAudioTest();

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
    // Volume calibration'da foydalanuvchi qurilma ovozini sozlaydi
    // Test ovozini doim maksimal balandlikda ijro etamiz
    setVolumeLevel(1.0); // Maksimal volume
    setStep('ready-left');
  };

  const handleLeftEarComplete = (results: Record<string, number>) => {
    setLeftEarResults(results);
    setStep('ready-right');
  };

  const calculateResults = (leftResults: Record<string, number>, rightResults: Record<string, number>) => {
    const frequencies = ['250', '500', '1000', '2000', '4000', '8000'];
    const calculateScore = (results: Record<string, number>) => {
      if (frequencies.length === 0) return 0;
      let totalScore = 0;
      for (const freq of frequencies) {
        const volume = results[freq];
        if (volume === undefined || volume === null) continue;
        // Lower volume needed = better hearing
        // Score is inverse of volume needed to barely hear
        totalScore += (1 - volume) * (100 / frequencies.length);
      }
      return Math.round(totalScore);
    };
    
    const leftScore = calculateScore(leftResults);
    const rightScore = calculateScore(rightResults);
    const overallScore = Math.round((leftScore + rightScore) / 2);
    
    const getLevel = (score: number) => {
      if (score >= 90) return 'normal';
      if (score >= 70) return 'mild';
      if (score >= 50) return 'moderate';
      if (score >= 30) return 'severe';
      return 'profound';
    };
    
    return {
      leftEarScore: leftScore,
      rightEarScore: rightScore,
      overallScore,
      leftEarLevel: getLevel(leftScore),
      rightEarLevel: getLevel(rightScore),
    };
  };

  const handleRightEarComplete = async (results: Record<string, number>) => {
    setRightEarResults(results);
    
    // Calculate results locally first
    const calculatedResults = calculateResults(leftEarResults, results);
    const localResult = {
      ...calculatedResults,
      leftEarResults,
      rightEarResults: results,
      deviceType: deviceType!,
      volumeLevel,
    };
    setTestResult(localResult);
    setStep('results');
    
    // Submit test results in background
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
      // Update with server response if successful
      setTestResult({ ...localResult, ...result });
    } catch (error) {
      console.error('Failed to submit test:', error);
      // Keep local results even if submission fails
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
    } else if (step === 'ready-left') {
      setStep('volume');
    } else if (step === 'left-ear') {
      setStep('ready-left');
    } else if (step === 'ready-right') {
      setStep('left-ear');
    } else if (step === 'right-ear') {
      setStep('ready-right');
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

        {step === 'ready-left' && (
          <TestReady
            locale={locale}
            ear="left"
            onContinue={() => setStep('left-ear')}
            onBack={handleBack}
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
            updateVolume={updateVolume}
            isPlaying={isPlaying}
            volume={volumeLevel}
          />
        )}

        {step === 'ready-right' && (
          <TestReady
            locale={locale}
            ear="right"
            onContinue={() => setStep('right-ear')}
            onBack={handleBack}
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
            updateVolume={updateVolume}
            isPlaying={isPlaying}
            volume={volumeLevel}
            isSubmitting={isSubmitting}
          />
        )}

        {step === 'results' && (
          <TestResults
            locale={locale}
            result={testResult || {
              leftEarScore: 0,
              rightEarScore: 0,
              overallScore: 0,
              leftEarLevel: 'normal',
              rightEarLevel: 'normal',
            }}
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

