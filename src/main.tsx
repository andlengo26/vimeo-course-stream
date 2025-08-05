
import { createRoot } from 'react-dom/client'
import { VimeoPlaylist } from './components/VimeoPlaylist'
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { vimeoPlaylistConfig } from '@/config/vimeo-playlist'
import './index.css'

console.log('Main.tsx loaded, starting initialization...');

// Function to update config from Moodle
function updateConfigFromMoodle() {
  console.log('Updating config from Moodle...');
  const moodleConfig = (window as any).MoodleVimeoConfig;
  if (moodleConfig) {
    console.log('Moodle config found:', moodleConfig);
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
  } else {
    console.log('No Moodle config found, using default configuration');
  }
}

// Initialize app
function initApp() {
  console.log('Initializing app...');
  const container = document.getElementById('vimeo-playlist-root') || document.getElementById('root');
  if (!container) {
    console.error('No container found for Vimeo playlist app');
    return;
  }

  updateConfigFromMoodle();

  console.log('Creating React root and rendering app...');
  const root = createRoot(container);
  root.render(
    <TooltipProvider>
      <VimeoPlaylist />
      <Toaster />
    </TooltipProvider>
  );
}

// Initialize based on environment
console.log('Checking environment and initializing...');
if (typeof window !== 'undefined') {
  if ((window as any).MoodleVimeoConfig) {
    // Config already available
    console.log('Moodle config already available, initializing immediately');
    initApp();
  } else {
    // Wait for config or timeout
    console.log('Waiting for Moodle config...');
    window.addEventListener('moodleConfigReady', () => {
      console.log('Moodle config ready event received');
      initApp();
    });
    
    // Fallback: initialize after a short delay if no Moodle config
    setTimeout(() => {
      if (!(window as any).MoodleVimeoConfig) {
        console.log('Timeout reached, no Moodle config found, using default configuration');
        initApp();
      }
    }, 1000);
  }
} else {
  // Server-side or immediate initialization
  console.log('Server-side initialization');
  initApp();
}
