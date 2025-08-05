
import { VideoMetadata } from '@/config/vimeo-playlist';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, List, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  className
}: PlaylistSidebarProps) => {
  return (
    <div className={cn(
      "fixed inset-y-0 right-0 w-80 lg:w-96 bg-background border-l shadow-lg transform transition-transform duration-300 z-50",
      isOpen ? "translate-x-0" : "translate-x-full",
      "lg:relative lg:translate-x-0 lg:shadow-none",
      className
    )}>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List className="w-5 h-5" />
            <h2 className="font-semibold">Playlist</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {videos.map((video, index) => (
            <Card
              key={video.videoId}
              className={cn(
                "p-3 cursor-pointer transition-colors hover:bg-muted/50",
                currentVideoIndex === index && "ring-2 ring-primary bg-primary/5"
              )}
              onClick={() => onVideoSelect(index)}
            >
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-8 bg-muted rounded flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  {watchedVideos.has(video.videoId) && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium line-clamp-2 mb-1">
                    {video.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : 'Duration unknown'}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
