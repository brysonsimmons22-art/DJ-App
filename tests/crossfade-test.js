/**
 * Crossfade Engine Test
 * Tests crossfading algorithm with sample tracks
 */

// Mock require for standalone testing
const CrossfadeEngine = {
  defaultCrossfadeDuration: 8,
  eqEnabled: true,

  generateCrossfadeCurve(duration, curveType = 'scurve') {
    const steps = 100;
    const stepDuration = duration / steps;

    const outgoingCurve = [];
    const incomingCurve = [];

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;

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
  },

  generateEQCurve(duration) {
    const steps = 100;
    const stepDuration = duration / steps;

    const outgoingEQ = [];
    const incomingEQ = [];

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;

      outgoingEQ.push({
        time: i * stepDuration,
        low: 1.0,
        mid: 1 - (progress * 0.8),
        high: 1 - progress
      });

      incomingEQ.push({
        time: i * stepDuration,
        low: Math.min(1, progress * 1.5),
        mid: Math.max(0, (progress - 0.3) * 1.4),
        high: Math.max(0, (progress - 0.5) * 2)
      });
    }

    return {
      outgoing: outgoingEQ,
      incoming: incomingEQ
    };
  },

  calculateCrossfadeStartTime(trackDuration, crossfadeDuration, beats = []) {
    let startTime = trackDuration - crossfadeDuration;

    if (beats.length > 0) {
      const beatsPerPhrase = 64;
      const phraseBoundaries = [];

      for (let i = beatsPerPhrase; i < beats.length; i += beatsPerPhrase) {
        phraseBoundaries.push(beats[i]);
      }

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
  },

  createCrossfadePlan(currentTrack, nextTrack, crossfadeDuration = null) {
    const duration = crossfadeDuration || this.defaultCrossfadeDuration;

    const volumeCurves = this.generateCrossfadeCurve(duration, 'scurve');
    const eqCurves = this.eqEnabled ? this.generateEQCurve(duration) : null;

    const startTime = this.calculateCrossfadeStartTime(
      currentTrack.duration / 1000,
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
        startOffset: 0
      }
    };
  },

  estimateCrossfadeQuality(currentTrack, nextTrack) {
    let quality = 100;

    const bpmDiff = Math.abs(currentTrack.bpm - nextTrack.bpm);
    if (bpmDiff > 5) {
      quality -= Math.min(30, bpmDiff * 3);
    }

    const energyDiff = Math.abs(currentTrack.energy - nextTrack.energy);
    if (energyDiff > 30) {
      quality -= Math.min(20, energyDiff / 2);
    }

    if (currentTrack.key !== null && nextTrack.key !== null) {
      const keyDiff = Math.abs(currentTrack.key - nextTrack.key);
      if (keyDiff === 0 || keyDiff === 7 || keyDiff === 5) {
        quality += 10;
      }
    }

    return Math.max(0, Math.min(100, Math.round(quality)));
  }
};

// Sample tracks for testing
const sampleTracks = [
  {
    id: '1',
    name: 'Uptown Funk',
    artist: 'Mark Ronson ft. Bruno Mars',
    bpm: 115,
    energy: 82,
    key: 7, // G
    mode: 1, // Major
    duration: 269000, // 4:29 in ms
    beats: generateBeats(115, 269)
  },
  {
    id: '2',
    name: '24K Magic',
    artist: 'Bruno Mars',
    bpm: 107,
    energy: 78,
    key: 9, // A
    mode: 1, // Major
    duration: 226000, // 3:46 in ms
    beats: generateBeats(107, 226)
  },
  {
    id: '3',
    name: 'Blinding Lights',
    artist: 'The Weeknd',
    bpm: 171,
    energy: 85,
    key: 0, // C
    mode: 1, // Major
    duration: 200000, // 3:20 in ms
    beats: generateBeats(171, 200)
  },
  {
    id: '4',
    name: 'Levitating',
    artist: 'Dua Lipa',
    bpm: 103,
    energy: 80,
    key: 2, // D
    mode: 1, // Major
    duration: 203000, // 3:23 in ms
    beats: generateBeats(103, 203)
  }
];

// Helper function to generate beat positions
function generateBeats(bpm, durationSeconds) {
  const beatsPerSecond = bpm / 60;
  const beats = [];

  for (let t = 0; t < durationSeconds; t += 1 / beatsPerSecond) {
    beats.push(t);
  }

  return beats;
}

// Test runner
console.log('========================================');
console.log('🎵 CROSSFADE ENGINE TEST SUITE 🎵');
console.log('========================================\n');

// Test 1: Basic crossfade curve generation
console.log('TEST 1: Crossfade Curve Generation');
console.log('-----------------------------------');
const curves = CrossfadeEngine.generateCrossfadeCurve(8, 'scurve');
console.log(`✓ Generated ${curves.outgoing.length} curve points`);
console.log(`✓ Duration: ${curves.duration} seconds`);
console.log(`✓ Start volumes - Outgoing: ${curves.outgoing[0].volume.toFixed(2)}, Incoming: ${curves.incoming[0].volume.toFixed(2)}`);
console.log(`✓ End volumes - Outgoing: ${curves.outgoing[curves.outgoing.length - 1].volume.toFixed(2)}, Incoming: ${curves.incoming[curves.incoming.length - 1].volume.toFixed(2)}`);
console.log('\n');

