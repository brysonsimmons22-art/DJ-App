/**
 * Crossfade Engine
 * Handles smooth transitions between tracks with EQ blending
 */

class CrossfadeEngine {
  constructor() {
    this.defaultCrossfadeDuration = 8; // seconds
    this.eqEnabled = true;
  }

  /**
   * Generate crossfade curve
   * @param {number} duration - Crossfade duration in seconds
   * @param {string} curveType - 'linear', 'exponential', or 'scurve'
   * @returns {Object} Volume curves for both tracks
   */
  generateCrossfadeCurve(duration, curveType = 'scurve') {
    const steps = 100; // Number of interpolation points
    const stepDuration = duration / steps;

    const outgoingCurve = [];
    const incomingCurve = [];

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps; // 0 to 1

      let outgoingVolume, incomingVolume;

      switch (curveType) {
        case 'linear':
          outgoingVolume = 1 - progress;
          incomingVolume = progress;
          break;

        case 'exponential':
          outgoingVolume = Math.pow(1 - progress, 2);
          incomingVolume = Math.pow(progress, 2);
          break;

        case 'scurve':
        default:
          // S-curve for smoother perceived transition
          outgoingVolume = Math.cos((progress * Math.PI) / 2);
          incomingVolume = Math.sin((progress * Math.PI) / 2);
          break;
      }

      outgoingCurve.push({
        time: i * stepDuration,
        volume: outgoingVolume
      });

      incomingCurve.push({
        time: i * stepDuration,
        volume: incomingVolume
      });
    }

