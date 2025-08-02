import { VideoMetadata } from '@/config/vimeo-playlist';
import { Button } from '@/components/ui/button';
import { Check, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  videos: VideoMetadata[];
  currentVideoIndex: number;
  watchedVideos: Set<string>;
  onToggleSidebar: () => void;
  className?: string;
}

export const ProgressBar = ({
  videos,
  currentVideoIndex,
  watchedVideos,
  onToggleSidebar,
  className = ''
}: ProgressBarProps) => {
  const completedCount = watchedVideos.size;
  const totalCount = videos.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className={cn(
      "fixed top-0 right-0 h-full w-12 bg-sidebar border-l border-sidebar-border",
      "flex flex-col items-center py-3 z-40 shadow-elegant",
      className
    )}>
      {/* Toggle Button */}
      <Button
        onClick={onToggleSidebar}
        variant="ghost"
        size="sm"
        className="w-8 h-8 p-0 mb-3 hover:bg-sidebar-accent"
        aria-label="Open playlist"
      >
        <List className="w-4 h-4" />
      </Button>

      {/* Vertical Progress Bar */}
      <div className="flex-1 w-3 bg-muted rounded-full relative">
        <div
          className="bg-gradient-success rounded-full transition-all duration-500 ease-smooth w-full"
          style={{ height: `${progressPercent}%` }}
        />
        
        {/* Current Video Indicator */}
        <div
          className="absolute w-4 h-4 bg-primary rounded-full border-2 border-sidebar -left-0.5 transform -translate-y-1/2"
          style={{ 
            top: `${totalCount > 0 ? ((currentVideoIndex + 1) / totalCount) * 100 : 0}%` 
          }}
        />
      </div>

      {/* Progress Text */}
      <div className="mt-3 text-center">
        <div className="text-xs font-medium text-sidebar-foreground">
          {completedCount}
        </div>
        <div className="text-xs text-muted-foreground">
          {totalCount}
        </div>
        {progressPercent === 100 && (
          <Check className="w-3 h-3 text-success mx-auto mt-1" />
        )}
      </div>
    </div>
  );
};