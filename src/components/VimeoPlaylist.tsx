import { useEffect, useState, useCallback } from 'react';
import { VimeoPlayer } from './VimeoPlayer';
import { PlaylistSidebar } from './PlaylistSidebar';
import { CompletionScreen } from './CompletionScreen';
import { vimeoPlaylistConfig, VideoMetadata, PlaylistState, CACHE_KEYS } from '@/config/vimeo-playlist';
import { VimeoApiService } from '@/services/vimeo-api';
import { MoodleCompletionService } from '@/services/moodle-completion';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const VimeoPlaylist = () => {
  const { toast } = useToast();
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [playlistState, setPlaylistState] = useState<PlaylistState>({
    currentVideoIndex: 0,
    watchedVideos: new Set(),
    isCompleted: false,
    showEndScreen: false
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
    loadProgress();
  }, []);

  // Save progress to localStorage whenever state changes
  useEffect(() => {
    saveProgress();
  }, [playlistState]);

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

  const loadProgress = () => {
    try {
      const saved = localStorage.getItem(CACHE_KEYS.PROGRESS);
      if (saved) {
        const progress = JSON.parse(saved);
        setPlaylistState(prevState => ({
          ...prevState,
          watchedVideos: new Set(progress.watchedVideos || []),
          currentVideoIndex: progress.currentVideoIndex || 0
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
      showEndScreen: allWatched && vimeoPlaylistConfig.showEndScreen
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
        title: "Course Complete! 🎉",
        description: "You have finished all videos in this course.",
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
      
      // Close sidebar on mobile after selection
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    }
  }, [videos.length]);

  const handleRestart = useCallback(() => {
    setPlaylistState({
      currentVideoIndex: 0,
      watchedVideos: new Set(),
      isCompleted: false,
      showEndScreen: false
    });
    
    toast({
      title: "Course restarted",
      description: "You can now watch all videos again.",
    });
  }, [toast]);

  const handleRetry = () => {
    loadPlaylistData();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="w-full aspect-video rounded-lg" />
              <Skeleton className="h-8 w-3/4 mt-4" />
            </div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-16 h-10 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
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

  const currentVideo = videos[playlistState.currentVideoIndex];

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player Area */}
          <div className="lg:col-span-2">
            <div className="sticky top-4">
              {playlistState.showEndScreen ? (
                <CompletionScreen onRestart={handleRestart} />
              ) : currentVideo ? (
                <VimeoPlayer
                  video={currentVideo}
                  onVideoEnd={handleVideoEnd}
                  className="w-full"
                />
              ) : (
                <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">No video available</p>
                </div>
              )}
              
              {/* Video Info */}
              {!playlistState.showEndScreen && currentVideo && (
                <div className="mt-4 p-4 bg-card rounded-lg border">
                  <h1 className="text-xl font-bold mb-2">{vimeoPlaylistConfig.title}</h1>
                  <p className="text-muted-foreground text-sm">
                    Video {playlistState.currentVideoIndex + 1} of {videos.length}
                  </p>
                  {currentVideo.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {currentVideo.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-4">
              <PlaylistSidebar
                videos={videos}
                currentVideoIndex={playlistState.currentVideoIndex}
                watchedVideos={playlistState.watchedVideos}
                isOpen={true}
                onVideoSelect={handleVideoSelect}
                onToggle={() => {}}
                className="relative transform-none shadow-none border rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <PlaylistSidebar
          videos={videos}
          currentVideoIndex={playlistState.currentVideoIndex}
          watchedVideos={playlistState.watchedVideos}
          isOpen={sidebarOpen}
          onVideoSelect={handleVideoSelect}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>
    </div>
  );
};