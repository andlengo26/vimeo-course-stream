/**
 * Moodle Completion Service
 * Handles integration with Moodle's activity completion API
 */

export interface MoodleCompletionConfig {
  activityId: string | number;
  userId: string | number;
  courseId: string | number;
}

export class MoodleCompletionService {
  private static config: MoodleCompletionConfig | null = null;

  /**
   * Initialize the service with Moodle configuration
   */
  static initialize(config: MoodleCompletionConfig): void {
    this.config = config;
  }

  /**
   * Check if Moodle integration is available
   */
  static isAvailable(): boolean {
    return this.config !== null && 
           typeof window !== 'undefined' && 
           'M' in window && 
           typeof (window as any).M === 'object';
  }

  /**
   * Mark the activity as complete in Moodle
   */
  static async markComplete(): Promise<boolean> {
    if (!this.isAvailable() || !this.config) {
      return false;
    }

    try {
      // Use Moodle's AJAX API to call external function
      if (typeof (window as any).M?.util?.js_call_amd === 'function') {
        const ajax = await new Promise<any>((resolve, reject) => {
          (window as any).require(['core/ajax'], resolve, reject);
        });
        
        const request = {
          methodname: 'mod_eljwplayer_track_completion',
          args: {
            cmid: this.config.activityId,
            videoid: 'all',
            completed: 1
          }
        };

        const response = await ajax.call([request])[0];
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update progress in Moodle (if supported)
   */
  static async updateProgress(completedCount: number, totalCount: number): Promise<void> {
    if (!this.isAvailable() || !this.config) {
      return;
    }

    try {
      const progressPercent = Math.round((completedCount / totalCount) * 100);
      
      // Custom event for Moodle progress tracking
      const event = new CustomEvent('moodle_progress_update', {
        detail: {
          activityId: this.config.activityId,
          progress: progressPercent,
          completed: completedCount,
          total: totalCount
        }
      });
      
      window.dispatchEvent(event);
    } catch (error) {
      // Silent fail for progress updates
    }
  }

  /**
   * Load Moodle's completion module using AMD
   */
  private static loadMoodleCompletion(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (typeof (window as any).require === 'function') {
        (window as any).require(['core/completion'], 
          (completion: any) => resolve(completion),
          (error: any) => reject(error)
        );
      } else {
        // Fallback: try to access completion directly
        const M = (window as any).M;
        if (M && M.core && M.core.completion) {
          resolve(M.core.completion);
        } else {
          reject(new Error('Moodle completion module not found'));
        }
      }
    });
  }

  /**
   * Send custom completion event (fallback method)
   */
  static sendCompletionEvent(eventType: 'progress' | 'complete', data: any): void {
    try {
      const event = new CustomEvent(`vimeo_playlist_${eventType}`, {
        detail: {
          ...data,
          timestamp: new Date().toISOString(),
          config: this.config
        }
      });
      
      window.dispatchEvent(event);
      
      // Also try to call any registered global handlers
      const globalHandler = (window as any).vimeoPlaylistCompletionHandler;
      if (typeof globalHandler === 'function') {
        globalHandler(eventType, data);
      }
    } catch (error) {
      // Silent fail for completion events
    }
  }
}