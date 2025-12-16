/**
 * Apple Music API Integration Service
 * Handles authentication and data fetching from Apple Music
 */

class AppleMusicService {
  constructor() {
    this.musicKit = null;
    this.isAuthorized = false;
  }

  /**
   * Initialize Apple Music Kit
   * @param {string} developerToken - Apple Music developer token
   */
  async initialize(developerToken) {
    try {
      // In React Native, this would use native iOS MusicKit
      // This is a structure for the web version

      this.musicKit = await window.MusicKit.configure({
        developerToken: developerToken,
        app: {
          name: 'Virtual DJ',
          build: '1.0.0'
        }
      });

      return this.musicKit;
    } catch (error) {
      console.error('Error initializing Apple Music:', error);
      throw error;
    }
  }

  /**
   * Authorize user with Apple Music
   */
  async authorize() {
    try {
      const authStatus = await this.musicKit.authorize();
      this.isAuthorized = authStatus === 'authorized';
      return this.isAuthorized;
    } catch (error) {
      console.error('Error authorizing Apple Music:', error);
      throw error;
    }
  }

  /**
   * Get user's playlists
   */
  async getUserPlaylists() {
    if (!this.isAuthorized) {
      throw new Error('Not authorized');
    }

    try {
      const playlists = await this.musicKit.api.music(
        '/v1/me/library/playlists'
      );
      return playlists.data.data;
    } catch (error) {
      console.error('Error fetching playlists:', error);
      throw error;
    }
  }

  /**
   * Get playlist tracks
   */
  async getPlaylistTracks(playlistId) {
    try {
      const response = await this.musicKit.api.music(
        `/v1/me/library/playlists/${playlistId}/tracks`
      );

      // Apple Music doesn't provide BPM directly
      // We'll need to analyze it ourselves
      return response.data.data.map(track => ({
        id: track.id,
        name: track.attributes.name,
        artist: track.attributes.artistName,
        album: track.attributes.albumName,
        albumArt: track.attributes.artwork?.url,
        duration: track.attributes.durationInMillis,
        previewUrl: track.attributes.previews?.[0]?.url,
        // Note: Apple Music doesn't provide audio features like Spotify
        // We'll need to analyze these ourselves
        bpm: null,
        energy: null,
        key: null
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
      const response = await this.musicKit.api.music(
        `/v1/catalog/us/search?term=${encodeURIComponent(query)}&types=songs&limit=${limit}`
      );

      return response.data.results.songs?.data || [];
    } catch (error) {
      console.error('Error searching tracks:', error);
      throw error;
    }
  }

  /**
   * Play a track
   */
  async playTrack(trackId) {
    try {
      await this.musicKit.setQueue({
        song: trackId
      });
      await this.musicKit.play();
    } catch (error) {
      console.error('Error playing track:', error);
      throw error;
    }
  }
}

export default new AppleMusicService();
