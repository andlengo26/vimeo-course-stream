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
      console.warn('Moodle completion service not available');
      return false;
    }

    try {
      // Use Moodle's AMD module system to load completion module
      const completion = await this.loadMoodleCompletion();
      
      if (completion && completion.mark_complete) {
        await completion.mark_complete({
          cmid: this.config.activityId,
          userid: this.config.userId,
          courseid: this.config.courseId
        });
        
        console.log('Activity marked as complete in Moodle');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error marking activity complete:', error);
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
      console.error('Error updating progress:', error);
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
      console.error('Error sending completion event:', error);
    }
  }
}