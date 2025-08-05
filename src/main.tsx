
import { createRoot } from 'react-dom/client'
import { VimeoPlaylist } from './components/VimeoPlaylist'
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { vimeoPlaylistConfig } from '@/config/vimeo-playlist'
import './index.css'

// Simple initialization function
function initApp() {
  // Find the container
  const container = document.getElementById('vimeo-playlist-root') || document.getElementById('root');
  if (!container) {
    console.error('No container found for React app');
    return;
  }

  // Update config from Moodle if available
  if (typeof window !== 'undefined') {
    const moodleConfig = (window as any).MoodleConfig;
    if (moodleConfig) {
      // Safely update config
      try {
        Object.assign(vimeoPlaylistConfig, {
          videoUrls: Array.isArray(moodleConfig.vimeoUrls) ? moodleConfig.vimeoUrls : vimeoPlaylistConfig.videoUrls,
          continuousPlay: moodleConfig.continuousPlay ?? vimeoPlaylistConfig.continuousPlay,
          autoplay: moodleConfig.autoplay ?? vimeoPlaylistConfig.autoplay,
          showEndScreen: moodleConfig.showEndScreen ?? vimeoPlaylistConfig.showEndScreen,
          moodleActivityId: moodleConfig.activityId,
          moodleUserId: moodleConfig.userId,
          moodleCourseId: moodleConfig.courseId
        });
      } catch (error) {
        console.warn('Failed to update config from Moodle:', error);
      }
    }
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

// Initialize the app
if (typeof window !== 'undefined') {
  // Check if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    // DOM is already ready
    initApp();
  }
} else {
  // Server-side - initialize immediately
  initApp();
}
