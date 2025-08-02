// Cache Management Utilities
export class CacheManager {
  /**
   * Clear all Vimeo-related cache entries
   */
  static clearVimeoCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('vimeo_meta_') || key.startsWith('vimeo_playlist_')) {
          localStorage.removeItem(key);
        }
      });
      console.log('Vimeo cache cleared');
    } catch (error) {
      console.error('Error clearing Vimeo cache:', error);
    }
  }

  /**
   * Clear browser cache by forcing reload
   */
  static clearBrowserCache(): void {
    if (window.location) {
      // Add timestamp to force cache bust
      const url = new URL(window.location.href);
      url.searchParams.set('_cb', Date.now().toString());
      window.location.href = url.toString();
    }
  }

  /**
   * Generate cache-busting parameter for URLs
   */
  static getCacheBustParam(): string {
    return `?_cb=${Date.now()}`;
  }

  /**
   * Clear all application cache
   */
  static clearAllCache(): void {
    this.clearVimeoCache();
    
    // Clear service worker cache if available
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
  }
}