/**
 * Home Screen - Now Playing & DJ Controls
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ djEngine }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [nextTrack, setNextTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDJMode, setIsDJMode] = useState(false);
  const [crossfadeProgress, setCrossfadeProgress] = useState(0);
  const [queue, setQueue] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);

  // Animation values
  const [waveformAnim] = useState(new Animated.Value(0));
  const [vinylRotation] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animate waveform
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveformAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(waveformAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotate vinyl if playing
    if (isPlaying) {
      Animated.loop(
        Animated.timing(vinylRotation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [isPlaying]);

  const renderWaveform = () => {
    const bars = 50;
    return (
      <View style={styles.waveformContainer}>
        {[...Array(bars)].map((_, i) => {
          const height = Math.random() * 60 + 20;
          const isMidpoint = i === Math.floor(bars / 2);
          return (
            <View
              key={i}
              style={[
                styles.waveformBar,
                {
                  height: height,
                  backgroundColor: isMidpoint ? '#00ff00' : i < bars / 2 ? '#00ff0066' : '#ffffff33',
                },
              ]}
            />
          );
        })}
        {/* Playhead indicator */}
        <View style={styles.playhead} />
      </View>
    );
  };

  const renderEnergyMeter = (energy) => {
    const bars = 10;
    const filled = Math.floor((energy / 100) * bars);
    return (
      <View style={styles.energyMeterContainer}>
        <Text style={styles.energyLabel}>ENERGY</Text>
        <View style={styles.energyBars}>
          {[...Array(bars)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.energyBar,
                {
                  backgroundColor: i < filled
                    ? i < 3 ? '#00ff00' : i < 7 ? '#ffff00' : '#ff0000'
                    : '#333',
                },
              ]}
            />
          ))}
        </View>
        <Text style={styles.energyValue}>{energy}/100</Text>
      </View>
    );
  };

  const renderVinyl = () => {
    const spin = vinylRotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View style={[styles.vinylContainer, { transform: [{ rotate: spin }] }]}>
        <View style={styles.vinyl}>
          <View style={styles.vinylGrooves}>
            {[...Array(8)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.vinylGroove,
                  { width: 220 - i * 20, height: 220 - i * 20 },
                ]}
              />
            ))}
          </View>
          <View style={styles.vinylLabel}>
            <Text style={styles.vinylLabelText}>VIRTUAL</Text>
            <Text style={styles.vinylLabelText}>DJ</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🎵 VIRTUAL DJ</Text>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: isDJMode ? '#00ff00' : '#666' }]} />
          <Text style={styles.statusText}>{isDJMode ? 'AI DJ ACTIVE' : 'MANUAL MODE'}</Text>
        </View>
      </View>

      {/* Now Playing - Vinyl Display */}
      <View style={styles.nowPlayingSection}>
        <Text style={styles.sectionTitle}>NOW PLAYING</Text>

        <View style={styles.vinylSection}>
          {renderVinyl()}

          {/* Track Info Overlay */}
          <View style={styles.trackInfoOverlay}>
            <Text style={styles.trackTitle}>
              {currentTrack?.name || 'Select a track to start'}
            </Text>
            <Text style={styles.artistName}>
              {currentTrack?.artist || '---'}
            </Text>
          </View>
        </View>

        {/* Waveform */}
        <View style={styles.waveformSection}>
          {renderWaveform()}
        </View>

        {/* Track Details */}
        <View style={styles.trackDetails}>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>BPM</Text>
            <Text style={styles.detailValue}>{currentTrack?.bpm || '---'}</Text>
          </View>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>KEY</Text>
            <Text style={styles.detailValue}>
              {currentTrack?.key !== undefined
                ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][currentTrack.key]
                : '---'}
            </Text>
          </View>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>TIME</Text>
            <Text style={styles.detailValue}>
              {currentTrack ? `${Math.floor(currentTime / 60)}:${(currentTime % 60).toString().padStart(2, '0')}` : '--:--'}
            </Text>
          </View>
        </View>

        {/* Energy Meter */}
        {currentTrack && renderEnergyMeter(currentTrack.energy)}
      </View>

      {/* Crossfade Indicator */}
      {crossfadeProgress > 0 && (
        <View style={styles.crossfadeSection}>
          <Text style={styles.crossfadeLabel}>🎛️ CROSSFADING...</Text>
          <View style={styles.crossfadeBar}>
            <View style={[styles.crossfadeProgress, { width: `${crossfadeProgress}%` }]} />
          </View>
          <Text style={styles.crossfadeNext}>→ {nextTrack?.name}</Text>
        </View>
      )}

      {/* Main Controls */}
      <View style={styles.controlsSection}>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.controlIcon}>⏮</Text>
          <Text style={styles.controlLabel}>PREV</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.playButton}>
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.controlIcon}>⏭</Text>
          <Text style={styles.controlLabel}>NEXT</Text>
        </TouchableOpacity>
      </View>

      {/* DJ Mode Toggle */}
      <TouchableOpacity
        style={[styles.djModeButton, isDJMode && styles.djModeButtonActive]}
      >
        <Text style={[styles.djModeIcon, isDJMode && styles.djModeIconActive]}>🎧</Text>
        <Text style={[styles.djModeText, isDJMode && styles.djModeTextActive]}>
          {isDJMode ? 'AI DJ MODE: ON' : 'START AI DJ MODE'}
        </Text>
        {isDJMode && <Text style={styles.djModeSubtext}>Automatic mixing active</Text>}
      </TouchableOpacity>

      {/* Up Next Queue */}
      <View style={styles.queueSection}>
        <Text style={styles.sectionTitle}>UP NEXT</Text>
        {queue.length > 0 ? (
          queue.slice(0, 3).map((track, index) => (
            <View key={track.id} style={styles.queueItem}>
              <View style={styles.queueNumber}>
                <Text style={styles.queueNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.queueTrackInfo}>
                <Text style={styles.queueTrackName}>{track.name}</Text>
                <Text style={styles.queueTrackArtist}>{track.artist}</Text>
              </View>
              <View style={styles.queueMetadata}>
                <Text style={styles.queueBPM}>{track.bpm} BPM</Text>
                <View style={styles.compatibilityBadge}>
                  <Text style={styles.compatibilityText}>95%</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyQueue}>Queue is empty</Text>
        )}
      </View>

      {/* Bottom Padding */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 11,
    color: '#888',
    fontWeight: '700',
    letterSpacing: 1,
  },
  nowPlayingSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 2,
    marginBottom: 15,
  },
  vinylSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  vinylContainer: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinyl: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#333',
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  vinylGrooves: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylGroove: {
    position: 'absolute',
    borderRadius: 500,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  vinylLabel: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  vinylLabelText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#00ff00',
    letterSpacing: 2,
  },
  trackInfoOverlay: {
    marginTop: 20,
    alignItems: 'center',
  },
  trackTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  artistName: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  waveformSection: {
    marginVertical: 20,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    backgroundColor: '#0f0f0f',
    borderRadius: 10,
    paddingHorizontal: 10,
    position: 'relative',
  },
  waveformBar: {
    width: 4,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  playhead: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: '#00ff00',
    left: '50%',
  },
  trackDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  detailBox: {
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  detailLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 18,
    color: '#00ff00',
    fontWeight: '700',
  },
  energyMeterContainer: {
    marginTop: 20,
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
  },
  energyLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  energyBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 30,
    marginBottom: 8,
  },
  energyBar: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 2,
  },
  energyValue: {
    fontSize: 14,
    color: '#00ff00',
    fontWeight: '700',
    textAlign: 'right',
  },
  crossfadeSection: {
    margin: 20,
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00ff00',
  },
  crossfadeLabel: {
    fontSize: 12,
    color: '#00ff00',
    fontWeight: '700',
    marginBottom: 10,
  },
  crossfadeBar: {
    height: 6,
    backgroundColor: '#2a2a2a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  crossfadeProgress: {
    height: '100%',
    backgroundColor: '#00ff00',
  },
  crossfadeNext: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },
  controlsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  controlButton: {
    alignItems: 'center',
    padding: 15,
  },
  controlIcon: {
    fontSize: 28,
    color: '#fff',
  },
  controlLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 5,
    fontWeight: '700',
    letterSpacing: 1,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00ff00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  playIcon: {
    fontSize: 32,
    color: '#000',
  },
  djModeButton: {
    margin: 20,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
  djModeButtonActive: {
    backgroundColor: '#00ff0022',
    borderColor: '#00ff00',
  },
  djModeIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  djModeIconActive: {
    fontSize: 32,
  },
  djModeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1,
  },
  djModeTextActive: {
    color: '#00ff00',
  },
  djModeSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  queueSection: {
    padding: 20,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  queueNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  queueTrackInfo: {
    flex: 1,
    marginLeft: 15,
  },
  queueTrackName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 3,
  },
  queueTrackArtist: {
    fontSize: 12,
    color: '#888',
  },
  queueMetadata: {
    alignItems: 'flex-end',
  },
  queueBPM: {
    fontSize: 12,
    color: '#00ff00',
    fontWeight: '700',
    marginBottom: 5,
  },
  compatibilityBadge: {
    backgroundColor: '#00ff0022',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  compatibilityText: {
    fontSize: 10,
    color: '#00ff00',
    fontWeight: '700',
  },
  emptyQueue: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default HomeScreen;