    return {
      outgoing: outgoingCurve,
      incoming: incomingCurve,
      duration: duration
    };
  }

  /**
   * Generate EQ adjustment curves for crossfade
   * Gradually cuts highs from outgoing track while boosting incoming track
   */
  generateEQCurve(duration) {
    const steps = 100;
    const stepDuration = duration / steps;

    const outgoingEQ = [];
    const incomingEQ = [];

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;

      // Outgoing track: Gradually cut highs and mids, keep bass longer
      outgoingEQ.push({
        time: i * stepDuration,
        low: 1.0, // Keep bass until 75% through
        mid: 1 - (progress * 0.8), // Cut mids gradually
        high: 1 - progress // Cut highs linearly
      });

      // Incoming track: Gradually boost from bass up
      incomingEQ.push({
        time: i * stepDuration,
        low: Math.min(1, progress * 1.5), // Boost bass first
        mid: Math.max(0, (progress - 0.3) * 1.4), // Start mids at 30%
        high: Math.max(0, (progress - 0.5) * 2) // Start highs at 50%
      });
    }

    return {
      outgoing: outgoingEQ,
      incoming: incomingEQ
    };
  }

  /**
   * Calculate optimal crossfade start time
   * @param {number} trackDuration - Duration of current track in seconds
   * @param {number} crossfadeDuration - Desired crossfade duration
   * @param {Array} beats - Beat positions in track
   * @returns {number} Time to start crossfade
   */
  calculateCrossfadeStartTime(trackDuration, crossfadeDuration, beats = []) {
    // Start crossfade so it ends at track end
    let startTime = trackDuration - crossfadeDuration;

    // If we have beat information, align to phrase boundary
    if (beats.length > 0) {
      // Find 16-bar phrase boundary near our ideal start time
      const beatsPerPhrase = 64; // 16 bars * 4 beats
      const phraseBoundaries = [];

      for (let i = beatsPerPhrase; i < beats.length; i += beatsPerPhrase) {
        phraseBoundaries.push(beats[i]);
      }

      // Find closest phrase boundary
      let closest = startTime;
      let minDiff = Infinity;

      phraseBoundaries.forEach(boundary => {
        const diff = Math.abs(boundary - startTime);
        if (diff < minDiff && boundary > 0 && boundary < trackDuration) {
          minDiff = diff;
          closest = boundary;
        }
      });

      startTime = closest;
    }

    return Math.max(0, startTime);
  }

  /**
   * Create crossfade plan for DJ engine
   */
  createCrossfadePlan(currentTrack, nextTrack, crossfadeDuration = null) {
    const duration = crossfadeDuration || this.defaultCrossfadeDuration;

    const volumeCurves = this.generateCrossfadeCurve(duration, 'scurve');
    const eqCurves = this.eqEnabled ? this.generateEQCurve(duration) : null;

    const startTime = this.calculateCrossfadeStartTime(
      currentTrack.duration / 1000, // Convert ms to seconds
      duration,
      currentTrack.beats || []
    );

    return {
      startTime: startTime,
      duration: duration,
      volumeCurves: volumeCurves,
      eqCurves: eqCurves,
      currentTrack: {
        id: currentTrack.id,
        fadeOut: volumeCurves.outgoing,
        eqAdjustment: eqCurves?.outgoing
      },
      nextTrack: {
        id: nextTrack.id,
        fadeIn: volumeCurves.incoming,
        eqAdjustment: eqCurves?.incoming,
        startOffset: 0 // Can be adjusted for beatmatching
      }
    };
  }

  /**
   * Apply crossfade in real-time using Web Audio API
   * @param {AudioContext} audioContext - Web Audio API context
   * @param {AudioBufferSourceNode} currentSource - Current playing source
   * @param {AudioBufferSourceNode} nextSource - Next track source
   * @param {Object} plan - Crossfade plan
   */
  applyCrossfade(audioContext, currentSource, nextSource, plan) {
    const now = audioContext.currentTime;

    // Create gain nodes for volume control
    const currentGain = audioContext.createGain();
    const nextGain = audioContext.createGain();

    currentSource.connect(currentGain);
    nextSource.connect(nextGain);

    // Apply volume curves
    plan.volumeCurves.outgoing.forEach(point => {
      currentGain.gain.linearRampToValueAtTime(
        point.volume,
        now + point.time
      );
    });

    plan.volumeCurves.incoming.forEach(point => {
      nextGain.gain.linearRampToValueAtTime(
        point.volume,
        now + point.time
      );
    });

    // If EQ is enabled, create and apply filters
    if (plan.eqCurves && this.eqEnabled) {
      const currentEQ = this.createEQFilters(audioContext);
      const nextEQ = this.createEQFilters(audioContext);

      currentGain.connect(currentEQ.low);
      currentEQ.high.connect(audioContext.destination);

      nextGain.connect(nextEQ.low);
      nextEQ.high.connect(audioContext.destination);

      // Apply EQ curves
      this.applyEQCurves(audioContext, currentEQ, plan.eqCurves.outgoing, now);
      this.applyEQCurves(audioContext, nextEQ, plan.eqCurves.incoming, now);
    } else {
      currentGain.connect(audioContext.destination);
      nextGain.connect(audioContext.destination);
    }

    // Start playback
    currentSource.start(now);
    nextSource.start(now + plan.nextTrack.startOffset);

    return {
      currentGain,
      nextGain,
      crossfadeEndTime: now + plan.duration
    };
  }

  /**
   * Create 3-band EQ (low, mid, high)
   */
  createEQFilters(audioContext) {
    const lowShelf = audioContext.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 200;

    const mid = audioContext.createBiquadFilter();
    mid.type = 'peaking';
    mid.frequency.value = 1000;
    mid.Q.value = 0.5;

    const highShelf = audioContext.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.value = 4000;

    lowShelf.connect(mid);
    mid.connect(highShelf);

    return {
      low: lowShelf,
      mid: mid,
      high: highShelf
    };
  }

  /**
   * Apply EQ curve adjustments
   */
  applyEQCurves(audioContext, eqFilters, curve, startTime) {
    curve.forEach(point => {
      const time = startTime + point.time;

      // Convert 0-1 range to dB gain (-40 to +12 dB)
      const lowGain = (point.low - 0.5) * 24;
      const midGain = (point.mid - 0.5) * 24;
      const highGain = (point.high - 0.5) * 24;

      eqFilters.low.gain.linearRampToValueAtTime(lowGain, time);
      eqFilters.mid.gain.linearRampToValueAtTime(midGain, time);
      eqFilters.high.gain.linearRampToValueAtTime(highGain, time);
    });
  }

  /**
   * Estimate how the crossfade will sound (for preview)
   */
  estimateCrossfadeQuality(currentTrack, nextTrack) {
    let quality = 100;

    // Check BPM compatibility
    const bpmDiff = Math.abs(currentTrack.bpm - nextTrack.bpm);
    if (bpmDiff > 5) {
      quality -= Math.min(30, bpmDiff * 3);
    }

    // Check energy difference
    const energyDiff = Math.abs(currentTrack.energy - nextTrack.energy);
    if (energyDiff > 30) {
      quality -= Math.min(20, energyDiff / 2);
    }

    // Check key compatibility (bonus for harmonic mixing)
    if (currentTrack.key !== null && nextTrack.key !== null) {
      // Simplified harmonic check
      const keyDiff = Math.abs(currentTrack.key - nextTrack.key);
      if (keyDiff === 0 || keyDiff === 7 || keyDiff === 5) {
        quality += 10; // Bonus for harmonic mixing
      }
    }

    return Math.max(0, Math.min(100, Math.round(quality)));
  }
}

export default new CrossfadeEngine();
