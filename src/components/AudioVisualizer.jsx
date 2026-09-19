import React, { useEffect, useRef } from 'react';

export function AudioVisualizer({ isPlaying, audioRef }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Synthetic wave animation if audio context is not connected or idle
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const numBars = 36;
      const barWidth = (width / numBars) - 2;

      for (let i = 0; i < numBars; i++) {
        let barHeight = 4;

        if (isPlaying) {
          // Dynamic wave formula simulating frequency bins
          const freq = Math.sin(phase + i * 0.28) * 0.5 + 0.5;
          const bass = Math.sin(phase * 1.5 + (i % 6)) * 0.3 + 0.5;
          barHeight = Math.max(6, (freq * 0.7 + bass * 0.3) * (height - 10));
        }

        const x = i * (barWidth + 2);
        const y = height - barHeight;

        // Gradient color for each bar
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(0.5, '#a855f7');
        gradient.addColorStop(1, '#06b6d4');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, y, barWidth, barHeight, 3) : ctx.rect(x, y, barWidth, barHeight);
        ctx.fill();
      }

      if (isPlaying) {
        phase += 0.08;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="visualizer-canvas"
      width={320}
      height={48}
    />
  );
}
