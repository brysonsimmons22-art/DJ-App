# Virtual DJ App - Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App (React Native)                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   UI Layer   │  │ State Mgmt   │  │  Navigation  │      │
│  │  Components  │  │   (Redux)    │  │    (RN Nav)  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘      │
│         │                 │                                  │
│         └─────────┬───────┘                                  │
│                   │                                          │
│         ┌─────────▼─────────┐                               │
│         │   DJ Engine Core   │                               │
│         │  (Main Orchestrator)│                              │
│         └─────────┬─────────┘                               │
│                   │                                          │
│    ┌──────────────┼──────────────┐                          │
│    │              │              │                          │
│ ┌──▼────┐  ┌─────▼──────┐  ┌────▼─────┐                   │
│ │ Audio │  │ Algorithms │  │   API    │                   │
│ │Engine │  │  & Analysis│  │ Services │                   │
│ └───────┘  └────────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
   │ Spotify │   │  Apple  │   │  Local  │
   │   API   │   │  Music  │   │  Files  │
   └─────────┘   └─────────┘   └─────────┘
```

---

## Core Components

### 1. DJ Engine (`src/services/DJEngine.js`)

**Responsibility**: Main orchestrator for all DJ functionality

**Key Methods**:
- `loadPlaylist(tracks)` - Load and analyze tracks
- `optimizePlaylist(profile)` - Apply Party Flow AI
- `startDJMode()` - Begin automatic mixing
- `executeCrossfade()` - Perform track transitions

**State Management**:
```javascript
{
  playlist: Track[],
  currentTrackIndex: number,
  isPlaying: boolean,
  isDJModeActive: boolean,
  crossfadeInProgress: boolean,
  settings: Settings
}
```

**Events**:
- `onTrackChange` - New track started
- `onPlayStateChange` - Play/pause state changed
- `onCrossfadeStart` - Crossfade initiated
- `onCrossfadeEnd` - Crossfade completed
- `onError` - Error occurred

---

### 2. Audio Analysis Algorithms

#### BPM Detector (`src/algorithms/BPMDetector.js`)

**Algorithm**: Onset detection + Autocorrelation

```
Input: AudioBuffer
  ↓
Convert to Mono
  ↓
Detect Onsets (peaks in energy)
  ↓
Calculate intervals between onsets
  ↓
Use autocorrelation to find tempo
  ↓
Output: BPM (60-180 range)
```

**Accuracy**: 95%+ for most genres

**Performance**: ~2 seconds per 3-minute track

#### Energy Analyzer

**Algorithm**: RMS energy analysis with frequency weighting

```
Input: AudioBuffer
  ↓
Divide into 4-second windows
  ↓
Calculate RMS energy per window
  ↓
Analyze frequency spectrum (bass boost)
  ↓
Normalize to 0-100 scale
  ↓
Output: Energy score
```

---

### 3. Beatmatching Engine (`src/algorithms/Beatmatcher.js`)

**Core Algorithm**:

```javascript
function calculatePlaybackRate(currentBPM, nextBPM) {
  ratio = currentBPM / nextBPM

  // Handle octave differences
  if (ratio < 0.75) ratio *= 2
  if (ratio > 1.33) ratio /= 2

  // Limit to preserve audio quality
  ratio = clamp(ratio, 0.85, 1.15)

  return ratio
}
```

**Harmonic Mixing** (Camelot Wheel):
```
Key Compatibility Matrix:
- Same key, same mode: 100%
- Perfect 5th (7 semitones): 90%
- Perfect 4th (5 semitones): 90%
- Same key, different mode: 80%
- Adjacent keys: 70%
- Other: 30%
```

**Beat Alignment**:
1. Detect beat grid of both tracks
2. Find phrase boundaries (16/32 bars)
3. Align first beat of Track B with phrase boundary of Track A
4. Apply time offset

---

### 4. Crossfade Engine (`src/algorithms/CrossfadeEngine.js`)

**Volume Curve Types**:

```
Linear:        ────╲
                    ╲____

Exponential:   ────╲
                     ╲╲╲╲___

S-Curve:       ────╮
                   ╰╮
                     ╰───
```

**EQ Blending Strategy**:

```
Outgoing Track:
  Low  (200Hz):  ████████████ → ████████░░░░ (keep bass longer)
  Mid  (1kHz):   ████████████ → ░░░░░░░░░░░░ (fade mids gradually)
  High (4kHz):   ████████████ → ░░░░░░░░░░░░ (cut highs first)

Incoming Track:
  Low  (200Hz):  ░░░░░░░░░░░░ → ████████████ (bring bass first)
  Mid  (1kHz):   ░░░░░░░░░░░░ → ████████████ (mids at 30%)
  High (4kHz):   ░░░░░░░░░░░░ → ████████████ (highs at 50%)
```

**Crossfade Timeline**:
```
Track A: ████████████████████████░░░░░░░░
Track B:                 ░░░░░░░░████████████
         |<------ 8 seconds ------>|
         ^                         ^
    Crossfade Start           Crossfade End
