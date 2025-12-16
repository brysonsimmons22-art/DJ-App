/**
 * Settings Screen - DJ Settings and Preferences
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';

const SettingsScreen = () => {
  const [crossfadeDuration, setCrossfadeDuration] = useState(8);
  const [beatmatchSensitivity, setBeatmatchSensitivity] = useState(7);
  const [harmonicMixing, setHarmonicMixing] = useState(true);
  const [autoEQ, setAutoEQ] = useState(true);
  const [vocalDetection, setVocalDetection] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(true);
  const [appleMusicConnected, setAppleMusicConnected] = useState(false);

  const renderSlider = (value, max, onChange) => {
    return (
      <View style={styles.slider}>
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${(value / max) * 100}%` }]} />
          <View style={[styles.sliderThumb, { left: `${(value / max) * 100}%` }]} />
        </View>
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>Low</Text>
          <Text style={styles.sliderValue}>{value}</Text>
          <Text style={styles.sliderLabel}>High</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* DJ Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎚️ DJ SETTINGS</Text>

          {/* Crossfade Duration */}
          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingLabel}>Crossfade Duration</Text>
              <Text style={styles.settingValue}>{crossfadeDuration} seconds</Text>
            </View>
            {renderSlider(crossfadeDuration, 16, setCrossfadeDuration)}
            <Text style={styles.settingDescription}>
              Length of transition between songs (4-16 seconds)
            </Text>
          </View>

          {/* Beatmatch Sensitivity */}
          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingLabel}>Beatmatch Sensitivity</Text>
              <Text style={styles.settingValue}>{beatmatchSensitivity}/10</Text>
            </View>
            {renderSlider(beatmatchSensitivity, 10, setBeatmatchSensitivity)}
            <Text style={styles.settingDescription}>
              How precisely beats should align during mixing
            </Text>
          </View>

          {/* Party Flow Style */}
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>Party Flow Style</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity style={styles.radioOptionActive}>
                <View style={styles.radioDotActive} />
                <Text style={styles.radioTextActive}>Progressive Build</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioOption}>
                <View style={styles.radioDot} />
                <Text style={styles.radioText}>Wave Pattern</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioOption}>
                <View style={styles.radioDot} />
                <Text style={styles.radioText}>High Energy Constant</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioOption}>
                <View style={styles.radioDot} />
                <Text style={styles.radioText}>Chill Vibe</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Music Sources Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎵 MUSIC SOURCES</Text>

          {/* Spotify */}
          <View style={styles.sourceCard}>
            <View style={styles.sourceInfo}>
              <View style={styles.sourceIcon}>
                <Text style={styles.sourceIconText}>S</Text>
              </View>
              <View style={styles.sourceDetails}>
                <Text style={styles.sourceName}>Spotify</Text>
                {spotifyConnected && (
                  <Text style={styles.sourceStatus}>Connected • Premium</Text>
                )}
              </View>
            </View>
            {spotifyConnected ? (
              <TouchableOpacity style={styles.disconnectButton}>
                <Text style={styles.disconnectText}>Disconnect</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.connectButton}>
                <Text style={styles.connectText}>Connect</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Apple Music */}
          <View style={styles.sourceCard}>
            <View style={styles.sourceInfo}>
              <View style={[styles.sourceIcon, { backgroundColor: '#ff3b30' }]}>
                <Text style={styles.sourceIconText}>A</Text>
              </View>
              <View style={styles.sourceDetails}>
                <Text style={styles.sourceName}>Apple Music</Text>
                {!appleMusicConnected && (
                  <Text style={styles.sourceStatusDisconnected}>Not connected</Text>
                )}
              </View>
            </View>
            {appleMusicConnected ? (
              <TouchableOpacity style={styles.disconnectButton}>
                <Text style={styles.disconnectText}>Disconnect</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.connectButton}>
                <Text style={styles.connectText}>Connect</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Local Files */}
          <View style={styles.sourceCard}>
            <View style={styles.sourceInfo}>
              <View style={[styles.sourceIcon, { backgroundColor: '#666' }]}>
                <Text style={styles.sourceIconText}>📁</Text>
              </View>
              <View style={styles.sourceDetails}>
                <Text style={styles.sourceName}>Local Files</Text>
                <Text style={styles.sourceStatusDisconnected}>Coming soon</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.disabledButton}>
              <Text style={styles.disabledText}>Soon</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Advanced Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 ADVANCED</Text>

          {/* Toggle Settings */}
          <View style={styles.toggleCard}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Harmonic Mixing</Text>
                <Text style={styles.toggleDescription}>
                  Mix songs in compatible musical keys
                </Text>
              </View>
              <Switch
                value={harmonicMixing}
                onValueChange={setHarmonicMixing}
                trackColor={{ false: '#2a2a2a', true: '#00ff0066' }}
                thumbColor={harmonicMixing ? '#00ff00' : '#666'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Auto-EQ Adjustment</Text>
                <Text style={styles.toggleDescription}>
                  Automatically blend frequencies during transitions
                </Text>
              </View>
              <Switch
                value={autoEQ}
                onValueChange={setAutoEQ}
                trackColor={{ false: '#2a2a2a', true: '#00ff0066' }}
                thumbColor={autoEQ ? '#00ff00' : '#666'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Vocal Detection</Text>
                <Text style={styles.toggleDescription}>
                  Avoid mixing during vocals
                </Text>
              </View>
              <Switch
                value={vocalDetection}
                onValueChange={setVocalDetection}
                trackColor={{ false: '#2a2a2a', true: '#00ff0066' }}
                thumbColor={vocalDetection ? '#00ff00' : '#666'}
              />
            </View>
          </View>
        </View>

        {/* Audio Quality Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎧 AUDIO QUALITY</Text>

          <View style={styles.qualityCard}>
            <TouchableOpacity style={styles.qualityOption}>
              <View style={styles.radioDot} />
              <View>
                <Text style={styles.qualityText}>Normal</Text>
                <Text style={styles.qualitySubtext}>128 kbps</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.qualityOptionActive}>
              <View style={styles.radioDotActive} />
              <View>
                <Text style={styles.qualityTextActive}>High</Text>
                <Text style={styles.qualitySubtextActive}>320 kbps</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.qualityOption}>
              <View style={styles.radioDot} />
              <View>
                <Text style={styles.qualityText}>Very High</Text>
                <Text style={styles.qualitySubtext}>FLAC • Premium only</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ ABOUT</Text>

          <View style={styles.aboutCard}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Version</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Build</Text>
              <Text style={styles.aboutValue}>2024.01</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>License</Text>
              <Text style={styles.aboutValue}>Premium</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Text style={styles.linkIcon}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Terms of Service</Text>
            <Text style={styles.linkIcon}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Open Source Licenses</Text>
            <Text style={styles.linkIcon}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <View style={styles.dangerCard}>
            <TouchableOpacity style={styles.dangerButton}>
              <Text style={styles.dangerText}>Sign Out</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dangerButton}>
              <Text style={styles.dangerText}>Clear Cache</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  content: {
    flex: 1,
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  settingCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00ff00',
  },
  slider: {
    marginBottom: 10,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#00ff00',
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00ff00',
    marginLeft: -8,
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 11,
    color: '#666',
  },
  sliderValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00ff00',
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  radioGroup: {
    marginTop: 15,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  radioOptionActive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  radioDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2a2a2a',
    marginRight: 12,
  },
  radioDotActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00ff00',
    marginRight: 12,
    backgroundColor: '#00ff00',
  },
  radioText: {
    fontSize: 15,
    color: '#888',
  },
  radioTextActive: {
    fontSize: 15,
    color: '#00ff00',
    fontWeight: '600',
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sourceIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#1ed760',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  sourceIconText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  sourceDetails: {
    flex: 1,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 3,
  },
  sourceStatus: {
    fontSize: 12,
    color: '#00ff00',
  },
  sourceStatusDisconnected: {
    fontSize: 12,
    color: '#666',
  },
  connectButton: {
    backgroundColor: '#00ff00',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  connectText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  disconnectButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  disconnectText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
  },
  disabledButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  disabledText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#444',
  },
  toggleCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 3,
  },
  toggleDescription: {
    fontSize: 12,
    color: '#666',
    maxWidth: '80%',
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2a2a',
    marginVertical: 15,
  },
  qualityCard: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  qualityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  qualityOptionActive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  qualityText: {
    fontSize: 15,
    color: '#888',
    marginBottom: 2,
  },
  qualityTextActive: {
    fontSize: 15,
    color: '#00ff00',
    fontWeight: '600',
    marginBottom: 2,
  },
  qualitySubtext: {
    fontSize: 11,
    color: '#666',
  },
  qualitySubtextActive: {
    fontSize: 11,
    color: '#00ff0088',
  },
  aboutCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  aboutLabel: {
    fontSize: 14,
    color: '#888',
  },
  aboutValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  linkText: {
    fontSize: 14,
    color: '#fff',
  },
  linkIcon: {
    fontSize: 16,
    color: '#666',
  },
  dangerCard: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ff000033',
  },
  dangerButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ff3333',
  },
});

export default SettingsScreen;
