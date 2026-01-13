"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HearingTest;
const react_1 = require("react");
const useAudioTest_1 = require("@/hooks/useAudioTest");
const api_1 = require("@/lib/api");
const locale_client_1 = require("@/lib/locale-client");
const test_intro_1 = __importDefault(require("./test-intro"));
const device_selection_1 = __importDefault(require("./device-selection"));
const volume_calibration_1 = __importDefault(require("./volume-calibration"));
const test_ready_1 = __importDefault(require("./test-ready"));
const frequency_test_1 = __importDefault(require("./frequency-test"));
const test_results_1 = __importDefault(require("./test-results"));
const contact_form_1 = __importDefault(require("./contact-form"));
const FREQUENCIES = [250, 500, 1000, 2000, 4000, 8000];
function HearingTest() {
    const [step, setStep] = (0, react_1.useState)('intro');
    const [locale, setLocale] = (0, react_1.useState)('uz');
    const [deviceType, setDeviceType] = (0, react_1.useState)(null);
    const [volumeLevel, setVolumeLevel] = (0, react_1.useState)(1);
    const [leftEarResults, setLeftEarResults] = (0, react_1.useState)({});
    const [rightEarResults, setRightEarResults] = (0, react_1.useState)({});
    const [testResult, setTestResult] = (0, react_1.useState)(null);
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const { playTone, stopTone, cleanup, updateVolume, isPlaying } = (0, useAudioTest_1.useAudioTest)();
    (0, react_1.useEffect)(() => {
        setLocale((0, locale_client_1.getLocaleFromDOM)());
        return () => {
            cleanup();
        };
    }, [cleanup]);
    const handleDeviceSelect = (device) => {
        setDeviceType(device);
        setStep('volume');
    };
    const handleVolumeSet = (volume) => {
        // Volume calibration'da foydalanuvchi qurilma ovozini sozlaydi
        // Test ovozini doim maksimal balandlikda ijro etamiz
        setVolumeLevel(1.0); // Maksimal volume
        setStep('ready-left');
    };
    const handleLeftEarComplete = (results) => {
        setLeftEarResults(results);
        setStep('ready-right');
    };
    const calculateResults = (leftResults, rightResults) => {
        const frequencies = ['250', '500', '1000', '2000', '4000', '8000'];
        const calculateScore = (results) => {
            if (frequencies.length === 0)
                return 0;
            let totalScore = 0;
            for (const freq of frequencies) {
                const volume = results[freq];
                if (volume === undefined || volume === null)
                    continue;
                // Lower volume needed = better hearing
                // Score is inverse of volume needed to barely hear
                totalScore += (1 - volume) * (100 / frequencies.length);
            }
            return Math.round(totalScore);
        };
        const leftScore = calculateScore(leftResults);
        const rightScore = calculateScore(rightResults);
        const overallScore = Math.round((leftScore + rightScore) / 2);
        const getLevel = (score) => {
            if (score >= 90)
                return 'normal';
            if (score >= 70)
                return 'mild';
            if (score >= 50)
                return 'moderate';
            if (score >= 30)
                return 'severe';
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
    const handleRightEarComplete = async (results) => {
        setRightEarResults(results);
        // Calculate results locally first
        const calculatedResults = calculateResults(leftEarResults, results);
        const localResult = {
            ...calculatedResults,
            leftEarResults,
            rightEarResults: results,
            deviceType: deviceType,
            volumeLevel,
        };
        setTestResult(localResult);
        setStep('results');
        // Submit test results in background
        setIsSubmitting(true);
        try {
            const result = await (0, api_1.submitHearingTest)({
                deviceType: deviceType,
                volumeLevel,
                leftEarResults,
                rightEarResults: results,
            }, locale);
            // Update with server response if successful
            setTestResult({ ...localResult, ...result });
        }
        catch (error) {
            console.error('Failed to submit test:', error);
            // Keep local results even if submission fails
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleContactSubmit = async (contactData) => {
        if (!testResult)
            return;
        setIsSubmitting(true);
        try {
            await (0, api_1.submitHearingTest)({
                ...contactData,
                deviceType: deviceType,
                volumeLevel,
                leftEarResults,
                rightEarResults,
            }, locale);
            setStep('results');
        }
        catch (error) {
            console.error('Failed to submit contact info:', error);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleBack = () => {
        if (step === 'device') {
            setStep('intro');
        }
        else if (step === 'volume') {
            setStep('device');
        }
        else if (step === 'ready-left') {
            setStep('volume');
        }
        else if (step === 'left-ear') {
            setStep('ready-left');
        }
        else if (step === 'ready-right') {
            setStep('left-ear');
        }
        else if (step === 'right-ear') {
            setStep('ready-right');
        }
        else if (step === 'results') {
            setStep('right-ear');
        }
        else if (step === 'contact') {
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
    return (<div className="min-h-screen bg-white">
      {/* Progress Indicator */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex flex-col items-center ${step === 'left-ear' || step === 'right-ear' ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${step === 'left-ear' ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-300'}`}>
                {step === 'left-ear' ? (<span className="text-brand-primary font-bold">L</span>) : (<svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>)}
              </div>
              <span className="text-xs mt-1 text-gray-600">{locale === 'ru' ? 'Левое ухо' : 'Chap quloq'}</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200"></div>
            <div className={`flex flex-col items-center ${step === 'right-ear' ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${step === 'right-ear' ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-300'}`}>
                {step === 'right-ear' ? (<span className="text-brand-primary font-bold">R</span>) : (<svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>)}
              </div>
              <span className="text-xs mt-1 text-gray-600">{locale === 'ru' ? 'Правое ухо' : 'O\'ng quloq'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {step === 'intro' && (<test_intro_1.default locale={locale} onContinue={() => setStep('device')}/>)}

        {step === 'device' && (<device_selection_1.default locale={locale} onSelect={handleDeviceSelect} onBack={handleBack}/>)}

        {step === 'volume' && (<volume_calibration_1.default locale={locale} volume={volumeLevel} onVolumeChange={setVolumeLevel} onContinue={handleVolumeSet} onBack={handleBack} playTone={playTone} stopTone={stopTone} isPlaying={isPlaying}/>)}

        {step === 'ready-left' && (<test_ready_1.default locale={locale} ear="left" onContinue={() => setStep('left-ear')} onBack={handleBack}/>)}

        {step === 'left-ear' && (<frequency_test_1.default locale={locale} ear="left" frequencies={FREQUENCIES} onComplete={handleLeftEarComplete} onBack={handleBack} playTone={playTone} stopTone={stopTone} updateVolume={updateVolume} isPlaying={isPlaying} volume={volumeLevel}/>)}

        {step === 'ready-right' && (<test_ready_1.default locale={locale} ear="right" onContinue={() => setStep('right-ear')} onBack={handleBack}/>)}

        {step === 'right-ear' && (<frequency_test_1.default locale={locale} ear="right" frequencies={FREQUENCIES} onComplete={handleRightEarComplete} onBack={handleBack} playTone={playTone} stopTone={stopTone} updateVolume={updateVolume} isPlaying={isPlaying} volume={volumeLevel} isSubmitting={isSubmitting}/>)}

        {step === 'results' && (<test_results_1.default locale={locale} result={testResult || {
                leftEarScore: 0,
                rightEarScore: 0,
                overallScore: 0,
                leftEarLevel: 'normal',
                rightEarLevel: 'normal',
            }} onContact={() => setStep('contact')} onRestart={handleRestart}/>)}

        {step === 'contact' && testResult && (<contact_form_1.default locale={locale} onSubmit={handleContactSubmit} onBack={handleBack} isSubmitting={isSubmitting}/>)}
      </div>
    </div>);
}
//# sourceMappingURL=hearing-test.js.map