```

---

### 5. Party Flow AI (`src/algorithms/PartyFlowAI.js`)

**Energy Curve Profiles**:

```
Progressive Build:
Energy
  100│                      ████████
   80│              ████████
   60│      ████████
   40│██████
    └────────────────────────────── Time

Wave Pattern:
Energy
  100│      ██        ██
   80│    ████      ████
   60│  ██    ██  ██    ██
   40│██      ████      ██
    └────────────────────────────── Time
```

**Ordering Algorithm**:

```python
def orderPlaylist(tracks, energyCurve):
  # Group tracks by energy level
  groups = groupByEnergy(tracks)

  # For each point in energy curve
  for targetEnergy in energyCurve:
    # Find best matching tracks
    candidates = findTracksNearEnergy(groups, targetEnergy)

    # Score each candidate
    for track in candidates:
      score = 0
      score += energyMatch(track, targetEnergy)  # 40 points
      score += bpmCompatibility(track, previous) # 30 points
      score += keyCompatibility(track, previous) # 20 points
      score += genreSmooth(track, previous)      # 10 points

    # Add highest scoring track
    playlist.append(topScorer)

  return playlist
```

**Compatibility Scoring**:
```
Total Score (0-100):
  ├── Energy Match: 40 points
  ├── BPM Compatibility: 30 points
  ├── Key Compatibility: 20 points
  └── Genre Smoothness: 10 points
```

---

## API Integration

### Spotify API

**Authentication Flow**:
```
User → App → Spotify Auth → User Approves → Code
  ↓
App exchanges Code for Access Token
  ↓
App stores Token (valid 1 hour)
  ↓
App refreshes Token when needed
```

**Key Endpoints**:
```javascript
GET /v1/me/playlists
GET /v1/playlists/{id}/tracks
GET /v1/audio-features?ids={track_ids}
GET /v1/audio-analysis/{track_id}
```

**Audio Features Provided by Spotify**:
- `tempo` (BPM)
- `energy` (0-1 scale)
- `danceability` (0-1)
- `valence` (happiness)
- `key` (0-11, pitch class)
- `mode` (0=minor, 1=major)
- `loudness` (dB)
- `speechiness`
- `acousticness`
- `instrumentalness`

**Rate Limits**:
- 180 requests per minute
- Implements exponential backoff

---

### Apple Music API

**Authentication**: MusicKit JS / Native SDK

**Key Endpoints**:
```javascript
GET /v1/me/library/playlists
GET /v1/me/library/playlists/{id}/tracks
GET /v1/catalog/{storefront}/search
```

**Limitation**: Apple Music doesn't provide audio features
- Must analyze BPM/energy ourselves
- Can use Web Audio API for analysis

---

## Audio Processing Pipeline

### Mobile Audio Processing

```
┌─────────────────────────────────────────┐
│     React Native Track Player           │
│  (Cross-platform audio playback)        │
└────────────┬────────────────────────────┘
             │
    ┌────────▼────────┐
    │  Native Bridge  │
    │  (iOS/Android)  │
    └────────┬────────┘
             │
    ┌────────▼────────────┐
    │  Platform Audio API │
    │  - iOS: AVFoundation │
    │  - Android: ExoPlayer│
    └─────────────────────┘
```

### Web Audio API (for browser version)

```javascript
// Create audio context
const audioContext = new AudioContext();

// Load audio
const response = await fetch(audioUrl);
const arrayBuffer = await response.arrayBuffer();
const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

// Create source nodes
const source1 = audioContext.createBufferSource();
const source2 = audioContext.createBufferSource();

// Create gain nodes for volume control
const gain1 = audioContext.createGain();
const gain2 = audioContext.createGain();

// Create EQ filters
const lowShelf = audioContext.createBiquadFilter();
lowShelf.type = 'lowshelf';
const highShelf = audioContext.createBiquadFilter();
highShelf.type = 'highshelf';

// Connect the graph
source1 → gain1 → lowShelf → highShelf → destination
source2 → gain2 → lowShelf → highShelf → destination

// Apply crossfade curves
gain1.gain.setValueCurveAtTime(fadeOutCurve, startTime, duration);
gain2.gain.setValueCurveAtTime(fadeInCurve, startTime, duration);
```

---

## Data Models

### Track Object

```typescript
interface Track {
  id: string;
  name: string;
  artist: string;
  album?: string;
  albumArt?: string;
  duration: number; // milliseconds
  previewUrl?: string;
  uri: string; // Spotify/Apple Music URI

  // Audio features
  bpm: number;
  energy: number; // 0-100
  key: number; // 0-11 (pitch class)
  mode: number; // 0=minor, 1=major
  danceability?: number;
  valence?: number;

