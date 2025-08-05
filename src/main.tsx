
import { createRoot } from 'react-dom/client'
import { VimeoPlaylist } from './components/VimeoPlaylist'
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { vimeoPlaylistConfig } from '@/config/vimeo-playlist'
import './index.css'

// Function to update config from Moodle
function updateConfigFromMoodle() {
  const moodleConfig = (window as any).MoodleConfig;
  if (moodleConfig) {
    // Update the config object
    Object.assign(vimeoPlaylistConfig, {
      videoUrls: moodleConfig.vimeoUrls || vimeoPlaylistConfig.videoUrls,
      continuousPlay: moodleConfig.continuousPlay ?? vimeoPlaylistConfig.continuousPlay,
      autoplay: moodleConfig.autoplay ?? vimeoPlaylistConfig.autoplay,
      showEndScreen: moodleConfig.showEndScreen ?? vimeoPlaylistConfig.showEndScreen,
      moodleActivityId: moodleConfig.activityId,
      moodleUserId: moodleConfig.userId,
      moodleCourseId: moodleConfig.courseId
    });
  }
}

// Initialize app
function initApp() {
  const container = document.getElementById('vimeo-playlist-root') || document.getElementById('root');
  if (!container) {
    return;
  }

  updateConfigFromMoodle();

  const root = createRoot(container);
  root.render(
    <TooltipProvider>
      <VimeoPlaylist />
      <Toaster />
    </TooltipProvider>
  );
}

// Initialize based on environment
if (typeof window !== 'undefined') {
  if ((window as any).MoodleConfig) {
    // Config already available
    initApp();
  } else {
    // Wait for config or timeout
    window.addEventListener('moodle-config-ready', () => {
      initApp();
    });
    
    // Fallback: initialize after a short delay if no Moodle config
    setTimeout(() => {
      if (!(window as any).MoodleConfig) {
        initApp();
      }
    }, 1000);
  }
} else {
  // Server-side or immediate initialization
  initApp();
}
