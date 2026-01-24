/**
 * Adaptive Testing Algorithm for Speech-in-Noise (Digits-in-Noise) Test
 * Based on ReSound.com and clinical standards
 */

export interface AdaptiveTestState {
  snr: number; // Signal-to-Noise Ratio in dB
  stepSize: number; // Current step size in dB
  reversals: number[]; // Array of SNR values at reversal points
  lastCorrect: boolean | null; // Last response correctness
  trialCount: number; // Total trials completed
  minSNR: number; // Minimum allowed SNR
  maxSNR: number; // Maximum allowed SNR
}

export class AdaptiveTestAlgorithm {
  private state: AdaptiveTestState;

  constructor(initialSNR: number = 0, initialStepSize: number = 2) {
    this.state = {
      snr: initialSNR,
      stepSize: initialStepSize,
      reversals: [],
      lastCorrect: null,
      trialCount: 0,
      minSNR: -10, // Minimum SNR (harder)
      maxSNR: 15, // Maximum SNR (easier)
    };
  }

  /**
   * Update SNR based on response correctness
   * Correct response -> decrease SNR (make harder)
   * Incorrect response -> increase SNR (make easier)
   */
  updateSNR(correct: boolean): number {
    this.state.trialCount++;

    // Detect reversal (direction change)
    if (this.state.lastCorrect !== null && this.state.lastCorrect !== correct) {
      // Reversal detected - store current SNR
      this.state.reversals.push(this.state.snr);

      // Reduce step size after certain reversals (adaptive)
      if (this.state.reversals.length === 2) {
        this.state.stepSize = 1; // Smaller steps after 2 reversals
      } else if (this.state.reversals.length === 4) {
        this.state.stepSize = 0.5; // Even smaller steps after 4 reversals
      }
    }

    // Update SNR based on correctness
    if (correct) {
      this.state.snr -= this.state.stepSize; // Make harder (lower SNR)
    } else {
      this.state.snr += this.state.stepSize; // Make easier (higher SNR)
    }

    // Constrain SNR within bounds
    this.state.snr = Math.max(
      this.state.minSNR,
      Math.min(this.state.maxSNR, this.state.snr)
    );

    this.state.lastCorrect = correct;
    return this.state.snr;
  }

  /**
   * Calculate SRT-50 (Speech Reception Threshold at 50% correct)
   * Uses the mean of the last 6 reversals
   */
  getSRT50(): number | null {
    if (this.state.reversals.length < 4) {
      return null; // Need at least 4 reversals
    }

    // Use last 6 reversals (or all if less than 6)
    const lastReversals = this.state.reversals.slice(-6);
    const srt = lastReversals.reduce((a, b) => a + b, 0) / lastReversals.length;
    
    // Round to 1 decimal place
    return Math.round(srt * 10) / 10;
  }

  /**
   * Check if test should stop
   * Stop after 8 reversals (clinical standard)
   */
  shouldStop(): boolean {
    return this.state.reversals.length >= 8;
  }

  /**
   * Get current SNR
   */
  getCurrentSNR(): number {
    return this.state.snr;
  }

  /**
   * Get number of reversals
   */
  getReversalsCount(): number {
    return this.state.reversals.length;
  }

  /**
   * Get trial count
   */
  getTrialCount(): number {
    return this.state.trialCount;
  }

  /**
   * Get current state (for debugging)
   */
  getState(): AdaptiveTestState {
    return { ...this.state };
  }

  /**
   * Reset algorithm
   */
  reset(initialSNR: number = 0, initialStepSize: number = 2) {
    this.state = {
      snr: initialSNR,
      stepSize: initialStepSize,
      reversals: [],
      lastCorrect: null,
      trialCount: 0,
      minSNR: -10,
      maxSNR: 15,
    };
  }
}
