import { useEffect, useRef, useState } from 'react';
import { VideoMetadata, vimeoPlaylistConfig } from '@/config/vimeo-playlist';
import { useVideoResize } from '@/hooks/useVideoResize';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { CacheManager } from '@/utils/cache-manager';

interface VimeoPlayerProps {
  video: VideoMetadata;
  onVideoEnd: () => void;
  onReady?: () => void;
  isFirstVideo?: boolean;
  autoplay?: boolean;
  className?: string;
}

interface VimeoPlayerAPI {
  play(): Promise<void>;
  pause(): Promise<void>;
  setCurrentTime(seconds: number): Promise<void>;
  getCurrentTime(): Promise<number>;
  getDuration(): Promise<number>;
}

declare global {
  interface Window {
    Vimeo: {
      Player: new (element: HTMLElement, options: any) => VimeoPlayerAPI & {
        on(event: string, callback: Function): void;
        off(event: string, callback?: Function): void;
        destroy(): void;
      };
    };
  }
}

export const VimeoPlayer = ({ video, onVideoEnd, onReady, isFirstVideo = false, autoplay = false, className = '' }: VimeoPlayerProps) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const vimeoPlayerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { containerRef, style } = useVideoResize(16/9, video.width, video.height);

  // Load Vimeo Player SDK
  useEffect(() => {
    const loadVimeoSDK = () => {
      if (window.Vimeo) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://player.vimeo.com/api/player.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Vimeo SDK'));
        document.head.appendChild(script);
      });
    };

    loadVimeoSDK().catch(err => {
      setError('Failed to load video player');
    });
  }, []);

  // Initialize player when video changes
  useEffect(() => {
    if (!playerRef.current || !window.Vimeo || !video.videoId) {
      return;
    }

    // Cleanup previous player
    if (vimeoPlayerRef.current) {
      vimeoPlayerRef.current.destroy();
    }

    setIsLoading(true);
    setError(null);

    try {
      const player = new window.Vimeo.Player(playerRef.current, {
        id: video.videoId,
        width: '100%',
        height: '100%',
        responsive: true,
        autoplay: autoplay,
        dnt: true, // Do not track
        title: false,
        byline: false,
        portrait: false,
        color: 'ffffff', // Set player controls to white
        background: false, // Remove Vimeo branding background
        transparent: false,
        // Add cache busting parameter
        t: Date.now()
      });

      vimeoPlayerRef.current = player;

      // Set up event listeners
      player.on('loaded', () => {
        setIsLoading(false);
        onReady?.();
      });

      player.on('ended', () => {
        onVideoEnd();
      });

      player.on('error', (error: any) => {
        setError('Failed to load video');
        setIsLoading(false);
      });

    } catch (err) {
      setError('Failed to initialize video player');
      setIsLoading(false);
    }

    return () => {
      if (vimeoPlayerRef.current) {
        vimeoPlayerRef.current.destroy();
        vimeoPlayerRef.current = null;
      }
    };
  }, [video.videoId, onVideoEnd, onReady]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    
    // Clear cache and force reload
    CacheManager.clearVimeoCache();
    
    // Re-trigger the player initialization
    if (playerRef.current && window.Vimeo && video.videoId) {
      // The useEffect will handle re-initialization
      setIsLoading(true);
    }
  };

  if (error) {
    return (
      <div ref={containerRef} className={`flex items-center justify-center bg-video-player rounded-lg ${className}`}>
        <div className="text-center p-8 max-w-md">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-card-foreground mb-3">Video Unavailable</h3>
          <p className="text-muted-foreground text-sm mb-4">{error}</p>
          <p className="text-xs text-muted-foreground mb-6">
            Video ID: {video.videoId} | URL: {video.url}
          </p>
          <Button onClick={handleRetry} variant="outline" className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Loading
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            If this issue persists, please contact support or try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative bg-video-player rounded-lg overflow-hidden shadow-video ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-video-player z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-card-foreground text-sm">Loading video...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={playerRef} 
        className="w-full vimeo-player-container"
        style={{
          ...style,
          background: 'var(--video-player)', // Explicit background override
        }}
      />
      
      {/* Video title overlay - moved to top-left */}
      {!isLoading && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4">
          <h2 className="text-white text-lg font-semibold truncate">
            {video.title}
          </h2>
        </div>
      )}
    </div>
  );
};