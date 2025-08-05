
import { useEffect, useState, useCallback } from 'react';
import { VimeoPlayer } from './VimeoPlayer';
import { PlaylistSidebar } from './PlaylistSidebar';
import { VideoProgressBar } from './VideoProgressBar';
import { CompletionScreen } from './CompletionScreen';
import { vimeoPlaylistConfig, VideoMetadata, PlaylistState, CACHE_KEYS } from '@/config/vimeo-playlist';
import { VimeoApiService } from '@/services/vimeo-api';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export const VimeoPlaylist = () => {
  console.log('VimeoPlaylist: Component initializing');
  
  const { toast } = useToast();
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [autoplay, setAutoplay] = useState(vimeoPlaylistConfig.autoplay);
  
  const [playlistState, setPlaylistState] = useState<PlaylistState>({
    currentVideoIndex: 0,
    watchedVideos: new Set(),
    isCompleted: false,
    showEndScreen: false,
    hasEverCompleted: false
  });

  // Load playlist data
  useEffect(() => {
    console.log('VimeoPlaylist: Loading playlist data');
    loadPlaylistData();
  }, []);

  // Save progress when state changes
  useEffect(() => {
    console.log('VimeoPlaylist: Saving progress');
    saveProgress();
  }, [playlistState]);

  // Initialize video selection
  useEffect(() => {
    if (videos.length > 0) {
      console.log('VimeoPlaylist: Initializing video selection with', videos.length, 'videos');
      initializeVideoSelection();
    }
  }, [videos]);

  const loadPlaylistData = async () => {
    try {
      console.log('VimeoPlaylist: Starting playlist data load');
      setIsLoading(true);
      setError(null);

      const metadata = await VimeoApiService.getPlaylistMetadata(vimeoPlaylistConfig.videoUrls);
      console.log('VimeoPlaylist: Metadata loaded:', metadata.length, 'videos');
      setVideos(metadata);

      const validVideos = metadata.filter(video => video.videoId !== 'unknown' && video.title !== 'Video Unavailable');
      
      if (validVideos.length === 0) {
        throw new Error('No valid videos found in the playlist');
      }

      if (validVideos.length < metadata.length) {
        toast({
          title: "Some videos unavailable",
          description: `${metadata.length - validVideos.length} video(s) could not be loaded`,
          variant: "destructive"
        });
      }

    } catch (err) {
      console.error('VimeoPlaylist: Error loading playlist:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load playlist';
      setError(errorMessage);
      
      toast({
        title: "Error loading playlist",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeVideoSelection = () => {
    console.log('VimeoPlaylist: Initializing video selection');
    const savedProgress = loadProgress();
    
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const videoParam = urlParams.get('video');
    const autoplayParam = urlParams.get('autoplay');
    
    if (autoplayParam === 'true') {
      setAutoplay(true);
    }
    
    let targetVideoIndex = 0;
    
    if (videoParam) {
      const urlIndex = parseInt(videoParam) - 1;
      if (urlIndex >= 0 && urlIndex < videos.length) {
        targetVideoIndex = urlIndex;
      }
    } else {
      targetVideoIndex = savedProgress.currentVideoIndex >= 0 ? savedProgress.currentVideoIndex : 0;
    }
    
    console.log('VimeoPlaylist: Setting target video index to', targetVideoIndex);
    
    setPlaylistState(prevState => ({
      ...prevState,
      currentVideoIndex: targetVideoIndex,
      watchedVideos: savedProgress.watchedVideos,
      isCompleted: savedProgress.isCompleted,
      hasEverCompleted: savedProgress.hasEverCompleted,
      showEndScreen: savedProgress.showEndScreen && savedProgress.isCompleted
    }));
  };

  const loadProgress = (): PlaylistState => {
    try {
      const saved = localStorage.getItem(CACHE_KEYS.PROGRESS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          currentVideoIndex: parsed.currentVideoIndex >= 0 ? parsed.currentVideoIndex : 0,
          watchedVideos: new Set(parsed.watchedVideos || []),
          isCompleted: parsed.isCompleted || false,
          showEndScreen: parsed.showEndScreen || false,
          hasEverCompleted: parsed.hasEverCompleted || false
        };
      }
    } catch (error) {
      console.error('VimeoPlaylist: Error loading progress:', error);
    }
    
    return {
      currentVideoIndex: 0,
      watchedVideos: new Set(),
      isCompleted: false,
      showEndScreen: false,
      hasEverCompleted: false
    };
  };

  const saveProgress = () => {
    try {
      const progress = {
        watchedVideos: Array.from(playlistState.watchedVideos),
        currentVideoIndex: playlistState.currentVideoIndex,
        isCompleted: playlistState.isCompleted,
        showEndScreen: playlistState.showEndScreen,
        hasEverCompleted: playlistState.hasEverCompleted,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(CACHE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.error('VimeoPlaylist: Error saving progress:', error);
    }
  };

  const handleVideoEnd = useCallback(() => {
    console.log('VimeoPlaylist: Video ended');
    const currentVideo = videos[playlistState.currentVideoIndex];
    if (!currentVideo) return;

    const newWatchedVideos = new Set(playlistState.watchedVideos);
    newWatchedVideos.add(currentVideo.videoId);

    const allWatched = videos.every(video => newWatchedVideos.has(video.videoId));
    
    console.log('VimeoPlaylist: All videos watched?', allWatched);
    
    setPlaylistState(prev => ({
      ...prev,
      watchedVideos: newWatchedVideos,
      isCompleted: allWatched,
      showEndScreen: allWatched && !prev.hasEverCompleted && vimeoPlaylistConfig.showEndScreen,
      hasEverCompleted: prev.hasEverCompleted || allWatched
    }));

    // Dispatch completion event for Moodle
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('vimeo_playlist_progress', {
          detail: {
            videoid: currentVideo.videoId,
            progress: newWatchedVideos.size,
            total: videos.length
          }
        }));

        if (allWatched) {
          window.dispatchEvent(new CustomEvent('vimeo_playlist_complete', {
            detail: {
              videoid: 'all',
              completed: true
            }
          }));
        }
      } catch (error) {
        console.warn('VimeoPlaylist: Failed to dispatch completion events:', error);
      }
    }

    if (vimeoPlaylistConfig.continuousPlay && !allWatched) {
      const nextIndex = playlistState.currentVideoIndex + 1;
      if (nextIndex < videos.length) {
        console.log('VimeoPlaylist: Auto-advancing to next video');
        setTimeout(() => {
          setPlaylistState(prev => ({
            ...prev,
            currentVideoIndex: nextIndex
          }));
        }, 1000);
      }
    }

    if (allWatched) {
      toast({
        title: "Activity Complete! 🎉",
        description: "You have finished all videos in this activity.",
      });
    }
  }, [videos, playlistState, toast]);

  const handleVideoSelect = useCallback((index: number) => {
    console.log('VimeoPlaylist: Video selected:', index);
    if (index >= 0 && index < videos.length) {
      setPlaylistState(prev => ({
        ...prev,
        currentVideoIndex: index,
        showEndScreen: false
      }));
      
      const url = new URL(window.location.href);
      url.searchParams.set('video', (index + 1).toString());
      window.history.replaceState({}, '', url.toString());
      setAutoplay(true);
      
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    }
  }, [videos.length]);

  const handleRestart = useCallback(() => {
    console.log('VimeoPlaylist: Restarting playlist');
    setPlaylistState(prev => ({
      currentVideoIndex: 0,
      watchedVideos: new Set(),
      isCompleted: false,
      showEndScreen: false,
      hasEverCompleted: prev.hasEverCompleted
    }));
    
    toast({
      title: "Activity restarted",
      description: "You can now watch all videos again.",
    });
  }, [toast]);

  const handleRetry = () => {
    console.log('VimeoPlaylist: Retrying playlist load');
    loadPlaylistData();
  };

  // Loading state
  if (isLoading) {
    console.log('VimeoPlaylist: Rendering loading state');
    return (
      <div className="h-screen bg-background flex overflow-hidden">
        <div className="flex-1 flex flex-col p-4">
          <div className="flex-1 flex items-center justify-center">
            <Skeleton className="w-full h-full max-h-[70vh] aspect-video rounded-lg" />
          </div>
          <div className="pt-4">
            <Skeleton className="h-8 w-3/4" />
          </div>
        </div>
        <div className="w-80 lg:w-96 p-4 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-12 h-8 rounded" />
              <div className="flex-1">
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-2 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.log('VimeoPlaylist: Rendering error state:', error);
    return (
      <div className="h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md text-center p-8">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to Load Playlist</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={handleRetry} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  const currentVideo = playlistState.currentVideoIndex >= 0 ? videos[playlistState.currentVideoIndex] : null;

  console.log('VimeoPlaylist: Rendering main component with current video:', currentVideo?.title);

  return (
    <div className="h-screen lg:h-screen bg-background flex overflow-hidden mobile-video-layout">
      {/* Main Video Area */}
      <div className={cn("flex-1 flex flex-col min-w-0", sidebarOpen ? "pr-0" : "pr-16")}>
        {/* Video Player */}
        <div className="flex-1 p-4 flex items-center justify-center video-container">
          {playlistState.showEndScreen ? (
            <CompletionScreen onRestart={handleRestart} />
          ) : currentVideo ? (
            <VimeoPlayer
              video={currentVideo}
              onVideoEnd={handleVideoEnd}
              isFirstVideo={playlistState.currentVideoIndex === 0}
              autoplay={autoplay}
              className="w-full h-full max-h-full"
            />
          ) : (
            <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center max-h-full">
              <p className="text-muted-foreground">No video available</p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        {sidebarOpen ? (
          <PlaylistSidebar
            videos={videos}
            currentVideoIndex={playlistState.currentVideoIndex}
            watchedVideos={playlistState.watchedVideos}
            isOpen={true}
            onVideoSelect={handleVideoSelect}
            onToggle={() => setSidebarOpen(false)}
            className="relative transform-none shadow-none border-l h-full"
          />
        ) : (
          <VideoProgressBar
            videos={videos}
            currentVideoIndex={playlistState.currentVideoIndex}
            watchedVideos={playlistState.watchedVideos}
            onToggleSidebar={() => setSidebarOpen(true)}
            onVideoSelect={handleVideoSelect}
          />
        )}
      </div>

      {/* Mobile Sidebar & Progress Bar */}
      <div className="lg:hidden">
        {sidebarOpen ? (
          <PlaylistSidebar
            videos={videos}
            currentVideoIndex={playlistState.currentVideoIndex}
            watchedVideos={playlistState.watchedVideos}
            isOpen={true}
            onVideoSelect={handleVideoSelect}
            onToggle={() => setSidebarOpen(false)}
          />
        ) : (
          <VideoProgressBar
            videos={videos}
            currentVideoIndex={playlistState.currentVideoIndex}
            watchedVideos={playlistState.watchedVideos}
            onToggleSidebar={() => setSidebarOpen(true)}
            onVideoSelect={handleVideoSelect}
            className="lg:hidden"
          />
        )}
      </div>
    </div>
  );
};
