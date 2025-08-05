import { VideoMetadata } from '@/config/vimeo-playlist';

interface VimeoOEmbedResponse {
  title: string;
  thumbnail_url: string;
  duration: number;
  description: string;
  video_id: number;
  html: string;
  width: number;
  height: number;
}

export class VimeoApiService {
  private static readonly OEMBED_BASE_URL = 'https://vimeo.com/api/oembed.json';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Extract video ID from Vimeo URL
   */
  static extractVideoId(url: string): string | null {
    const match = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
    return match ? match[1] : null;
  }

  /**
   * Get cached metadata or fetch from API
   */
  static async getVideoMetadata(url: string): Promise<VideoMetadata | null> {
    const videoId = this.extractVideoId(url);
    if (!videoId) {
      return null;
    }

    // Check cache first
    const cached = this.getCachedMetadata(videoId);
    if (cached) {
      return cached;
    }

    try {
      const oembedUrl = `${this.OEMBED_BASE_URL}?url=${encodeURIComponent(url)}&width=640&height=360`;
      
      const response = await fetch(oembedUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.status}`);
      }

      const data: VimeoOEmbedResponse = await response.json();
      
      const metadata: VideoMetadata = {
        url,
        title: data.title || 'Untitled Video',
        thumbnail: data.thumbnail_url || '',
        duration: data.duration || 0,
        description: data.description || '',
        videoId,
        width: data.width,
        height: data.height
      };

      // Cache the result
      this.cacheMetadata(videoId, metadata);
      
      return metadata;
    } catch (error) {
      
      // Return fallback metadata
      return {
        url,
        title: 'Video Unavailable',
        thumbnail: '',
        duration: 0,
        description: 'Failed to load video information',
        videoId
      };
    }
  }

  /**
   * Batch fetch metadata for multiple videos
   */
  static async getPlaylistMetadata(urls: string[]): Promise<VideoMetadata[]> {
    const promises = urls.map(url => this.getVideoMetadata(url));
    const results = await Promise.allSettled(promises);
    
    return results
      .map((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          return result.value;
        }
        
        // Create fallback for failed fetches
        const videoId = this.extractVideoId(urls[index]) || `unknown_${index}`;
        return {
          url: urls[index],
          title: 'Video Unavailable',
          thumbnail: '',
          duration: 0,
          description: 'Failed to load video',
          videoId
        };
      });
  }

  /**
   * Get cached metadata from localStorage
   */
  private static getCachedMetadata(videoId: string): VideoMetadata | null {
    try {
      const cached = localStorage.getItem(`vimeo_meta_${videoId}`);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      if (now - timestamp > this.CACHE_DURATION) {
        localStorage.removeItem(`vimeo_meta_${videoId}`);
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Cache metadata to localStorage
   */
  private static cacheMetadata(videoId: string, metadata: VideoMetadata): void {
    try {
      const cacheData = {
        data: metadata,
        timestamp: Date.now()
      };
      localStorage.setItem(`vimeo_meta_${videoId}`, JSON.stringify(cacheData));
    } catch (error) {
      // Silent fail for caching
    }
  }

  /**
   * Clear all cached metadata
   */
  static clearCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('vimeo_meta_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      // Silent fail for cache clearing
    }
  }

  /**
   * Format duration from seconds to MM:SS
   */
  static formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}