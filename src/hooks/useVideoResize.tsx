import { useEffect, useRef, useState } from 'react';

interface VideoResizeData {
  containerHeight: number;
  videoHeight: number;
  aspectRatio: number;
}

export const useVideoResize = (aspectRatio: number = 16/9, videoWidth?: number, videoHeight?: number) => {
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
      
      // Use actual video dimensions if available, otherwise fall back to aspect ratio
      let calculatedAspectRatio = aspectRatio;
      if (videoWidth && videoHeight && videoWidth > 0 && videoHeight > 0) {
        calculatedAspectRatio = videoWidth / videoHeight;
      }
      
      // Calculate video height based on aspect ratio and container width
      const calculatedVideoHeight = containerWidth / calculatedAspectRatio;
      
      setDimensions({
        containerHeight: calculatedVideoHeight,
        videoHeight: calculatedVideoHeight,
        aspectRatio: calculatedAspectRatio
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
  }, [aspectRatio, videoWidth, videoHeight]);

  return {
    containerRef,
    dimensions,
    style: {
      height: `${dimensions.videoHeight}px`,
      width: '100%'
    }
  };
};