import { VideoMetadata } from '@/config/vimeo-playlist';
import { Button } from '@/components/ui/button';
import { Check, List, Play, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface VideoProgressBarProps {
  videos: VideoMetadata[];
  currentVideoIndex: number;
  watchedVideos: Set<string>;
  onToggleSidebar: () => void;
  onVideoSelect: (index: number) => void;
  className?: string;
}

export const VideoProgressBar = ({
  videos,
  currentVideoIndex,
  watchedVideos,
  onToggleSidebar,
  onVideoSelect,
  className = ''
}: VideoProgressBarProps) => {
  const { toast } = useToast();
  const completedCount = watchedVideos.size;
  const totalCount = videos.length;

  const handleVideoClick = (index: number, video: VideoMetadata) => {
    if (video.videoId === 'unknown' || video.title === 'Video Unavailable') {
      toast({
        title: "Video Unavailable",
        description: "This video could not be loaded. Please try refreshing the page or contact support.",
        variant: "destructive"
      });
      return;
    }
    onVideoSelect(index);
  };

  return (
    <div className={cn(
      "fixed top-0 right-0 h-full w-16 bg-sidebar border-l border-sidebar-border",
      "flex flex-col items-center py-3 z-40 shadow-elegant",
      className
    )}>
      {/* Sidebar Toggle Button */}
      <Button
        onClick={onToggleSidebar}
        variant="ghost"
        size="sm"
        className="w-10 h-10 p-0 mb-4 hover:bg-sidebar-accent rounded-lg"
        aria-label="Open playlist"
      >
        <List className="w-5 h-5" />
      </Button>

      {/* Vertical Video Icons */}
      <div className="flex-1 flex flex-col items-center justify-start gap-2 overflow-y-auto py-2">
        {videos.map((video, index) => {
          const isActive = index === currentVideoIndex;
          const isWatched = watchedVideos.has(video.videoId);
          const isUnavailable = video.videoId === 'unknown' || video.title === 'Video Unavailable';
          
          return (
            <Button
              key={video.videoId || index}
              onClick={() => handleVideoClick(index, video)}
              variant="ghost"
              size="sm"
              disabled={isUnavailable}
              className={cn(
                "w-10 h-10 p-0 relative group",
                "transition-all duration-200 ease-smooth",
                "hover:scale-110 hover:shadow-sm",
                isActive && "bg-primary/20 border border-primary/30",
                isWatched && !isActive && "bg-success/10",
                isUnavailable && "opacity-50 cursor-not-allowed"
              )}
              aria-label={`Video ${index + 1}: ${video.title}${isWatched ? ' (completed)' : ''}${isUnavailable ? ' (unavailable)' : ''}`}
            >
              <div className="relative">
                {/* Video Icon */}
                <Video className={cn(
                  "w-4 h-4",
                  isActive ? "text-primary" : 
                  isWatched ? "text-success" :
                  isUnavailable ? "text-muted-foreground" : "text-sidebar-foreground"
                )} />
                
                {/* Status Indicator */}
                {isWatched && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full flex items-center justify-center">
                    <Check className="w-2 h-2 text-success-foreground" />
                  </div>
                )}
                
                {isActive && !isWatched && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                    <Play className="w-1.5 h-1.5 text-primary-foreground" />
                  </div>
                )}

                {/* Error indicator for unavailable videos */}
                {isUnavailable && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full flex items-center justify-center">
                    <span className="text-[8px] text-destructive-foreground">!</span>
                  </div>
                )}
              </div>

              {/* Tooltip on hover */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border rounded text-xs text-popover-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {video.title}
                {isWatched && " ✓"}
                {isUnavailable && " (unavailable)"}
              </div>
            </Button>
          );
        })}
      </div>

      {/* Progress Summary */}
      <div className="mt-2 text-center">
        <div className="text-xs font-medium text-sidebar-foreground">
          {completedCount}
        </div>
        <div className="text-xs text-muted-foreground">
          {totalCount}
        </div>
        {completedCount === totalCount && totalCount > 0 && (
          <Check className="w-4 h-4 text-success mx-auto mt-1" />
        )}
      </div>
    </div>
  );
};