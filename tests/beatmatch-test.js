/**
 * Beatmatching Algorithm Test
 * Tests beatmatching and tempo synchronization with sample tracks
 */

// Mock Beatmatcher implementation for standalone testing
const Beatmatcher = {
  maxBPMDifference: 0.5,

  calculatePlaybackRate(currentBPM, nextBPM) {
    if (!currentBPM || !nextBPM) {
      return 1.0;
    }

    const ratio = currentBPM / nextBPM;
    let adjustedRatio = ratio;

    if (ratio < 0.75) {
      adjustedRatio = ratio * 2;
    } else if (ratio > 1.33) {
      adjustedRatio = ratio / 2;
    }

    adjustedRatio = Math.max(0.85, Math.min(1.15, adjustedRatio));

    return Math.round(adjustedRatio * 1000) / 1000;
  },

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
  },

  alignBeats(currentBeats, nextBeats, transitionPoint) {
    if (!currentBeats.length || !nextBeats.length) {
      return 0;
    }

    const currentBeat = this.findClosestBeat(currentBeats, transitionPoint);
    const nextFirstBeat = nextBeats[0];
    const offset = currentBeat - nextFirstBeat;

    return offset;
  },

  findPhraseTransitionPoint(beats, idealTime, barsInPhrase = 16) {
    if (beats.length < barsInPhrase * 4) {
      return idealTime;
    }

    const beatsPerPhrase = barsInPhrase * 4;
    const phraseBoundaries = [];

    for (let i = 0; i < beats.length; i += beatsPerPhrase) {
      phraseBoundaries.push(beats[i]);
    }

    return this.findClosestBeat(phraseBoundaries, idealTime);
  },

  areCompatible(bpm1, bpm2) {
    const ratio = Math.max(bpm1, bpm2) / Math.min(bpm1, bpm2);
    const withinRange = ratio <= 1.15;
    const doubleHalf = Math.abs(ratio - 2.0) < 0.1 || Math.abs(ratio - 0.5) < 0.1;

    return withinRange || doubleHalf;
  },

  getKeyCompatibility(key1, key2, mode1, mode2) {
    if (key1 === key2 && mode1 === mode2) return 1.0;
    if (key1 === key2) return 0.8;
    if ((key2 - key1 + 12) % 12 === 7 && mode1 === mode2) return 0.9;
    if ((key1 - key2 + 12) % 12 === 7 && mode1 === mode2) return 0.9;
    if (Math.abs(key1 - key2) === 1 && mode1 === mode2) return 0.7;
    return 0.3;
  },

  calculateCompatibility(track1, track2) {
    let score = 100;

    const bpmRatio = Math.max(track1.bpm, track2.bpm) / Math.min(track1.bpm, track2.bpm);
    if (bpmRatio > 1.15) {
      score -= (bpmRatio - 1.15) * 100;
    }

    if (track1.key !== null && track2.key !== null) {
      const keyCompatibility = this.getKeyCompatibility(track1.key, track2.key, track1.mode, track2.mode);
      score += keyCompatibility * 30 - 30;
    }

    if (track1.energy !== null && track2.energy !== null) {
      const energyDiff = Math.abs(track1.energy - track2.energy);
      score -= energyDiff / 5;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  },

  generateBeatmatchPlan(currentTrack, nextTrack, transitionStartTime) {
    const playbackRate = this.calculatePlaybackRate(currentTrack.bpm, nextTrack.bpm);

    const plan = {
      playbackRate: playbackRate,
      startOffset: 0,
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
};

// Sample tracks with more detailed metadata
const testTracks = [
  {
    id: '1',
    name: 'Get Lucky',
    artist: 'Daft Punk',
    bpm: 116,
    energy: 75,
    key: 6, // F#
    mode: 1, // Major
    duration: 367000
  },
  {
    id: '2',
    name: 'One More Time',
    artist: 'Daft Punk',
    bpm: 122,
    energy: 88,
    key: 6, // F#
    mode: 1, // Major
    duration: 320000
  },
  {
    id: '3',
    name: 'Around the World',
    artist: 'Daft Punk',
    bpm: 121,
    energy: 85,
    key: 1, // C# (or Db)
    mode: 1, // Major
    duration: 429000
  },
  {
    id: '4',
    name: 'Starboy',
    artist: 'The Weeknd',
    bpm: 106,
    energy: 72,
    key: 7, // G
    mode: 0, // Minor
    duration: 230000
  },
  {
    id: '5',
    name: 'I Feel It Coming',
    artist: 'The Weeknd',
    bpm: 93,
    energy: 65,
    key: 7, // G
    mode: 0, // Minor
    duration: 269000
  },
  {
    id: '6',
    name: 'Shut Up and Dance',
    artist: 'Walk the Moon',
    bpm: 128,
    energy: 90,
    key: 4, // E
    mode: 1, // Major
    duration: 199000
  }
];

// Helper function to generate beat grid
function generateBeatGrid(bpm, durationMs) {
  const durationSeconds = durationMs / 1000;
  const beatInterval = 60 / bpm;
  const beats = [];

  for (let t = 0; t < durationSeconds; t += beatInterval) {
    beats.push(t);
  }

  return beats;
}

// Test runner
console.log('========================================');
console.log('🎧 BEATMATCHING ALGORITHM TEST SUITE 🎧');
console.log('========================================\n');

// Test 1: Playback rate calculation
console.log('TEST 1: Playback Rate Calculation');
console.log('-----------------------------------');
const testPairs = [
  { from: 120, to: 125 },
  { from: 128, to: 120 },
  { from: 100, to: 130 },
  { from: 174, to: 128 }
];

testPairs.forEach(pair => {
  const rate = Beatmatcher.calculatePlaybackRate(pair.from, pair.to);
  const adjustedBPM = pair.to * rate;
  const difference = Math.abs(pair.from - adjustedBPM);

  console.log(`${pair.from} BPM → ${pair.to} BPM`);
  console.log(`  Playback rate: ${rate}x`);
  console.log(`  Adjusted BPM: ${adjustedBPM.toFixed(1)}`);
  console.log(`  Difference: ${difference.toFixed(1)} BPM ${difference < 1 ? '✓' : '⚠'}`);
  console.log('');
});

// Test 2: BPM compatibility check
console.log('TEST 2: BPM Compatibility Analysis');
console.log('-----------------------------------');
for (let i = 0; i < testTracks.length - 1; i++) {
  const track1 = testTracks[i];
  const track2 = testTracks[i + 1];
  const compatible = Beatmatcher.areCompatible(track1.bpm, track2.bpm);

  console.log(`${track1.name} (${track1.bpm}) → ${track2.name} (${track2.bpm})`);
  console.log(`  ${compatible ? '✓ Compatible' : '✗ Challenging'}`);
}
console.log('\n');

// Test 3: Key compatibility (harmonic mixing)
console.log('TEST 3: Harmonic Mixing Analysis');
console.log('-----------------------------------');
const keyNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const modeNames = ['Minor', 'Major'];

for (let i = 0; i < testTracks.length - 1; i++) {
  const track1 = testTracks[i];
  const track2 = testTracks[i + 1];
  const compatibility = Beatmatcher.getKeyCompatibility(
    track1.key,
    track2.key,
    track1.mode,
    track2.mode
  );

  const key1 = `${keyNames[track1.key]} ${modeNames[track1.mode]}`;
  const key2 = `${keyNames[track2.key]} ${modeNames[track2.mode]}`;

  console.log(`${track1.name} (${key1}) → ${track2.name} (${key2})`);
  console.log(`  Compatibility: ${(compatibility * 100).toFixed(0)}% ${getCompatibilityLabel(compatibility)}`);
}
console.log('\n');

// Test 4: Full beatmatch plan generation
console.log('TEST 4: Complete Beatmatch Plan Generation');
console.log('-----------------------------------');
for (let i = 0; i < testTracks.length - 1; i++) {
  const current = testTracks[i];
  const next = testTracks[i + 1];

  console.log(`\nMix ${i + 1}: "${current.name}" → "${next.name}"`);
  console.log('─────────────────────────────────────────');

  const plan = Beatmatcher.generateBeatmatchPlan(current, next, 0);

  console.log(`Track 1: ${current.bpm} BPM, ${keyNames[current.key]} ${modeNames[current.mode]}, Energy ${current.energy}`);
  console.log(`Track 2: ${next.bpm} BPM, ${keyNames[next.key]} ${modeNames[next.mode]}, Energy ${next.energy}`);
  console.log('');
  console.log(`Beatmatch Plan:`);
  console.log(`  • Playback Rate: ${plan.playbackRate}x`);
  console.log(`  • Adjusted BPM: ${plan.estimatedBPMAfterAdjustment.toFixed(1)}`);
  console.log(`  • BPM Difference: ${plan.bpmDifference.toFixed(2)} BPM`);
  console.log(`  • Harmonic Mix: ${plan.isHarmonicMix ? '✓ Yes' : '✗ No'}`);
  console.log(`  • Overall Compatibility: ${plan.compatibility}/100 ${getScoreLabel(plan.compatibility)}`);
}
console.log('\n');

// Test 5: Beat alignment simulation
console.log('TEST 5: Beat Grid Alignment');
console.log('-----------------------------------');
const track1 = testTracks[0];
const track2 = testTracks[1];

const beats1 = generateBeatGrid(track1.bpm, track1.duration);
const beats2 = generateBeatGrid(track2.bpm, track2.duration);

console.log(`Track 1 (${track1.name}): ${beats1.length} beats`);
console.log(`Track 2 (${track2.name}): ${beats2.length} beats`);
console.log('');

const transitionPoint = 260; // Start transition at 260 seconds
const phrasePoint = Beatmatcher.findPhraseTransitionPoint(beats1, transitionPoint, 16);
const offset = Beatmatcher.alignBeats(beats1, beats2, phrasePoint);

console.log(`Ideal transition point: ${transitionPoint}s`);
console.log(`Phrase-aligned point: ${phrasePoint.toFixed(2)}s`);
console.log(`Beat offset required: ${offset.toFixed(3)}s`);
console.log('');

// Show beat grid around transition
console.log('Beat grid around transition:');
const transitionIndex = beats1.findIndex(b => b >= phrasePoint);
console.log(`Track 1 beats: ...${beats1.slice(transitionIndex - 2, transitionIndex + 3).map(b => b.toFixed(2)).join(', ')}...`);
console.log(`Track 2 beats (aligned): ...${beats2.slice(0, 5).map(b => (b + offset).toFixed(2)).join(', ')}...`);
console.log('\n');

// Test 6: Comprehensive compatibility matrix
console.log('TEST 6: Track Compatibility Matrix');
console.log('-----------------------------------');
console.log('Compatibility scores (0-100) for all track pairs:\n');

// Header
process.stdout.write('        ');
testTracks.forEach((_, i) => process.stdout.write(`T${i + 1}  `));
console.log('');

// Matrix
testTracks.forEach((track1, i) => {
  process.stdout.write(`Track ${i + 1} `);
  testTracks.forEach((track2, j) => {
    if (i === j) {
      process.stdout.write('--- ');
    } else {
      const score = Beatmatcher.calculateCompatibility(track1, track2);
      process.stdout.write(`${score.toString().padStart(3)} `);
    }
  });
  console.log('');
});
console.log('\n');

// Summary
console.log('========================================');
console.log('✓ All beatmatching tests completed!');
console.log('========================================');
console.log('\nKey Insights:');
console.log('• BPM differences under 10% can be matched easily');
console.log('• Harmonic mixing (compatible keys) improves mix quality');
console.log('• Phrase alignment (16/32 bar boundaries) sounds professional');
console.log('• Energy flow should be gradual for best results');
console.log('\nBest Mixes from Test:');

// Find best compatibility scores
const compatibilityScores = [];
for (let i = 0; i < testTracks.length - 1; i++) {
  const score = Beatmatcher.calculateCompatibility(testTracks[i], testTracks[i + 1]);
  compatibilityScores.push({
    from: testTracks[i].name,
    to: testTracks[i + 1].name,
    score: score
  });
}

compatibilityScores
  .sort((a, b) => b.score - a.score)
  .slice(0, 3)
  .forEach((mix, i) => {
    console.log(`${i + 1}. ${mix.from} → ${mix.to} (${mix.score}/100)`);
  });

// Helper functions
function getCompatibilityLabel(compatibility) {
  if (compatibility >= 0.9) return '🟢 Perfect';
  if (compatibility >= 0.7) return '🟡 Good';
  if (compatibility >= 0.5) return '🟠 Fair';
  return '🔴 Poor';
}

function getScoreLabel(score) {
  if (score >= 90) return '🟢 Excellent';
  if (score >= 75) return '🟡 Good';
  if (score >= 60) return '🟠 Fair';
  return '🔴 Challenging';
}
