
import { createRoot } from 'react-dom/client';
import { VimeoPlaylist } from './components/VimeoPlaylist';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { vimeoPlaylistConfig } from '@/config/vimeo-playlist';
import './index.css';

// Find container and initialize app
const container = document.getElementById('vimeo-playlist-root') || document.getElementById('root');

if (!container) {
  console.error('No container found for React app');
} else {
  // Update config from Moodle if available
  if (typeof window !== 'undefined' && (window as any).MoodleConfig) {
    const moodleConfig = (window as any).MoodleConfig;
    Object.assign(vimeoPlaylistConfig, {
      videoUrls: Array.isArray(moodleConfig.vimeoUrls) ? moodleConfig.vimeoUrls : vimeoPlaylistConfig.videoUrls,
      continuousPlay: moodleConfig.continuousPlay ?? vimeoPlaylistConfig.continuousPlay,
      autoplay: moodleConfig.autoplay ?? vimeoPlaylistConfig.autoplay,
      showEndScreen: moodleConfig.showEndScreen ?? vimeoPlaylistConfig.showEndScreen,
      moodleActivityId: moodleConfig.activityId,
      moodleUserId: moodleConfig.userId,
      moodleCourseId: moodleConfig.courseId
    });
  }

  // Render the app
  const root = createRoot(container);
  root.render(
    <TooltipProvider>
      <VimeoPlaylist />
      <Toaster />
    </TooltipProvider>
  );
}
