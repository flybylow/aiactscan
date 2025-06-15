import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  isActive: boolean;
  className?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ 
  isActive, 
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      
      if (!isActive) return;

      const bars = 30;
      const barWidth = width / bars;
      const time = Date.now() * 0.005;

      ctx.fillStyle = '#8B5CF6';

      for (let i = 0; i < bars; i++) {
        const barHeight = Math.sin(time + i * 0.5) * 20 + 
                         Math.sin(time * 2 + i * 0.3) * 15 + 
                         Math.random() * 10 + 20;
        
        const x = i * barWidth + barWidth * 0.1;
        const y = (height - Math.abs(barHeight)) / 2;
        
        ctx.fillRect(x, y, barWidth * 0.8, Math.abs(barHeight));
      }
    };

    const animate = () => {
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={80}
      className={`${className} ${isActive ? 'opacity-100' : 'opacity-30'} transition-opacity duration-300`}
    />
  );
};