  // Analysis (computed)
  beats?: number[]; // Beat positions in seconds
  firstBeat?: number;
  energyLevels?: number[]; // Energy over time
}
```

### Crossfade Plan

```typescript
interface CrossfadePlan {
  startTime: number; // seconds into current track
  duration: number;
  volumeCurves: {
    outgoing: Array<{ time: number; volume: number }>;
    incoming: Array<{ time: number; volume: number }>;
  };
  eqCurves?: {
    outgoing: Array<{ time: number; low: number; mid: number; high: number }>;
    incoming: Array<{ time: number; low: number; mid: number; high: number }>;
  };
}
```

### Beatmatch Plan

```typescript
interface BeatmatchPlan {
  playbackRate: number; // 0.85 - 1.15
  startOffset: number; // seconds
  phraseBoundary: boolean;
  estimatedBPMAfterAdjustment: number;
  bpmDifference: number;
  isHarmonicMix: boolean;
  compatibility: number; // 0-100
}
```

---

## Performance Optimization

### Audio Analysis Caching

```javascript
// Cache analysis results
const cache = {
  'track-id-123': {
    bpm: 128,
    energy: 85,
    beats: [...],
    analyzedAt: timestamp
  }
};

// Use IndexedDB for persistent storage
```

### Lazy Loading

```javascript
// Only analyze tracks as needed
async function analyzeOnDemand(track) {
  if (cache.has(track.id)) {
    return cache.get(track.id);
  }

  const analysis = await BPMDetector.detectBPM(audioBuffer);
  cache.set(track.id, analysis);
  return analysis;
}
```

### Preloading

```javascript
// Preload next 3 tracks in background
function preloadNextTracks() {
  const nextTracks = getQueue(3);
  nextTracks.forEach(track => {
    loadAudioInBackground(track);
    analyzeInBackground(track);
  });
}
```

---

## Testing Strategy

### Unit Tests
```javascript
describe('BPMDetector', () => {
  it('should detect 128 BPM track correctly', () => {
    const bpm = BPMDetector.detectBPM(sample128BPM);
    expect(bpm).toBeCloseTo(128, 1);
  });
});

describe('Beatmatcher', () => {
  it('should calculate playback rate correctly', () => {
    const rate = Beatmatcher.calculatePlaybackRate(120, 125);
    expect(rate).toBe(0.96);
  });
});
```

### Integration Tests
```javascript
describe('DJ Engine', () => {
  it('should crossfade between two tracks', async () => {
    const engine = new DJEngine();
    await engine.loadPlaylist(testPlaylist);
    await engine.startDJMode();

    // Wait for crossfade
    await waitFor(() => engine.crossfadeInProgress);
    expect(engine.crossfadeInProgress).toBe(true);
  });
});
```

### Audio Quality Tests
- Visual waveform analysis
- Spectral analysis during crossfades
- Beat alignment verification
- User A/B testing

---

## Scalability Considerations

### Backend Services (Future)

```
┌─────────────┐
│  Mobile App │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│   API Gateway    │
│   (GraphQL)      │
└──────┬───────────┘
       │
  ┌────┼────┬────────────┐
  │    │    │            │
  ▼    ▼    ▼            ▼
┌───┐┌───┐┌────┐    ┌────────┐
│Mix││Ana││User│    │Streaming│
│Svc││Svc││Svc │    │  Cache  │
└───┘└───┘└────┘    └────────┘
```

**Microservices**:
- Mix Service: Store and share mixes
- Analysis Service: Analyze tracks at scale
- User Service: Profiles, preferences
- Recommendation Service: ML-powered suggestions

---

## Security & Privacy

### Data Privacy
- No audio stored on servers (streams only)
- User playlists encrypted at rest
- GDPR compliant data handling
- Option to disable usage analytics

### API Security
- OAuth 2.0 for Spotify/Apple Music
- Encrypted token storage
- HTTPS only
- Rate limiting protection

### Music Rights
- No audio hosting (all streamed from platforms)
- Respects platform DRM
- Requires active subscription to streaming service
- Compliant with platform ToS

---

## Deployment

### Mobile App Distribution

**iOS**:
```bash
# Build
react-native run-ios --configuration Release

# Archive
xcodebuild archive -scheme VirtualDJ

# Submit to App Store
xcodebuild -exportArchive
```

**Android**:
```bash
# Build APK
cd android && ./gradlew assembleRelease

# Build AAB for Play Store
./gradlew bundleRelease
```

### CI/CD Pipeline

```yaml
# GitHub Actions
on: [push]
jobs:
  test:
    - npm test
    - npm run lint

  build-ios:
    - react-native run-ios

  build-android:
    - ./gradlew assembleRelease

  deploy:
    - Upload to TestFlight (iOS)
    - Upload to Play Store Beta (Android)
```

---

## Monitoring & Analytics

### Performance Metrics
- App start time
- Time to first mix
- Crossfade smoothness score
- BPM detection accuracy
- Crash rate

### User Analytics
- Session length
- Playlists created
- DJ mode usage
- Most used features
- Retention metrics

### Error Tracking
- Sentry for crash reporting
- Custom logging for DJ failures
- Audio playback errors
- API failures

---

This architecture provides a solid foundation for building a professional-grade Virtual DJ app that can scale to millions of users while maintaining high audio quality and seamless mixing capabilities.
