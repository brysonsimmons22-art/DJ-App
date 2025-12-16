/**
 * BPM Detection Algorithm
 * Uses onset detection and autocorrelation for accurate tempo detection
 */

class BPMDetector {
  constructor() {
    this.sampleRate = 44100;
    this.minBPM = 60;
    this.maxBPM = 180;
  }

  /**
   * Detect BPM from audio buffer
   * @param {AudioBuffer} audioBuffer - Web Audio API AudioBuffer
   * @returns {number} Detected BPM
   */
  async detectBPM(audioBuffer) {
    try {
      // Convert to mono if stereo
      const channelData = this.convertToMono(audioBuffer);

      // Detect onsets (beats)
      const onsets = this.detectOnsets(channelData, audioBuffer.sampleRate);

      // Calculate tempo from onset intervals
      const bpm = this.calculateTempo(onsets, audioBuffer.sampleRate);

      return Math.round(bpm * 10) / 10; // Round to 1 decimal place
    } catch (error) {
      console.error('Error detecting BPM:', error);
      throw error;
    }
  }

  /**
   * Convert stereo audio to mono
   */
  convertToMono(audioBuffer) {
    if (audioBuffer.numberOfChannels === 1) {
      return audioBuffer.getChannelData(0);
    }

    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);
    const mono = new Float32Array(left.length);

    for (let i = 0; i < left.length; i++) {
      mono[i] = (left[i] + right[i]) / 2;
    }

    return mono;
  }

  /**
   * Detect onset peaks in audio signal
   */
  detectOnsets(audioData, sampleRate) {
    const frameSize = 1024;
    const hopSize = 512;
    const onsets = [];

    // Calculate energy in each frame
    const energies = [];
    for (let i = 0; i < audioData.length - frameSize; i += hopSize) {
      let energy = 0;
      for (let j = 0; j < frameSize; j++) {
        energy += Math.abs(audioData[i + j]);
      }
      energies.push(energy / frameSize);
    }

    // Find peaks in energy (onsets)
    const threshold = this.calculateThreshold(energies);

    for (let i = 1; i < energies.length - 1; i++) {
      if (
        energies[i] > threshold &&
        energies[i] > energies[i - 1] &&
        energies[i] > energies[i + 1]
      ) {
        onsets.push(i * hopSize);
      }
    }

    return onsets;
  }

  /**
   * Calculate adaptive threshold for onset detection
   */
  calculateThreshold(energies) {
    const mean = energies.reduce((a, b) => a + b, 0) / energies.length;
    const variance = energies.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / energies.length;
    const stdDev = Math.sqrt(variance);

    return mean + (stdDev * 1.5); // Threshold = mean + 1.5 * std dev
  }

  /**
   * Calculate tempo from onset intervals using autocorrelation
   */
  calculateTempo(onsets, sampleRate) {
    if (onsets.length < 2) {
      return 120; // Default BPM if detection fails
    }

    // Calculate intervals between onsets
    const intervals = [];
    for (let i = 1; i < onsets.length; i++) {
      intervals.push(onsets[i] - onsets[i - 1]);
    }

    // Use autocorrelation to find most common interval
    const intervalInSamples = this.findMostCommonInterval(intervals);

    // Convert interval to BPM
    const intervalInSeconds = intervalInSamples / sampleRate;
    let bpm = 60 / intervalInSeconds;

    // Adjust BPM to be within typical range
    while (bpm < this.minBPM) bpm *= 2;
    while (bpm > this.maxBPM) bpm /= 2;

    return bpm;
  }

  /**
   * Find most common interval using histogram
   */
  findMostCommonInterval(intervals) {
    if (intervals.length === 0) return 0;

    // Create histogram
    const histogram = {};
    intervals.forEach(interval => {
      const rounded = Math.round(interval / 100) * 100; // Round to nearest 100 samples
      histogram[rounded] = (histogram[rounded] || 0) + 1;
    });

    // Find most common interval
    let maxCount = 0;
    let mostCommon = 0;

    Object.entries(histogram).forEach(([interval, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = parseInt(interval);
      }
    });

    return mostCommon;
  }

  /**
   * Detect first beat in audio (for beatmatching)
   */
  detectFirstBeat(audioBuffer) {
    const channelData = this.convertToMono(audioBuffer);
    const onsets = this.detectOnsets(channelData, audioBuffer.sampleRate);

    if (onsets.length > 0) {
      return onsets[0] / audioBuffer.sampleRate; // Return time in seconds
    }

    return 0;
  }

  /**
   * Detect beats throughout the track
   */
  detectBeats(audioBuffer) {
    const channelData = this.convertToMono(audioBuffer);
    const onsets = this.detectOnsets(channelData, audioBuffer.sampleRate);

    // Convert to time positions
    return onsets.map(onset => onset / audioBuffer.sampleRate);
  }

  /**
   * Analyze energy levels throughout track
   */
  analyzeEnergy(audioBuffer) {
    const channelData = this.convertToMono(audioBuffer);
    const windowSize = audioBuffer.sampleRate * 4; // 4-second windows
    const energyLevels = [];

    for (let i = 0; i < channelData.length; i += windowSize) {
      let energy = 0;
      const windowEnd = Math.min(i + windowSize, channelData.length);

      for (let j = i; j < windowEnd; j++) {
        energy += Math.abs(channelData[j]);
      }

      energyLevels.push(energy / (windowEnd - i));
    }

    // Normalize to 0-100 scale
    const maxEnergy = Math.max(...energyLevels);
    return energyLevels.map(e => (e / maxEnergy) * 100);
  }

  /**
   * Calculate overall energy score for a track
   */
  calculateOverallEnergy(audioBuffer) {
    const energyLevels = this.analyzeEnergy(audioBuffer);
    const avgEnergy = energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length;

    return Math.round(avgEnergy);
  }
}

export default new BPMDetector();
