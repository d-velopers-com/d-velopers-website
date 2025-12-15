"use client";

import { useEffect, useState, memo } from "react";
import { useSnowfall } from "@/contexts/snowfall-context";

interface Snowflake {
  id: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
  size: number;
  opacity: number;
}

/**
 * Snowfall effect component - adds falling snowflakes to the page
 * Only renders during December and when enabled by user
 */
const Snowfall = memo(function Snowfall() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
  const { isSnowEnabled, isDecember } = useSnowfall();

  useEffect(() => {
    // Generate snowflakes
    const flakes: Snowflake[] = [];
    const count = 50; // Number of snowflakes

    for (let i = 0; i < count; i++) {
      flakes.push({
        id: i,
        left: Math.random() * 100, // Random horizontal position (%)
        animationDuration: 5 + Math.random() * 10, // 5-15 seconds
        animationDelay: Math.random() * 5, // 0-5 seconds delay
        size: 4 + Math.random() * 8, // 4-12px
        opacity: 0.4 + Math.random() * 0.4, // 0.4-0.8
      });
    }

    setSnowflakes(flakes);
  }, []);

  // Don't render if not December or snow is disabled
  if (!isDecember || !isSnowEnabled) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      aria-hidden="true"
    >
      <style jsx>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
          }
        }
      `}</style>

      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${flake.left}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animation: `snowfall ${flake.animationDuration}s linear ${flake.animationDelay}s infinite`,
            boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
          }}
        />
      ))}
    </div>
  );
});

export default Snowfall;
