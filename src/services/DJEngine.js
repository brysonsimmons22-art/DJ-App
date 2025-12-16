/**
 * Main DJ Engine
 * Orchestrates all DJ functionality - beatmatching, crossfading, and playback
 */

import BPMDetector from '../algorithms/BPMDetector';
import Beatmatcher from '../algorithms/Beatmatcher';
import CrossfadeEngine from '../algorithms/CrossfadeEngine';
import PartyFlowAI from '../algorithms/PartyFlowAI';

class DJEngine {
  constructor() {
    this.playlist = [];
    this.currentTrackIndex = -1;
    this.isPlaying = false;
    this.isDJModeActive = false;
    this.audioContext = null;
    this.currentSource = null;
    this.nextSource = null;
    this.crossfadeInProgress = false;

    // Settings
    this.settings = {
      crossfadeDuration: 8, // seconds
      partyFlowProfile: 'progressiveBuild',
      autoEQEnabled: true,
      harmonicMixingEnabled: true,
      vocalDetectionEnabled: false
    };

    // State listeners
    this.listeners = {
      onTrackChange: [],
      onPlayStateChange: [],
      onCrossfadeStart: [],
      onCrossfadeEnd: [],
      onError: []
    };
  }

  /**
   * Initialize audio context
   */
  async initialize() {
    try {
      // In a real mobile app, this would use native audio APIs
      // For web, we use Web Audio API
      if (typeof window !== 'undefined' && window.AudioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      return true;
    } catch (error) {
      this.emit('onError', error);
      return false;
    }
  }

  /**
   * Load and analyze playlist
   */
  async loadPlaylist(tracks) {
    try {
      // Analyze each track if not already analyzed
      const analyzedTracks = await Promise.all(
        tracks.map(async (track) => {
          if (!track.bpm || !track.energy) {
            // In production, this would analyze the actual audio
            // For now, we'll use Spotify's audio features
            return track;
          }
          return track;
        })
      );

      this.playlist = analyzedTracks;
      this.emit('onPlaylistLoaded', analyzedTracks);

      return analyzedTracks;
    } catch (error) {
      this.emit('onError', error);
      throw error;
    }
  }

  /**
   * Optimize playlist order using Party Flow AI
   */
  async optimizePlaylist(profile = null) {
    if (this.playlist.length === 0) {
      throw new Error('No playlist loaded');
    }

    const flowProfile = profile || this.settings.partyFlowProfile;
    this.playlist = PartyFlowAI.orderPlaylist(this.playlist, flowProfile);

    this.emit('onPlaylistOptimized', this.playlist);
    return this.playlist;
  }

  /**
   * Start DJ mode - automatic mixing
   */
  async startDJMode() {
    if (this.playlist.length < 2) {
      throw new Error('Need at least 2 tracks for DJ mode');
    }

    this.isDJModeActive = true;
    this.currentTrackIndex = 0;

    await this.playTrack(this.currentTrackIndex);

    // Schedule next track
    this.scheduleNextTrack();

    return true;
  }

  /**
   * Stop DJ mode
   */
  stopDJMode() {
    this.isDJModeActive = false;
    this.stop();
  }

  /**
   * Play a specific track
   */
  async playTrack(index) {
    if (index < 0 || index >= this.playlist.length) {
      throw new Error('Invalid track index');
    }

    const track = this.playlist[index];
    this.currentTrackIndex = index;

    // In production, this would load and play actual audio
    // For now, we'll simulate playback
    this.isPlaying = true;

    this.emit('onTrackChange', {
      track: track,
      index: index,
      totalTracks: this.playlist.length
    });

    this.emit('onPlayStateChange', true);

    return track;
  }

  /**
   * Schedule next track with crossfade
   */
  scheduleNextTrack() {
    if (!this.isDJModeActive) return;

    const currentTrack = this.playlist[this.currentTrackIndex];
    const nextIndex = (this.currentTrackIndex + 1) % this.playlist.length;
    const nextTrack = this.playlist[nextIndex];

    // Calculate when to start crossfade
    const crossfadeStartTime = CrossfadeEngine.calculateCrossfadeStartTime(
      currentTrack.duration / 1000,
      this.settings.crossfadeDuration,
      currentTrack.beats
    );

    // Create crossfade and beatmatch plan
    const crossfadePlan = CrossfadeEngine.createCrossfadePlan(
      currentTrack,
      nextTrack,
      this.settings.crossfadeDuration
    );

    const beatmatchPlan = Beatmatcher.generateBeatmatchPlan(
      currentTrack,
      nextTrack,
      crossfadeStartTime
    );

    // Schedule crossfade
    setTimeout(() => {
      this.executeCrossfade(nextIndex, crossfadePlan, beatmatchPlan);
    }, crossfadeStartTime * 1000);
  }

  /**
   * Execute crossfade to next track
   */
  async executeCrossfade(nextIndex, crossfadePlan, beatmatchPlan) {
    if (!this.isDJModeActive) return;

    const nextTrack = this.playlist[nextIndex];

    this.crossfadeInProgress = true;
    this.emit('onCrossfadeStart', {
      currentTrack: this.playlist[this.currentTrackIndex],
      nextTrack: nextTrack,
      plan: crossfadePlan,
      beatmatchPlan: beatmatchPlan
    });

    // In production, this would actually crossfade the audio
    // using the Web Audio API or native audio APIs

    // Simulate crossfade duration
    await new Promise(resolve => setTimeout(resolve, crossfadePlan.duration * 1000));

    // Update current track
    this.currentTrackIndex = nextIndex;
    this.crossfadeInProgress = false;

    this.emit('onCrossfadeEnd', {
      track: nextTrack,
      index: nextIndex
    });

    this.emit('onTrackChange', {
      track: nextTrack,
      index: nextIndex,
      totalTracks: this.playlist.length
    });

    // Schedule next track
    this.scheduleNextTrack();
  }

  /**
   * Play/pause control
   */
  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Play
   */
  play() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.emit('onPlayStateChange', true);
    }
  }

  /**
   * Pause
   */
  pause() {
    if (this.isPlaying) {
      this.isPlaying = false;
      this.emit('onPlayStateChange', false);
    }
  }

  /**
   * Stop
   */
  stop() {
    this.isPlaying = false;
    this.currentTrackIndex = -1;
    this.emit('onPlayStateChange', false);
  }

  /**
   * Skip to next track
   */
  skipToNext() {
    const nextIndex = (this.currentTrackIndex + 1) % this.playlist.length;
    return this.playTrack(nextIndex);
  }

  /**
   * Go to previous track
   */
  skipToPrevious() {
    const prevIndex = this.currentTrackIndex - 1 < 0
      ? this.playlist.length - 1
      : this.currentTrackIndex - 1;
    return this.playTrack(prevIndex);
  }

  /**
   * Get current playback state
   */
  getState() {
    return {
      isPlaying: this.isPlaying,
      isDJModeActive: this.isDJModeActive,
      currentTrackIndex: this.currentTrackIndex,
      currentTrack: this.playlist[this.currentTrackIndex] || null,
      nextTrack: this.playlist[(this.currentTrackIndex + 1) % this.playlist.length] || null,
      playlistLength: this.playlist.length,
      crossfadeInProgress: this.crossfadeInProgress,
      settings: this.settings
    };
  }

  /**
   * Update settings
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.emit('onSettingsChange', this.settings);
  }

  /**
   * Get upcoming tracks (queue)
   */
  getQueue(count = 5) {
    const queue = [];
    for (let i = 1; i <= count; i++) {
      const index = (this.currentTrackIndex + i) % this.playlist.length;
      if (this.playlist[index]) {
        queue.push({
          ...this.playlist[index],
          queuePosition: i
        });
      }
    }
    return queue;
  }

  /**
   * Analyze playlist and get insights
   */
  analyzePlaylist() {
    return PartyFlowAI.analyzePlaylist(this.playlist);
  }

  /**
   * Get energy curve for visualization
   */
  getEnergyCurve() {
    return PartyFlowAI.generateEnergyCurve(this.playlist);
  }

  /**
   * Predict party success
   */
  predictSuccess() {
    return PartyFlowAI.predictPartySuccess(this.playlist);
  }

  /**
   * Event listener management
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.listeners = {
      onTrackChange: [],
      onPlayStateChange: [],
      onCrossfadeStart: [],
      onCrossfadeEnd: [],
      onError: []
    };
  }
}

export default DJEngine;
