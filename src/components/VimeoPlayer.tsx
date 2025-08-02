import { useEffect, useRef, useState } from 'react';
import { VideoMetadata } from '@/config/vimeo-playlist';

interface VimeoPlayerProps {
  video: VideoMetadata;
  onVideoEnd: () => void;
  onReady?: () => void;
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

export const VimeoPlayer = ({ video, onVideoEnd, onReady, className = '' }: VimeoPlayerProps) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const vimeoPlayerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      console.error('Error loading Vimeo SDK:', err);
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
        dnt: true, // Do not track
        title: false,
        byline: false,
        portrait: false
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
        console.error('Vimeo player error:', error);
        setError('Failed to load video');
        setIsLoading(false);
      });

    } catch (err) {
      console.error('Error initializing Vimeo player:', err);
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

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-video-player rounded-lg ${className}`}>
        <div className="text-center p-8">
          <div className="text-muted-foreground mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Video Unavailable</h3>
          <p className="text-muted-foreground text-sm">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">Video ID: {video.videoId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-video-player rounded-lg overflow-hidden shadow-video ${className}`}>
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
        className="w-full h-full min-h-[300px] lg:min-h-[400px]"
        style={{ aspectRatio: '16/9' }}
      />
      
      {/* Video title overlay */}
      {!isLoading && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h2 className="text-white text-lg font-semibold truncate">
            {video.title}
          </h2>
        </div>
      )}
    </div>
  );
};