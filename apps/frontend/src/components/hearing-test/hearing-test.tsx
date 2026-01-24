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
import DigitsInNoiseTest from './digits-in-noise-test';
import TestResults from './test-results';
import ContactForm from './contact-form';
// New design components
import WelcomePageNew from './welcome-page-new';
import SetupPageNew from './setup-page-new';
import TestStartPageNew from './test-start-page-new';
import CalibrationPageNew from './calibration-page-new';
import ResultsPageNew from './results-page-new';

type TestStep = 'intro' | 'device' | 'volume' | 'ready-left' | 'left-ear' | 'ready-right' | 'right-ear' | 'results' | 'contact';
type TestMethod = 'frequency' | 'digits-in-noise';
type DesignVersion = 'old' | 'new';

const FREQUENCIES = [250, 500, 1000, 2000, 4000, 8000];

export default function HearingTest() {
  const [step, setStep] = useState<TestStep>('intro');
  const [locale, setLocale] = useState<Locale>('uz');
  const [designVersion, setDesignVersion] = useState<DesignVersion>('new'); // New design by default
  const [testMethod, setTestMethod] = useState<TestMethod>('digits-in-noise'); // New method by default
  const [deviceType, setDeviceType] = useState<'speaker' | 'headphone' | null>(null);
  const [volumeLevel, setVolumeLevel] = useState<number>(1);
  const [leftEarResults, setLeftEarResults] = useState<Record<string, number>>({});
  const [rightEarResults, setRightEarResults] = useState<Record<string, number>>({});
  // Digits-in-Noise results
  const [leftEarSINResults, setLeftEarSINResults] = useState<any>(null);
  const [rightEarSINResults, setRightEarSINResults] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Current frequency for calibration
  const [currentFrequency, setCurrentFrequency] = useState<number>(1000);
  const [currentFrequencyIndex, setCurrentFrequencyIndex] = useState<number>(0);

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
    setCurrentFrequencyIndex(0);
    setCurrentFrequency(FREQUENCIES[0]);
    setStep('ready-left');
  };

  const handleFrequencyComplete = (results: Record<string, number>, ear: 'left' | 'right') => {
    if (ear === 'left') {
      setLeftEarResults(results);
      setStep('ready-right');
    } else {
      setRightEarResults(results);
      handleRightEarComplete(results);
    }
  };

  const handleCalibrationContinue = (ear: 'left' | 'right') => {
    // Save current frequency result
    const currentResults = ear === 'left' ? leftEarResults : rightEarResults;
    const newResults = {
      ...currentResults,
      [currentFrequency.toString()]: volumeLevel,
    };
    
    if (ear === 'left') {
      setLeftEarResults(newResults);
    } else {
      setRightEarResults(newResults);
    }
    
    if (currentFrequencyIndex < FREQUENCIES.length - 1) {
      // Move to next frequency
      const nextIndex = currentFrequencyIndex + 1;
      setCurrentFrequencyIndex(nextIndex);
      setCurrentFrequency(FREQUENCIES[nextIndex]);
      setVolumeLevel(0); // Reset volume for next frequency
      // Stay on calibration page for next frequency
    } else {
      // All frequencies done, move to next step
      if (ear === 'left') {
        setStep('ready-right');
        setCurrentFrequencyIndex(0);
        setCurrentFrequency(FREQUENCIES[0]);
        setVolumeLevel(0);
      } else {
        // Right ear complete
        handleRightEarComplete(newResults);
      }
    }
  };

  const handleLeftEarComplete = (results: Record<string, number>) => {
    const newResults = {
      ...leftEarResults,
      ...results,
    };
    setLeftEarResults(newResults);
    setStep('ready-right');
  };

  const handleLeftEarSINComplete = (results: {
    srt50: number;
    reversals: number[];
    trialCount: number;
    responses: Array<{
      trial: number;
      presented: string[];
      response: string[];
      correct: boolean;
      snr: number;
    }>;
  }) => {
    setLeftEarSINResults(results);
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

  const handleRightEarSINComplete = async (results: {
    srt50: number;
    reversals: number[];
    trialCount: number;
    responses: Array<{
      trial: number;
      presented: string[];
      response: string[];
      correct: boolean;
      snr: number;
    }>;
  }) => {
    setRightEarSINResults(results);
    
    // Calculate SRT-50 scores
    const leftSRT = leftEarSINResults?.srt50 || 0;
    const rightSRT = results.srt50 || 0;
    const overallSRT = (leftSRT + rightSRT) / 2;
    
    // Convert SRT to score (lower SRT = better hearing)
    // SRT range: -10 to 15 dB, normalize to 0-100
    const normalizeSRT = (srt: number) => {
      const minSRT = -10;
      const maxSRT = 15;
      const normalized = ((srt - minSRT) / (maxSRT - minSRT)) * 100;
      return Math.max(0, Math.min(100, 100 - normalized)); // Invert: lower SRT = higher score
    };
    
    const leftScore = Math.round(normalizeSRT(leftSRT));
    const rightScore = Math.round(normalizeSRT(rightSRT));
    const overallScore = Math.round((leftScore + rightScore) / 2);
    
    const getLevel = (score: number) => {
      if (score >= 90) return 'normal';
      if (score >= 70) return 'mild';
      if (score >= 50) return 'moderate';
      if (score >= 30) return 'severe';
      return 'profound';
    };
    
    const localResult = {
      leftEarScore: leftScore,
      rightEarScore: rightScore,
      overallScore,
      leftEarLevel: getLevel(leftScore),
      rightEarLevel: getLevel(rightScore),
      leftEarSRT: leftSRT,
      rightEarSRT: rightSRT,
      overallSRT,
      testMethod: 'digits-in-noise',
      leftEarResults: leftEarSINResults,
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
          leftEarResults: leftEarSINResults as any,
          rightEarResults: results as any,
          testMethod: 'digits-in-noise',
        },
        locale
      );
      setTestResult({ ...localResult, ...result });
    } catch (error) {
      console.error('Failed to submit test:', error);
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
          designVersion === 'new' ? (
            <WelcomePageNew
              locale={locale}
              onContinue={() => setStep('device')}
            />
          ) : (
            <TestIntro
              locale={locale}
              onContinue={() => setStep('device')}
            />
          )
        )}

        {step === 'device' && (
          designVersion === 'new' ? (
            <SetupPageNew
              locale={locale}
              onBack={handleBack}
              onContinue={() => setStep('volume')}
              playTone={() => playTone({ frequency: 1000, volume: 0.5, duration: 2000 })}
              stopTone={stopTone}
              isPlaying={isPlaying}
            />
          ) : (
            <DeviceSelection
              locale={locale}
              onSelect={handleDeviceSelect}
              onBack={handleBack}
            />
          )
        )}

        {step === 'volume' && (
          designVersion === 'new' ? (
            <CalibrationPageNew
              locale={locale}
              ear="left"
              frequency={currentFrequency}
              onBack={handleBack}
              onContinue={() => {
                setCurrentFrequencyIndex(0);
                setCurrentFrequency(FREQUENCIES[0]);
                setStep('ready-left');
              }}
              playTone={playTone}
              stopTone={stopTone}
              updateVolume={updateVolume}
              isPlaying={isPlaying}
            />
          ) : (
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
          )
        )}

        {step === 'ready-left' && (
          designVersion === 'new' ? (
            <TestStartPageNew
              locale={locale}
              ear="left"
              onBack={handleBack}
              onContinue={() => setStep('left-ear')}
            />
          ) : (
            <TestReady
              locale={locale}
              ear="left"
              onContinue={() => setStep('left-ear')}
              onBack={handleBack}
            />
          )
        )}

        {step === 'left-ear' && (
          designVersion === 'new' ? (
            <CalibrationPageNew
              locale={locale}
              ear="left"
              frequency={currentFrequency}
              onBack={() => {
                if (currentFrequencyIndex > 0) {
                  const prevIndex = currentFrequencyIndex - 1;
                  setCurrentFrequencyIndex(prevIndex);
                  setCurrentFrequency(FREQUENCIES[prevIndex]);
                } else {
                  handleBack();
                }
              }}
              onContinue={() => handleCalibrationContinue('left')}
              playTone={playTone}
              stopTone={stopTone}
              updateVolume={updateVolume}
              isPlaying={isPlaying}
            />
          ) : testMethod === 'digits-in-noise' ? (
            <DigitsInNoiseTest
              locale={locale}
              ear="left"
              onComplete={handleLeftEarSINComplete}
              onBack={handleBack}
            />
          ) : (
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
          )
        )}

        {step === 'ready-right' && (
          designVersion === 'new' ? (
            <TestStartPageNew
              locale={locale}
              ear="right"
              onBack={handleBack}
              onContinue={() => setStep('right-ear')}
            />
          ) : (
            <TestReady
              locale={locale}
              ear="right"
              onContinue={() => setStep('right-ear')}
              onBack={handleBack}
            />
          )
        )}

        {step === 'right-ear' && (
          designVersion === 'new' ? (
            <CalibrationPageNew
              locale={locale}
              ear="right"
              frequency={currentFrequency}
              onBack={() => {
                if (currentFrequencyIndex > 0) {
                  const prevIndex = currentFrequencyIndex - 1;
                  setCurrentFrequencyIndex(prevIndex);
                  setCurrentFrequency(FREQUENCIES[prevIndex]);
                } else {
                  handleBack();
                }
              }}
              onContinue={() => handleCalibrationContinue('right')}
              playTone={playTone}
              stopTone={stopTone}
              updateVolume={updateVolume}
              isPlaying={isPlaying}
            />
          ) : testMethod === 'digits-in-noise' ? (
            <DigitsInNoiseTest
              locale={locale}
              ear="right"
              onComplete={handleRightEarSINComplete}
              onBack={handleBack}
            />
          ) : (
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
          )
        )}

        {step === 'results' && (
          designVersion === 'new' ? (
            <ResultsPageNew
              locale={locale}
              leftEarResult={testResult?.leftEarLevel || 'normal'}
              rightEarResult={testResult?.rightEarLevel || 'normal'}
              leftEarScore={testResult?.leftEarScore || 0}
              rightEarScore={testResult?.rightEarScore || 0}
              overallScore={testResult?.overallScore || 0}
              onRestart={handleRestart}
            />
          ) : (
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
          )
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

