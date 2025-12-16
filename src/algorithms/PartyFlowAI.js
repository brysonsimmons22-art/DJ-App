/**
 * Party Flow AI Algorithm
 * Intelligently orders songs to create optimal party energy curve
 */

class PartyFlowAI {
  constructor() {
    this.flowProfiles = {
      progressiveBuild: {
        name: 'Progressive Build',
        description: 'Gradually build energy to peak and maintain',
        curve: [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 85, 85, 80, 75]
      },
      wavePattern: {
        name: 'Wave Pattern',
        description: 'Build, peak, cool, repeat',
        curve: [45, 55, 65, 75, 85, 80, 70, 60, 65, 75, 85, 80, 70, 65]
      },
      highEnergy: {
        name: 'High Energy Constant',
        description: 'Quick build then maintain high energy',
        curve: [50, 65, 80, 85, 90, 90, 90, 85, 85, 90, 90, 85, 80, 75]
      },
      chillVibe: {
        name: 'Chill Vibe',
        description: 'Moderate energy, smooth flow',
        curve: [40, 45, 50, 55, 55, 60, 60, 55, 50, 55, 55, 50, 45, 40]
      }
    };

    this.currentProfile = 'progressiveBuild';
  }

  /**
   * Set flow profile
   */
  setFlowProfile(profileName) {
    if (this.flowProfiles[profileName]) {
      this.currentProfile = profileName;
    }
  }

  /**
   * Order playlist for optimal party flow
   * @param {Array} tracks - Array of track objects with metadata
   * @param {string} profile - Flow profile to use
   * @returns {Array} Ordered tracks
   */
  orderPlaylist(tracks, profile = null) {
    const flowProfile = profile || this.currentProfile;
    const curve = this.flowProfiles[flowProfile].curve;

    // Calculate how many songs per curve point
    const songsPerPoint = Math.ceil(tracks.length / curve.length);

    // Group tracks by energy level
    const energyGroups = this.groupByEnergy(tracks);

    // Build ordered playlist following energy curve
    const orderedPlaylist = [];
    const usedTrackIds = new Set();

    for (let i = 0; i < curve.length; i++) {
      const targetEnergy = curve[i];
      const songsNeeded = Math.min(
        songsPerPoint,
        tracks.length - orderedPlaylist.length
      );

      // Find best matches for this energy level
      const matches = this.findBestMatches(
        energyGroups,
        targetEnergy,
        songsNeeded,
        usedTrackIds,
        orderedPlaylist[orderedPlaylist.length - 1] || null
      );

      matches.forEach(track => {
        orderedPlaylist.push(track);
        usedTrackIds.add(track.id);
      });
    }

    // Add any remaining tracks
    tracks.forEach(track => {
      if (!usedTrackIds.has(track.id)) {
        orderedPlaylist.push(track);
      }
    });

    return orderedPlaylist;
  }

  /**
   * Group tracks by energy level ranges
   */
  groupByEnergy(tracks) {
    const groups = {
      veryLow: [],   // 0-30
      low: [],       // 31-50
      medium: [],    // 51-70
      high: [],      // 71-85
      veryHigh: []   // 86-100
    };

    tracks.forEach(track => {
      const energy = track.energy || 50; // Default to medium if unknown

      if (energy <= 30) groups.veryLow.push(track);
      else if (energy <= 50) groups.low.push(track);
      else if (energy <= 70) groups.medium.push(track);
      else if (energy <= 85) groups.high.push(track);
      else groups.veryHigh.push(track);
    });

    return groups;
  }

  /**
   * Find best matching tracks for target energy
   */
  findBestMatches(energyGroups, targetEnergy, count, usedIds, previousTrack) {
    // Determine which groups to search
    let primaryGroup, secondaryGroup;

    if (targetEnergy <= 30) {
      primaryGroup = energyGroups.veryLow;
      secondaryGroup = energyGroups.low;
    } else if (targetEnergy <= 50) {
      primaryGroup = energyGroups.low;
      secondaryGroup = energyGroups.medium;
    } else if (targetEnergy <= 70) {
      primaryGroup = energyGroups.medium;
      secondaryGroup = energyGroups.high;
    } else if (targetEnergy <= 85) {
      primaryGroup = energyGroups.high;
      secondaryGroup = energyGroups.veryHigh;
    } else {
      primaryGroup = energyGroups.veryHigh;
      secondaryGroup = energyGroups.high;
    }

    // Get available tracks from groups
    const availableTracks = [
      ...primaryGroup.filter(t => !usedIds.has(t.id)),
      ...secondaryGroup.filter(t => !usedIds.has(t.id))
    ];

    if (availableTracks.length === 0) {
      // Fallback to any unused track
      const allTracks = Object.values(energyGroups).flat();
      return allTracks.filter(t => !usedIds.has(t.id)).slice(0, count);
    }

    // Score each track
    const scoredTracks = availableTracks.map(track => ({
      track: track,
      score: this.scoreTrack(track, targetEnergy, previousTrack)
    }));

    // Sort by score and take top matches
    scoredTracks.sort((a, b) => b.score - a.score);

    return scoredTracks.slice(0, count).map(item => item.track);
  }

