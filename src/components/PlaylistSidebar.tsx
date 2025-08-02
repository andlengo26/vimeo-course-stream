import { VideoMetadata } from '@/config/vimeo-playlist';
import { VimeoApiService } from '@/services/vimeo-api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check, Play, Clock, ChevronRight, ChevronLeft } from 'lucide-react';

interface PlaylistSidebarProps {
  videos: VideoMetadata[];
  currentVideoIndex: number;
  watchedVideos: Set<string>;
  isOpen: boolean;
  onVideoSelect: (index: number) => void;
  onToggle: () => void;
  className?: string;
}

export const PlaylistSidebar = ({
  videos,
  currentVideoIndex,
  watchedVideos,
  isOpen,
  onVideoSelect,
  onToggle,
  className = ''
}: PlaylistSidebarProps) => {
  const completedCount = watchedVideos.size;
  const totalCount = videos.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={onToggle}
        variant="secondary"
        size="sm"
        className={cn(
          "fixed top-4 right-4 z-50 shadow-elegant",
          "transition-all duration-300 ease-smooth",
          isOpen && "right-80 lg:right-96"
        )}
        aria-label={isOpen ? "Close playlist" : "Open playlist"}
      >
        {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        <span className="ml-2 hidden sm:inline">
          {isOpen ? 'Close' : 'Playlist'}
        </span>
      </Button>

      {/* Sidebar Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-80 lg:w-96 bg-video-sidebar border-l border-border",
          "transform transition-transform duration-300 ease-smooth shadow-elegant z-40",
          "flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-subtle">
          <h2 className="text-xl font-bold text-foreground mb-2">Course Videos</h2>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{completedCount} of {totalCount}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-success h-2 rounded-full transition-all duration-500 ease-smooth"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {progressPercent === 100 && (
              <div className="text-success text-sm font-medium flex items-center gap-1">
                <Check className="w-4 h-4" />
                All videos completed!
              </div>
            )}
          </div>
        </div>

        {/* Video List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {videos.map((video, index) => {
              const isActive = index === currentVideoIndex;
              const isWatched = watchedVideos.has(video.videoId);
              
              return (
                <button
                  key={video.videoId}
                  onClick={() => onVideoSelect(index)}
                  className={cn(
                    "w-full p-4 rounded-lg border text-left",
                    "transition-all duration-200 ease-smooth",
                    "hover:shadow-md hover:border-primary/50",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    isActive && "bg-primary/10 border-primary shadow-glow",
                    !isActive && "bg-card border-border hover:bg-video-hover",
                    isWatched && !isActive && "bg-success/5 border-success/20"
                  )}
                  aria-label={`Play video ${index + 1}: ${video.title}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={`Thumbnail for ${video.title}`}
                          className="w-16 h-10 object-cover rounded bg-muted"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-16 h-10 bg-muted rounded flex items-center justify-center">
                          <Play className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Status Indicator */}
                      <div className="absolute -top-1 -right-1">
                        {isWatched ? (
                          <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-success-foreground" />
                          </div>
                        ) : isActive ? (
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <Play className="w-3 h-3 text-primary-foreground" />
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={cn(
                          "font-medium text-sm leading-tight line-clamp-2",
                          isActive ? "text-primary" : "text-foreground"
                        )}>
                          {video.title}
                        </h3>
                        <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
                          {index + 1}
                        </span>
                      </div>
                      
                      {video.duration > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {VimeoApiService.formatDuration(video.duration)}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/50">
          <p className="text-xs text-muted-foreground text-center">
            Complete all videos to finish the course
          </p>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
    </>
  );
};