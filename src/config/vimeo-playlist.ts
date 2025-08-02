// Vimeo Playlist Configuration
// Update this configuration object to modify playlist settings
export const vimeoPlaylistConfig = {
  title: 'Activity Introduction Videos',
  videoUrls: [
    'https://vimeo.com/1099589618', // Sample Vimeo videos for demo
    'https://vimeo.com/1104353286',
    'https://vimeo.com/1104353404',
    'https://vimeo.com/1104353654'
  ],
  continuousPlay: true,
  autoplay: true, // Whether to automatically start playing videos
  showEndScreen: true,
  // Optional: Moodle integration settings
  moodleActivityId: null, // Set this for Moodle completion tracking
  moodleUserId: null,
  moodleCourseId: null
};

export interface VideoMetadata {
  url: string;
  title: string;
  thumbnail: string;
  duration: number;
  description?: string;
  videoId: string;
  width?: number;
  height?: number;
}

export interface PlaylistState {
  currentVideoIndex: number;
  watchedVideos: Set<string>;
  isCompleted: boolean;
  showEndScreen: boolean;
}

// Cache key for localStorage
export const CACHE_KEYS = {
  METADATA: 'vimeo_playlist_metadata',
  PROGRESS: 'vimeo_playlist_progress'
} as const;