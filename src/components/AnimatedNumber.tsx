"use client";

import React, { useEffect, useRef, useState } from "react";

type AnimatedNumberProps = {
  value: number;
  duration?: number; // ms
  decimals?: number;
  className?: string;
  format?: (v: number) => string;
  startDelay?: number; // ms before starting the animation
};

const easeOutQuad = (t: number) => t * (2 - t);

export default function AnimatedNumber({
  value,
  duration = 800,
  decimals = 0,
  className,
  format,
  startDelay = 0,
}: AnimatedNumberProps) {
  // Start display at 0 so numbers animate on initial mount/page load
  const [display, setDisplay] = useState<number>(0);
  const startRef = useRef<number | null>(null);
  // fromRef holds the starting number for the animation; initialize to 0
  const fromRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any pending timeout/raf
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const startAnimation = () => {
      // animate from fromRef.current to value
      const start = performance.now();
      startRef.current = start;
      const from = fromRef.current;
      const delta = value - from;

      const step = (now: number) => {
        if (!startRef.current) startRef.current = now;
        const elapsed = now - startRef.current;
        const t = Math.min(1, elapsed / duration);
        const eased = easeOutQuad(t);
        const current = from + delta * eased;
        setDisplay(Number(current.toFixed(decimals)));
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          fromRef.current = value;
          rafRef.current = null;
        }
      };

      rafRef.current = requestAnimationFrame(step);
    };

    if (startDelay && startDelay > 0) {
      timeoutRef.current = setTimeout(startAnimation, startDelay);
    } else {
      startAnimation();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration, decimals, startDelay]);

  const defaultFormat = (v: number) => {
    if (decimals === 0) {
      return new Intl.NumberFormat().format(Math.round(v));
    }
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(v);
  };

  return (
    <span className={className}>
      {format ? format(display) : defaultFormat(display)}
    </span>
  );
}