  /**
   * Score a track based on how well it fits
   */
  scoreTrack(track, targetEnergy, previousTrack) {
    let score = 100;

    // Energy match (40 points)
    const energyDiff = Math.abs((track.energy || 50) - targetEnergy);
    score -= energyDiff * 0.4;

    if (previousTrack) {
      // BPM compatibility (30 points)
      const bpmDiff = Math.abs(track.bpm - previousTrack.bpm);
      if (bpmDiff > 10) {
        score -= (bpmDiff - 10) * 2;
      }

      // Key compatibility (20 points)
      if (track.key !== null && previousTrack.key !== null) {
        const keyCompatibility = this.getKeyCompatibility(
          previousTrack.key,
          track.key,
          previousTrack.mode,
          track.mode
        );
        score += keyCompatibility * 20 - 20;
      }

      // Genre transition smoothness (10 points)
      // Placeholder for genre analysis
    }

    return Math.max(0, score);
  }

  /**
   * Get key compatibility score (same as in Beatmatcher)
   */
  getKeyCompatibility(key1, key2, mode1, mode2) {
    if (key1 === key2 && mode1 === mode2) return 1.0;
    if (key1 === key2) return 0.8;
    if ((key2 - key1 + 12) % 12 === 7 && mode1 === mode2) return 0.9;
    if ((key1 - key2 + 12) % 12 === 7 && mode1 === mode2) return 0.9;
    if (Math.abs(key1 - key2) === 1 && mode1 === mode2) return 0.7;
    return 0.3;
  }

  /**
   * Analyze playlist and suggest improvements
   */
  analyzePlaylist(tracks) {
    const analysis = {
      totalTracks: tracks.length,
      averageEnergy: 0,
      averageBPM: 0,
      energyDistribution: {
        veryLow: 0,
        low: 0,
        medium: 0,
        high: 0,
        veryHigh: 0
      },
      bpmRange: { min: Infinity, max: 0 },
      suggestions: []
    };

    // Calculate metrics
    let totalEnergy = 0;
    let totalBPM = 0;

    tracks.forEach(track => {
      const energy = track.energy || 50;
      totalEnergy += energy;
      totalBPM += track.bpm || 120;

      // Energy distribution
      if (energy <= 30) analysis.energyDistribution.veryLow++;
      else if (energy <= 50) analysis.energyDistribution.low++;
      else if (energy <= 70) analysis.energyDistribution.medium++;
      else if (energy <= 85) analysis.energyDistribution.high++;
      else analysis.energyDistribution.veryHigh++;

      // BPM range
      const bpm = track.bpm || 120;
      analysis.bpmRange.min = Math.min(analysis.bpmRange.min, bpm);
      analysis.bpmRange.max = Math.max(analysis.bpmRange.max, bpm);
    });

    analysis.averageEnergy = Math.round(totalEnergy / tracks.length);
    analysis.averageBPM = Math.round(totalBPM / tracks.length);

    // Generate suggestions
    if (analysis.energyDistribution.veryHigh < 3) {
      analysis.suggestions.push('Consider adding more high-energy tracks for peak moments');
    }

    if (analysis.energyDistribution.low < 2) {
      analysis.suggestions.push('Add some lower-energy tracks for warm-up and cool-down');
    }

    const bpmSpread = analysis.bpmRange.max - analysis.bpmRange.min;
    if (bpmSpread > 50) {
      analysis.suggestions.push('Wide BPM range detected - may require careful beatmatching');
    }

    if (tracks.length < 10) {
      analysis.suggestions.push('Playlist is short - consider adding more tracks for longer party');
    }

    return analysis;
  }

  /**
   * Generate energy curve for visualization
   */
  generateEnergyCurve(orderedTracks) {
    return orderedTracks.map((track, index) => ({
      position: index,
      trackName: track.name,
      energy: track.energy || 50,
      bpm: track.bpm
    }));
  }

  /**
   * Predict party success score
   */
  predictPartySuccess(orderedTracks) {
    let score = 100;

    // Check energy flow smoothness
    for (let i = 1; i < orderedTracks.length; i++) {
      const energyJump = Math.abs(
        (orderedTracks[i].energy || 50) - (orderedTracks[i - 1].energy || 50)
      );

      if (energyJump > 25) {
        score -= 5; // Penalize large energy jumps
      }
    }

    // Check for variety
    const uniqueBPMs = new Set(orderedTracks.map(t => Math.round(t.bpm / 5) * 5));
    if (uniqueBPMs.size < orderedTracks.length * 0.3) {
      score -= 10; // Penalize lack of variety
    }

    // Check for energy build
    const firstThird = orderedTracks.slice(0, Math.floor(orderedTracks.length / 3));
    const lastThird = orderedTracks.slice(-Math.floor(orderedTracks.length / 3));

    const avgEnergyFirst = firstThird.reduce((sum, t) => sum + (t.energy || 50), 0) / firstThird.length;
    const avgEnergyLast = lastThird.reduce((sum, t) => sum + (t.energy || 50), 0) / lastThird.length;

    if (avgEnergyLast <= avgEnergyFirst) {
      score -= 15; // Should build energy throughout party
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}

export default new PartyFlowAI();
