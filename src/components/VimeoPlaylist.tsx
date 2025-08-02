import { useEffect, useState, useCallback } from 'react';
import { VimeoPlayer } from './VimeoPlayer';
import { PlaylistSidebar } from './PlaylistSidebar';
import { VideoProgressBar } from './VideoProgressBar';
import { CompletionScreen } from './CompletionScreen';
import { vimeoPlaylistConfig, VideoMetadata, PlaylistState, CACHE_KEYS } from '@/config/vimeo-playlist';
import { VimeoApiService } from '@/services/vimeo-api';
import { MoodleCompletionService } from '@/services/moodle-completion';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export const VimeoPlaylist = () => {
  const { toast } = useToast();
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [playlistState, setPlaylistState] = useState<PlaylistState>({
    currentVideoIndex: -1, // Start with -1 to indicate no video selected yet
    watchedVideos: new Set(),
    isCompleted: false,
    showEndScreen: false,
    hasEverCompleted: false
  });

  // Initialize Moodle completion service
  useEffect(() => {
    if (vimeoPlaylistConfig.moodleActivityId) {
      MoodleCompletionService.initialize({
        activityId: vimeoPlaylistConfig.moodleActivityId,
        userId: vimeoPlaylistConfig.moodleUserId || 'current',
        courseId: vimeoPlaylistConfig.moodleCourseId || 'current'
      });
    }
  }, []);

  // Load playlist metadata
  useEffect(() => {
    loadPlaylistData();
  }, []);

  // Load progress from localStorage
  useEffect(() => {
    loadProgressState();
  }, []);

  // Save progress to localStorage whenever state changes
  useEffect(() => {
    saveProgress();
  }, [playlistState]);

  // Handle URL parameters and video loading
  useEffect(() => {
    if (videos.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const videoParam = urlParams.get('video');
      const autoplayParam = urlParams.get('autoplay');
      
      // Set autoplay preference from URL
      if (autoplayParam === 'true') {
        setAutoplay(true);
      }
      
      // Handle video selection from URL parameter
      if (videoParam) {
        const videoIndex = parseInt(videoParam) - 1; // URL is 1-indexed
        if (videoIndex >= 0 && videoIndex < videos.length) {
          setPlaylistState(prevState => ({
            ...prevState,
            currentVideoIndex: videoIndex
          }));
          return;
        }
      }
      
      // If no URL parameter and no current video selected, use saved progress or default to first video
      if (playlistState.currentVideoIndex === -1) {
        const savedProgress = loadProgress();
        const indexToUse = savedProgress.currentVideoIndex >= 0 ? savedProgress.currentVideoIndex : 0;
        setPlaylistState(prevState => ({
          ...prevState,
          currentVideoIndex: indexToUse,
          watchedVideos: savedProgress.watchedVideos,
          isCompleted: savedProgress.isCompleted,
          hasEverCompleted: savedProgress.hasEverCompleted
        }));
      }
    }
  }, [videos]);

  // State for autoplay preference
  const [autoplay, setAutoplay] = useState(vimeoPlaylistConfig.autoplay);

  const loadPlaylistData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const metadata = await VimeoApiService.getPlaylistMetadata(vimeoPlaylistConfig.videoUrls);
      setVideos(metadata);

      // Filter out completely failed videos
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to load playlist';
      setError(errorMessage);
      console.error('Error loading playlist:', err);
      
      toast({
        title: "Error loading playlist",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
      console.error('Error loading progress:', error);
    }
    
    return {
      currentVideoIndex: 0, // Default to first video instead of -1
      watchedVideos: new Set(),
      isCompleted: false,
      showEndScreen: false,
      hasEverCompleted: false
    };
  };

  const loadProgressState = () => {
    try {
      const saved = localStorage.getItem(CACHE_KEYS.PROGRESS);
      if (saved) {
        const progress = JSON.parse(saved);
        setPlaylistState(prevState => ({
          ...prevState,
          watchedVideos: new Set(progress.watchedVideos || []),
          currentVideoIndex: progress.currentVideoIndex !== undefined ? progress.currentVideoIndex : -1
        }));
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
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
      console.error('Error saving progress:', error);
    }
  };

  const handleVideoEnd = useCallback(() => {
    const currentVideo = videos[playlistState.currentVideoIndex];
    if (!currentVideo) return;

    // Mark current video as watched
    const newWatchedVideos = new Set(playlistState.watchedVideos);
    newWatchedVideos.add(currentVideo.videoId);

    // Check if all videos are now watched
    const allWatched = videos.every(video => newWatchedVideos.has(video.videoId));
    
    setPlaylistState(prev => ({
      ...prev,
      watchedVideos: newWatchedVideos,
      isCompleted: allWatched,
      showEndScreen: allWatched && !prev.hasEverCompleted && vimeoPlaylistConfig.showEndScreen,
      hasEverCompleted: prev.hasEverCompleted || allWatched
    }));

    // Update Moodle progress
    MoodleCompletionService.updateProgress(newWatchedVideos.size, videos.length);

    // Auto-advance to next video if continuous play is enabled
    if (vimeoPlaylistConfig.continuousPlay && !allWatched) {
      const nextIndex = playlistState.currentVideoIndex + 1;
      if (nextIndex < videos.length) {
        setTimeout(() => {
          setPlaylistState(prev => ({
            ...prev,
            currentVideoIndex: nextIndex
          }));
        }, 1000); // Small delay before auto-advance
      }
    }

    // Mark activity complete in Moodle if all videos are watched
    if (allWatched) {
      MoodleCompletionService.markComplete();
      
      toast({
        title: "Activity Complete! 🎉",
        description: "You have finished all videos in this activity.",
      });
    }
  }, [videos, playlistState, toast]);

  const handleVideoSelect = useCallback((index: number) => {
    if (index >= 0 && index < videos.length) {
      setPlaylistState(prev => ({
        ...prev,
        currentVideoIndex: index,
        showEndScreen: false
      }));
      
      // Update URL parameter when video is selected
      const url = new URL(window.location.href);
      url.searchParams.set('video', (index + 1).toString());
      window.history.replaceState({}, '', url.toString());
      // Enable autoplay for manually selected videos
      setAutoplay(true);
      
      // Close sidebar on mobile after selection
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    }
  }, [videos.length]);

  const handleRestart = useCallback(() => {
    setPlaylistState(prev => ({
      currentVideoIndex: 0,
      watchedVideos: new Set(),
      isCompleted: false,
      showEndScreen: false,
      hasEverCompleted: prev.hasEverCompleted // Keep the completion flag
    }));
    
    toast({
      title: "Activity restarted",
      description: "You can now watch all videos again.",
    });
  }, [toast]);

  const handleRetry = () => {
    loadPlaylistData();
  };

  // Loading state
  if (isLoading) {
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
