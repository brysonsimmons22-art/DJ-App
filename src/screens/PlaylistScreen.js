/**
 * Playlist Screen - Create and Manage Playlists
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const PlaylistScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [optimization, setOptimization] = useState(75);

  const playlist = [
    {
      id: '1',
      name: 'Blinding Lights',
      artist: 'The Weeknd',
      bpm: 171,
      energy: 85,
      key: 'C',
      mode: 'Major',
      compatibility: 95,
      duration: '3:20'
    },
    {
      id: '2',
      name: 'Levitating',
      artist: 'Dua Lipa',
      bpm: 103,
      energy: 80,
      key: 'D',
      mode: 'Major',
      compatibility: 87,
      duration: '3:23'
    },
    {
      id: '3',
      name: 'Uptown Funk',
      artist: 'Mark Ronson ft. Bruno Mars',
      bpm: 115,
      energy: 82,
      key: 'G',
      mode: 'Major',
      compatibility: 92,
      duration: '4:29'
    },
    {
      id: '4',
      name: 'Don\'t Start Now',
      artist: 'Dua Lipa',
      bpm: 124,
      energy: 83,
      key: 'D',
      mode: 'Minor',
      compatibility: 89,
      duration: '3:03'
    },
  ];

  const renderEnergyBar = (energy) => {
    const filled = Math.floor(energy / 20);
    return (
      <View style={styles.miniEnergyBar}>
        {[...Array(5)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.miniEnergyBlock,
              {
                backgroundColor: i < filled ? '#00ff00' : '#2a2a2a',
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderPlaylistItem = ({ item, index }) => (
    <View style={styles.playlistItem}>
      {/* Drag Handle */}
      <View style={styles.dragHandle}>
        <Text style={styles.dragIcon}>⋮⋮</Text>
      </View>

      {/* Index */}
      <View style={styles.indexCircle}>
        <Text style={styles.indexText}>{index + 1}</Text>
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={styles.trackName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {item.artist}
        </Text>

        {/* Track Metadata */}
        <View style={styles.trackMetadata}>
          <View style={styles.metadataTag}>
            <Text style={styles.metadataText}>{item.bpm} BPM</Text>
          </View>
          <View style={styles.metadataTag}>
            <Text style={styles.metadataText}>{item.key} {item.mode}</Text>
          </View>
          <View style={styles.metadataTag}>
            <Text style={styles.metadataText}>{item.duration}</Text>
          </View>
        </View>
      </View>

      {/* Right Side Info */}
      <View style={styles.rightInfo}>
        {/* Energy Bar */}
        {renderEnergyBar(item.energy)}

        {/* Compatibility Badge */}
        <View
          style={[
            styles.compatibilityCircle,
            {
              borderColor:
                item.compatibility >= 90
                  ? '#00ff00'
                  : item.compatibility >= 75
                  ? '#ffff00'
                  : '#ff6600',
            },
          ]}
        >
          <Text
            style={[
              styles.compatibilityText,
              {
                color:
                  item.compatibility >= 90
                    ? '#00ff00'
                    : item.compatibility >= 75
                    ? '#ffff00'
                    : '#ff6600',
              },
            ]}
          >
            {item.compatibility}%
          </Text>
        </View>
      </View>

      {/* More Options */}
      <TouchableOpacity style={styles.moreButton}>
        <Text style={styles.moreIcon}>⋯</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Party Mix</Text>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveIcon}>✓</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Add songs..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* AI Optimization Panel */}
      <View style={styles.optimizationPanel}>
        <View style={styles.optimizationHeader}>
          <View>
            <Text style={styles.optimizationTitle}>AI OPTIMIZATION</Text>
            <Text style={styles.optimizationSubtitle}>Party Flow Analysis</Text>
          </View>
          <View style={styles.optimizationScore}>
            <Text style={styles.optimizationValue}>{optimization}%</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${optimization}%` }]} />
        </View>

        {/* Flow Profile Selector */}
        <View style={styles.flowProfiles}>
          <TouchableOpacity style={styles.flowProfileActive}>
            <Text style={styles.flowProfileTextActive}>🚀 Progressive</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.flowProfile}>
            <Text style={styles.flowProfileText}>🌊 Wave</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.flowProfile}>
            <Text style={styles.flowProfileText}>⚡ High Energy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.flowProfile}>
            <Text style={styles.flowProfileText}>😎 Chill</Text>
          </TouchableOpacity>
        </View>

        {/* Optimize Button */}
        <TouchableOpacity style={styles.optimizeButton}>
          <Text style={styles.optimizeButtonText}>🤖 OPTIMIZE ORDER</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{playlist.length}</Text>
          <Text style={styles.statLabel}>TRACKS</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>17:15</Text>
          <Text style={styles.statLabel}>DURATION</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>128</Text>
          <Text style={styles.statLabel}>AVG BPM</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>82</Text>
          <Text style={styles.statLabel}>AVG ENERGY</Text>
        </View>
      </View>

      {/* Playlist Items */}
      <FlatList
        data={playlist}
        renderItem={renderPlaylistItem}
        keyExtractor={(item) => item.id}
        style={styles.playlistList}
        contentContainerStyle={styles.playlistContent}
      />

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>+</Text>
          <Text style={styles.actionText}>Add Songs</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startButtonText}>▶ START DJ MODE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  saveButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00ff00',
    borderRadius: 20,
  },
  saveIcon: {
    fontSize: 20,
    color: '#000',
  },
  searchSection: {
    padding: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  optimizationPanel: {
    margin: 20,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#00ff0044',
  },
  optimizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  optimizationTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00ff00',
    letterSpacing: 1,
  },
  optimizationSubtitle: {
    fontSize: 10,
    color: '#666',
    marginTop: 3,
  },
  optimizationScore: {
    backgroundColor: '#00ff0022',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  optimizationValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00ff00',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ff00',
    borderRadius: 4,
  },
  flowProfiles: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
  },
  flowProfile: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#0f0f0f',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  flowProfileActive: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#00ff0022',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  flowProfileText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
  flowProfileTextActive: {
    fontSize: 10,
    color: '#00ff00',
    textAlign: 'center',
    fontWeight: '700',
  },
  optimizeButton: {
    backgroundColor: '#00ff00',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  optimizeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00ff00',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 9,
    color: '#666',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  playlistList: {
    flex: 1,
  },
  playlistContent: {
    paddingHorizontal: 20,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  dragHandle: {
    marginRight: 10,
  },
  dragIcon: {
    fontSize: 16,
    color: '#444',
  },
  indexCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  indexText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 3,
  },
  trackArtist: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  trackMetadata: {
    flexDirection: 'row',
    gap: 6,
  },
  metadataTag: {
    backgroundColor: '#0f0f0f',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  metadataText: {
    fontSize: 9,
    color: '#00ff00',
    fontWeight: '600',
  },
  rightInfo: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  miniEnergyBar: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  miniEnergyBlock: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  compatibilityCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f0f',
  },
  compatibilityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  moreButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 5,
  },
  moreIcon: {
    fontSize: 20,
    color: '#666',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    backgroundColor: '#0a0a0a',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    gap: 8,
  },
  actionIcon: {
    fontSize: 20,
    color: '#00ff00',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00ff00',
  },
  startButton: {
    flex: 2,
    backgroundColor: '#00ff00',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
  },
});

export default PlaylistScreen;
