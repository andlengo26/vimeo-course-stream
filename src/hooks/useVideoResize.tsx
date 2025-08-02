import { useEffect, useRef, useState } from 'react';

interface VideoResizeData {
  containerHeight: number;
  videoHeight: number;
  aspectRatio: number;
}

export const useVideoResize = (aspectRatio: number = 16/9) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<VideoResizeData>({
    containerHeight: 0,
    videoHeight: 0,
    aspectRatio
  });

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      
      // Calculate optimal video height based on aspect ratio
      const videoHeightFromWidth = containerWidth / aspectRatio;
      const videoWidthFromHeight = containerHeight * aspectRatio;
      
      let finalVideoHeight: number;
      
      if (videoHeightFromWidth <= containerHeight) {
        // Video fits by width
        finalVideoHeight = videoHeightFromWidth;
      } else {
        // Video fits by height
        finalVideoHeight = containerHeight;
      }

      setDimensions({
        containerHeight,
        videoHeight: finalVideoHeight,
        aspectRatio
      });
    };

    const resizeObserver = new ResizeObserver(updateDimensions);
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      updateDimensions(); // Initial calculation
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [aspectRatio]);

  return {
    containerRef,
    dimensions,
    style: {
      height: `${dimensions.videoHeight}px`,
      maxHeight: '100%'
    }
  };
};