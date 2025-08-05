
import { createRoot } from 'react-dom/client'
import { VimeoPlaylist } from './components/VimeoPlaylist'
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { vimeoPlaylistConfig } from '@/config/vimeo-playlist'
import './index.css'

// Function to update config from Moodle
function updateConfigFromMoodle() {
  const moodleConfig = (window as any).MoodleVimeoConfig;
  if (moodleConfig) {
    // Update the config object
    Object.assign(vimeoPlaylistConfig, {
      videoUrls: moodleConfig.videoUrls || vimeoPlaylistConfig.videoUrls,
      continuousPlay: moodleConfig.continuousPlay ?? vimeoPlaylistConfig.continuousPlay,
      autoplay: moodleConfig.autoplay ?? vimeoPlaylistConfig.autoplay,
      showEndScreen: moodleConfig.showEndScreen ?? vimeoPlaylistConfig.showEndScreen,
      moodleActivityId: moodleConfig.moodleActivityId,
      moodleUserId: moodleConfig.moodleUserId,
      moodleCourseId: moodleConfig.moodleCourseId
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
  if ((window as any).MoodleVimeoConfig) {
    // Config already available
    initApp();
  } else {
    // Wait for config or timeout
    window.addEventListener('moodleConfigReady', () => {
      initApp();
    });
    
    // Fallback: initialize after a short delay if no Moodle config
    setTimeout(() => {
      if (!(window as any).MoodleVimeoConfig) {
        initApp();
      }
    }, 1000);
  }
} else {
  // Server-side or immediate initialization
  initApp();
}
