/**
 * Spotify API Integration Service
 * Handles authentication and data fetching from Spotify
 */

import axios from 'axios';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_AUTH_BASE = 'https://accounts.spotify.com';

class SpotifyService {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Initialize Spotify authentication
   * @param {string} clientId - Spotify app client ID
   * @param {string} redirectUri - OAuth redirect URI
   */
  async authenticate(clientId, redirectUri) {
    // In production, this would use OAuth flow
    // For now, this is a placeholder structure
    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-read-collaborative',
      'user-library-read',
      'streaming',
      'user-read-playback-state',
      'user-modify-playback-state'
    ];

    // OAuth URL for authentication
    const authUrl = `${SPOTIFY_AUTH_BASE}/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes.join(' '))}`;

    return authUrl;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code, clientId, clientSecret, redirectUri) {
    try {
      const response = await axios.post(
        `${SPOTIFY_AUTH_BASE}/api/token`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  /**
   * Get user's playlists
   */
  async getUserPlaylists() {
    try {
      const response = await axios.get(`${SPOTIFY_API_BASE}/me/playlists`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      return response.data.items;
    } catch (error) {
      console.error('Error fetching playlists:', error);
      throw error;
    }
  }

  /**
   * Get playlist tracks with audio features
   */
  async getPlaylistTracks(playlistId) {
    try {
      const response = await axios.get(
        `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      const tracks = response.data.items.map(item => item.track);

      // Get audio features for all tracks
      const trackIds = tracks.map(track => track.id).join(',');
      const featuresResponse = await axios.get(
        `${SPOTIFY_API_BASE}/audio-features?ids=${trackIds}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      // Combine track info with audio features
      return tracks.map((track, index) => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        albumArt: track.album.images[0]?.url,
        duration: track.duration_ms,
        previewUrl: track.preview_url,
        uri: track.uri,
        // Audio features from Spotify
        bpm: featuresResponse.data.audio_features[index]?.tempo,
        energy: featuresResponse.data.audio_features[index]?.energy * 100, // 0-100 scale
        danceability: featuresResponse.data.audio_features[index]?.danceability,
        valence: featuresResponse.data.audio_features[index]?.valence,
        key: featuresResponse.data.audio_features[index]?.key,
        mode: featuresResponse.data.audio_features[index]?.mode,
        acousticness: featuresResponse.data.audio_features[index]?.acousticness,
        instrumentalness: featuresResponse.data.audio_features[index]?.instrumentalness
      }));
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
      throw error;
    }
  }

  /**
   * Search for tracks
   */
  async searchTracks(query, limit = 20) {
    try {
      const response = await axios.get(
        `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return response.data.tracks.items;
    } catch (error) {
      console.error('Error searching tracks:', error);
      throw error;
    }
  }

  /**
   * Get audio analysis for a track (detailed)
   */
  async getAudioAnalysis(trackId) {
    try {
      const response = await axios.get(
        `${SPOTIFY_API_BASE}/audio-analysis/${trackId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching audio analysis:', error);
      throw error;
    }
  }
}

export default new SpotifyService();