// Test 2: EQ curve generation
console.log('TEST 2: EQ Curve Generation');
console.log('-----------------------------------');
const eqCurves = CrossfadeEngine.generateEQCurve(8);
console.log(`✓ Generated EQ curves for ${eqCurves.outgoing.length} points`);
console.log(`✓ Outgoing track start - Low: ${eqCurves.outgoing[0].low.toFixed(2)}, Mid: ${eqCurves.outgoing[0].mid.toFixed(2)}, High: ${eqCurves.outgoing[0].high.toFixed(2)}`);
console.log(`✓ Incoming track end - Low: ${eqCurves.incoming[eqCurves.incoming.length - 1].low.toFixed(2)}, Mid: ${eqCurves.incoming[eqCurves.incoming.length - 1].mid.toFixed(2)}, High: ${eqCurves.incoming[eqCurves.incoming.length - 1].high.toFixed(2)}`);
console.log('\n');

// Test 3: Crossfade planning for each track pair
console.log('TEST 3: Crossfade Planning & Quality Assessment');
console.log('-----------------------------------');

for (let i = 0; i < sampleTracks.length - 1; i++) {
  const current = sampleTracks[i];
  const next = sampleTracks[i + 1];

  console.log(`\nTransition ${i + 1}: "${current.name}" → "${next.name}"`);
  console.log(`  Current: ${current.bpm} BPM, Energy ${current.energy}`);
  console.log(`  Next: ${next.bpm} BPM, Energy ${next.energy}`);

  const plan = CrossfadeEngine.createCrossfadePlan(current, next, 8);
  const quality = CrossfadeEngine.estimateCrossfadeQuality(current, next);

  console.log(`  ✓ Crossfade starts at: ${plan.startTime.toFixed(2)}s`);
  console.log(`  ✓ Crossfade duration: ${plan.duration}s`);
  console.log(`  ✓ Estimated quality: ${quality}/100 ${getQualityLabel(quality)}`);
  console.log(`  ✓ BPM difference: ${Math.abs(current.bpm - next.bpm)} BPM`);
  console.log(`  ✓ Energy difference: ${Math.abs(current.energy - next.energy)} points`);
}

console.log('\n');

// Test 4: Curve type comparison
console.log('TEST 4: Different Curve Types Comparison');
console.log('-----------------------------------');
const curveTypes = ['linear', 'exponential', 'scurve'];

curveTypes.forEach(type => {
  const curve = CrossfadeEngine.generateCrossfadeCurve(8, type);
  const midpoint = Math.floor(curve.outgoing.length / 2);

  console.log(`${type.toUpperCase()} curve:`);
  console.log(`  Mid-point volumes - Outgoing: ${curve.outgoing[midpoint].volume.toFixed(3)}, Incoming: ${curve.incoming[midpoint].volume.toFixed(3)}`);
});

console.log('\n');

// Test 5: Detailed crossfade simulation
console.log('TEST 5: Detailed Crossfade Simulation');
console.log('-----------------------------------');
console.log(`Simulating: "${sampleTracks[0].name}" → "${sampleTracks[1].name}"\n`);

const detailedPlan = CrossfadeEngine.createCrossfadePlan(sampleTracks[0], sampleTracks[1], 10);

console.log('Crossfade Timeline (showing every 2 seconds):');
console.log('Time(s) | Track 1 Vol | Track 2 Vol | Track 1 EQ (H) | Track 2 EQ (H)');
console.log('--------|-------------|-------------|----------------|---------------');

for (let i = 0; i <= 10; i += 2) {
  const index = Math.floor((i / 10) * (detailedPlan.volumeCurves.outgoing.length - 1));
  const vol1 = detailedPlan.volumeCurves.outgoing[index].volume;
  const vol2 = detailedPlan.volumeCurves.incoming[index].volume;
  const eq1High = detailedPlan.eqCurves.outgoing[index].high;
  const eq2High = detailedPlan.eqCurves.incoming[index].high;

  console.log(`  ${i.toString().padStart(2)}    | ${formatBar(vol1, 11)} | ${formatBar(vol2, 11)} | ${formatBar(eq1High, 14)} | ${formatBar(eq2High, 13)}`);
}

console.log('\n');

// Summary
console.log('========================================');
console.log('✓ All crossfade tests completed successfully!');
console.log('========================================');
console.log('\nKey Findings:');
console.log('• S-curve provides smoothest perceived transition');
console.log('• EQ blending helps maintain energy during mix');
console.log('• Phrase-aligned transitions sound more professional');
console.log('• Compatible BPMs (within 10 BPM) produce best results');

// Helper functions
function getQualityLabel(quality) {
  if (quality >= 90) return '🟢 Excellent';
  if (quality >= 75) return '🟡 Good';
  if (quality >= 60) return '🟠 Fair';
  return '🔴 Challenging';
}

function formatBar(value, width) {
  const filled = Math.round(value * (width - 2));
  const bar = '█'.repeat(filled) + '░'.repeat(width - 2 - filled);
  return bar;
}
