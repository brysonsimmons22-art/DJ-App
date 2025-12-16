/**
 * Beatmatching Algorithm
 * Synchronizes beats between two songs for seamless transitions
 */

class Beatmatcher {
  constructor() {
    this.maxBPMDifference = 0.5; // Acceptable BPM difference after matching
  }

  /**
   * Calculate speed adjustment ratio for beatmatching
   * @param {number} currentBPM - BPM of currently playing track
   * @param {number} nextBPM - BPM of next track
   * @returns {number} Playback rate multiplier (e.g., 1.05 = 5% faster)
   */
  calculatePlaybackRate(currentBPM, nextBPM) {
    if (!currentBPM || !nextBPM) {
      return 1.0;
    }

    // Calculate exact ratio
    const ratio = currentBPM / nextBPM;

    // Check if we need to double/halve the BPM first
    let adjustedRatio = ratio;

    // If BPMs are in different ranges, adjust by factors of 2
    if (ratio < 0.75) {
      adjustedRatio = ratio * 2;
    } else if (ratio > 1.33) {
      adjustedRatio = ratio / 2;
    }

    // Limit playback rate to reasonable range (0.85 - 1.15)
    // Beyond this range, the pitch shift becomes too noticeable
    adjustedRatio = Math.max(0.85, Math.min(1.15, adjustedRatio));

    return Math.round(adjustedRatio * 1000) / 1000; // Round to 3 decimal places
  }

  /**
   * Align beat grids of two tracks
   * @param {Array} currentBeats - Beat positions in current track
   * @param {Array} nextBeats - Beat positions in next track
   * @param {number} transitionPoint - When to start mixing (in seconds)
   * @returns {number} Time offset to apply to next track
   */
  alignBeats(currentBeats, nextBeats, transitionPoint) {
    if (!currentBeats.length || !nextBeats.length) {
      return 0;
    }

    // Find the beat in current track closest to transition point
    const currentBeat = this.findClosestBeat(currentBeats, transitionPoint);

    // We want the first beat of next track to align with this beat
    const nextFirstBeat = nextBeats[0];

    // Calculate offset
    const offset = currentBeat - nextFirstBeat;

    return offset;
  }

  /**
   * Find beat closest to a given time position
   */
  findClosestBeat(beats, timePosition) {
    let closest = beats[0];
    let minDiff = Math.abs(beats[0] - timePosition);

    for (let i = 1; i < beats.length; i++) {
      const diff = Math.abs(beats[i] - timePosition);
      if (diff < minDiff) {
        minDiff = diff;
        closest = beats[i];
      }
    }

    return closest;
  }

  /**
   * Find optimal transition point (on a phrase boundary)
   * @param {Array} beats - Beat positions
   * @param {number} idealTime - Desired transition time
   * @param {number} barsInPhrase - Typically 16 or 32 bars
   * @returns {number} Adjusted transition time on phrase boundary
   */
  findPhraseTransitionPoint(beats, idealTime, barsInPhrase = 16) {
    if (beats.length < barsInPhrase * 4) {
      return idealTime;
    }

    // Most songs have 4 beats per bar
    const beatsPerPhrase = barsInPhrase * 4;

    // Find phrase boundaries
    const phraseBoundaries = [];
    for (let i = 0; i < beats.length; i += beatsPerPhrase) {
      phraseBoundaries.push(beats[i]);
    }

    // Find phrase boundary closest to ideal time
    return this.findClosestBeat(phraseBoundaries, idealTime);
  }

  /**
   * Check if two BPMs are compatible for mixing
   */
  areCompatible(bpm1, bpm2) {
    const ratio = Math.max(bpm1, bpm2) / Math.min(bpm1, bpm2);

    // Compatible if within 15% or if one is exactly double/half the other
    const withinRange = ratio <= 1.15;
    const doubleHalf = Math.abs(ratio - 2.0) < 0.1 || Math.abs(ratio - 0.5) < 0.1;

    return withinRange || doubleHalf;
  }

  /**
   * Calculate compatibility score between two tracks
   */
  calculateCompatibility(track1, track2) {
    let score = 100;

    // BPM compatibility (40 points)
    const bpmRatio = Math.max(track1.bpm, track2.bpm) / Math.min(track1.bpm, track2.bpm);
    if (bpmRatio > 1.15) {
      score -= (bpmRatio - 1.15) * 100;
    }

    // Key compatibility (30 points) - harmonic mixing
    if (track1.key !== null && track2.key !== null) {
      const keyCompatibility = this.getKeyCompatibility(track1.key, track2.key, track1.mode, track2.mode);
      score += keyCompatibility * 30 - 30;
    }

    // Energy difference (20 points) - shouldn't jump too much
    if (track1.energy !== null && track2.energy !== null) {
      const energyDiff = Math.abs(track1.energy - track2.energy);
      score -= energyDiff / 5; // Penalize large energy jumps
    }

    // Genre similarity (10 points) - could be expanded
    // For now, just a placeholder

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Get key compatibility using Camelot Wheel
   * Keys are represented as numbers 0-11 (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
   * Mode: 0 = minor, 1 = major
   */
  getKeyCompatibility(key1, key2, mode1, mode2) {
    // Perfect match
    if (key1 === key2 && mode1 === mode2) {
      return 1.0;
    }

    // Same key, different mode (relative major/minor)
    if (key1 === key2) {
      return 0.8;
    }

    // Perfect fifth (7 semitones up)
    if ((key2 - key1 + 12) % 12 === 7 && mode1 === mode2) {
      return 0.9;
    }

    // Perfect fourth (5 semitones down)
    if ((key1 - key2 + 12) % 12 === 7 && mode1 === mode2) {
      return 0.9;
    }

    // Adjacent keys on Camelot wheel
    if (Math.abs(key1 - key2) === 1 && mode1 === mode2) {
      return 0.7;
    }

    // Not compatible
    return 0.3;
  }

  /**
   * Generate beatmatching instructions for DJ engine
   */
  generateBeatmatchPlan(currentTrack, nextTrack, transitionStartTime) {
    const playbackRate = this.calculatePlaybackRate(currentTrack.bpm, nextTrack.bpm);

    const plan = {
      playbackRate: playbackRate,
      startOffset: 0, // Can be calculated if we have beat grids
      phraseBoundary: true,
      estimatedBPMAfterAdjustment: nextTrack.bpm * playbackRate,
      bpmDifference: Math.abs(currentTrack.bpm - (nextTrack.bpm * playbackRate)),
      isHarmonicMix: this.getKeyCompatibility(
        currentTrack.key,
        nextTrack.key,
        currentTrack.mode,
        nextTrack.mode
      ) >= 0.7,
      compatibility: this.calculateCompatibility(currentTrack, nextTrack)
    };

    return plan;
  }
}

export default new Beatmatcher();
