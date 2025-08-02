// Vimeo Playlist Configuration
// Update this configuration object to modify playlist settings
export const vimeoPlaylistConfig = {
  title: 'Course Introduction Videos',
  videoUrls: [
    'https://vimeo.com/76979871', // Sample Vimeo videos for demo
    'https://vimeo.com/148751763',
    'https://vimeo.com/190062231',
    'https://vimeo.com/287100241'
  ],
  continuousPlay: true,
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