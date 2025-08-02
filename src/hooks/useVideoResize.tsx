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
      
      // Calculate video height based on aspect ratio and container width
      const videoHeight = containerWidth / aspectRatio;
      
      setDimensions({
        containerHeight: videoHeight,
        videoHeight: videoHeight,
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
      width: '100%'
    }
  };
};