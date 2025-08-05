
import { createRoot } from 'react-dom/client';
import { VimeoPlaylist } from './components/VimeoPlaylist';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { vimeoPlaylistConfig } from '@/config/vimeo-playlist';
import './index.css';

console.log('Main.tsx: Starting app initialization');

// Find container and initialize app
const container = document.getElementById('vimeo-playlist-root') || document.getElementById('root');

if (!container) {
  console.error('No container found for React app');
} else {
  console.log('Main.tsx: Container found, checking for Moodle config');
  
  // Update config from Moodle if available
  if (typeof window !== 'undefined' && (window as any).MoodleVimeoConfig) {
    console.log('Main.tsx: MoodleVimeoConfig found, applying configuration');
    const moodleConfig = (window as any).MoodleVimeoConfig;
    Object.assign(vimeoPlaylistConfig, {
      videoUrls: Array.isArray(moodleConfig.videoUrls) ? moodleConfig.videoUrls : vimeoPlaylistConfig.videoUrls,
      continuousPlay: moodleConfig.continuousPlay ?? vimeoPlaylistConfig.continuousPlay,
      autoplay: moodleConfig.autoplay ?? vimeoPlaylistConfig.autoplay,
      showEndScreen: moodleConfig.showEndScreen ?? vimeoPlaylistConfig.showEndScreen,
      moodleActivityId: moodleConfig.moodleActivityId,
      moodleUserId: moodleConfig.moodleUserId,
      moodleCourseId: moodleConfig.moodleCourseId
    });
    console.log('Main.tsx: Configuration updated:', vimeoPlaylistConfig);
  }

  console.log('Main.tsx: Rendering React app');
  
  try {
    const root = createRoot(container);
    root.render(
      <ErrorBoundary>
        <TooltipProvider>
          <VimeoPlaylist />
          <Toaster />
        </TooltipProvider>
      </ErrorBoundary>
    );
    console.log('Main.tsx: React app rendered successfully');
  } catch (error) {
    console.error('Main.tsx: Failed to render React app:', error);
  }
}
