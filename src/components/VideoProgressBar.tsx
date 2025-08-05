
import { VideoMetadata } from '@/config/vimeo-playlist';
import { Button } from '@/components/ui/button';
import { List, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  className
}: VideoProgressBarProps) => {
  const completedCount = videos.filter(video => watchedVideos.has(video.videoId)).length;
  const progressPercentage = videos.length > 0 ? (completedCount / videos.length) * 100 : 0;

  return (
    <div className={cn("fixed right-0 top-0 bottom-0 w-16 bg-background border-l flex flex-col items-center py-4", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleSidebar}
        className="mb-4"
      >
        <List className="w-4 h-4" />
      </Button>
      
      <div className="flex-1 flex flex-col items-center gap-2 overflow-y-auto">
        {videos.map((video, index) => (
          <Button
            key={video.videoId}
            variant="ghost"
            size="sm"
            className={cn(
              "w-8 h-8 p-0 rounded-full relative",
              currentVideoIndex === index && "bg-primary text-primary-foreground",
              watchedVideos.has(video.videoId) && currentVideoIndex !== index && "bg-green-100 text-green-700"
            )}
            onClick={() => onVideoSelect(index)}
          >
            <span className="text-xs font-medium">{index + 1}</span>
            {watchedVideos.has(video.videoId) && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-2 h-2 text-white" />
              </div>
            )}
          </Button>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-xs text-muted-foreground mb-1">
          {completedCount}/{videos.length}
        </div>
        <div className="w-2 h-20 bg-muted rounded-full overflow-hidden">
          <div 
            className="w-full bg-primary transition-all duration-300"
            style={{ height: `${progressPercentage}%`, marginTop: `${100 - progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
