/**
 * Virtual DJ App - Main Entry Point
 * React Native Mobile Application
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';

import DJEngine from './src/services/DJEngine';
import SpotifyService from './src/services/SpotifyService';

const App = () => {
  const [djEngine] = useState(new DJEngine());
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDJMode, setIsDJMode] = useState(false);
  const [queue, setQueue] = useState([]);
  const [energyCurve, setEnergyCurve] = useState([]);

  useEffect(() => {
    // Initialize DJ Engine
    djEngine.initialize();

    // Set up event listeners
    djEngine.on('onTrackChange', (data) => {
      setCurrentTrack(data.track);
      setQueue(djEngine.getQueue(5));
    });

    djEngine.on('onPlayStateChange', (playing) => {
      setIsPlaying(playing);
    });

    djEngine.on('onCrossfadeStart', (data) => {
      console.log('Crossfade started:', data);
    });

    return () => {
      djEngine.destroy();
    };
  }, []);

  const connectSpotify = async () => {
    // In production, this would handle OAuth flow
    console.log('Connect to Spotify...');
  };

  const loadSamplePlaylist = async () => {
    // Sample playlist for demonstration
    const samplePlaylist = [
      {
        id: '1',
        name: 'Uptown Funk',
        artist: 'Mark Ronson ft. Bruno Mars',
        bpm: 115,
        energy: 82,
        key: 7,
        mode: 1,
        duration: 269000,
      },
      {
        id: '2',
        name: 'Blinding Lights',
        artist: 'The Weeknd',
        bpm: 171,
        energy: 85,
        key: 0,
        mode: 1,
        duration: 200000,
      },
      {
        id: '3',
        name: 'Levitating',
        artist: 'Dua Lipa',
        bpm: 103,
        energy: 80,
        key: 2,
        mode: 1,
        duration: 203000,
      },
      {
        id: '4',
        name: 'Don\'t Start Now',
        artist: 'Dua Lipa',
        bpm: 124,
        energy: 83,
        key: 2,
        mode: 0,
        duration: 183000,
      },
      {
        id: '5',
        name: 'Watermelon Sugar',
        artist: 'Harry Styles',
        bpm: 95,
        energy: 77,
        key: 9,
        mode: 1,
        duration: 174000,
      },
    ];

    await djEngine.loadPlaylist(samplePlaylist);
    await djEngine.optimizePlaylist();

    const curve = djEngine.getEnergyCurve();
    setEnergyCurve(curve);

    console.log('Playlist loaded and optimized!');
  };

  const startDJ = async () => {
    await djEngine.startDJMode();
    setIsDJMode(true);
  };

  const stopDJ = () => {
    djEngine.stopDJMode();
    setIsDJMode(false);
  };

  const togglePlayPause = () => {
    djEngine.togglePlayPause();
  };

  const skipNext = () => {
    djEngine.skipToNext();
  };

  const renderEnergyBar = (energy) => {
    const bars = Math.floor(energy / 10);
    return '▓'.repeat(bars) + '░'.repeat(10 - bars);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎵 Virtual DJ</Text>
        <Text style={styles.subtitle}>AI-Powered Party Mixer</Text>
      </View>

      {/* Now Playing */}
      <View style={styles.nowPlaying}>
        {currentTrack ? (
          <>
            <Text style={styles.trackTitle}>{currentTrack.name}</Text>
            <Text style={styles.artist}>{currentTrack.artist}</Text>
            <View style={styles.trackInfo}>
              <Text style={styles.infoText}>BPM: {currentTrack.bpm}</Text>
              <Text style={styles.infoText}>Energy: {currentTrack.energy}</Text>
            </View>
            <View style={styles.energyMeter}>
              <Text style={styles.energyLabel}>Energy</Text>
              <Text style={styles.energyBar}>
                {renderEnergyBar(currentTrack.energy)}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.noTrack}>No track playing</Text>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={togglePlayPause}>
          <Text style={styles.buttonText}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={skipNext}>
          <Text style={styles.buttonText}>⏭</Text>
        </TouchableOpacity>
        {isDJMode ? (
          <TouchableOpacity style={styles.djButton} onPress={stopDJ}>
            <Text style={styles.djButtonText}>DJ Mode: ON</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.djButtonOff} onPress={startDJ}>
            <Text style={styles.djButtonText}>Start DJ Mode</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Queue */}
      <View style={styles.queue}>
        <Text style={styles.queueTitle}>Up Next</Text>
        <ScrollView>
          {queue.map((track, index) => (
            <View key={track.id} style={styles.queueItem}>
              <Text style={styles.queueNumber}>{index + 1}</Text>
              <View style={styles.queueInfo}>
                <Text style={styles.queueTrack}>{track.name}</Text>
                <Text style={styles.queueArtist}>{track.artist}</Text>
              </View>
              <Text style={styles.queueBPM}>{track.bpm} BPM</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={connectSpotify}>
          <Text style={styles.actionText}>Connect Spotify</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={loadSamplePlaylist}>
          <Text style={styles.actionText}>Load Sample Playlist</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  nowPlaying: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    margin: 20,
    borderRadius: 15,
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  artist: {
    fontSize: 18,
    color: '#888',
    marginTop: 5,
  },
  trackInfo: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 20,
  },
  infoText: {
    color: '#aaa',
    fontSize: 14,
  },
  energyMeter: {
    marginTop: 20,
    alignItems: 'center',
  },
  energyLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 5,
  },
  energyBar: {
    fontSize: 16,
    letterSpacing: 2,
    color: '#0f0',
  },
  noTrack: {
    color: '#666',
    fontSize: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    padding: 20,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 24,
    color: '#fff',
  },
  djButton: {
    paddingHorizontal: 20,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  djButtonOff: {
    paddingHorizontal: 20,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  djButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  queue: {
    flex: 1,
    padding: 20,
  },
  queueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    marginBottom: 10,
  },
  queueNumber: {
    fontSize: 16,
    color: '#666',
    width: 30,
  },
  queueInfo: {
    flex: 1,
    marginLeft: 10,
  },
  queueTrack: {
    fontSize: 16,
    color: '#fff',
  },
  queueArtist: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  queueBPM: {
    fontSize: 14,
    color: '#0f0',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  actionText: {
    color: '#0f0',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default App;
